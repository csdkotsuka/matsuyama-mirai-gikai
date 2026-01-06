#!/usr/bin/env python3
"""
松山市議会の会議録をスクレイピングしてSupabaseにインポートするスクリプト
"""

import os
import sys
import time
from datetime import datetime
from typing import List, Dict, Optional
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
from supabase import create_client, Client

# 環境変数の読み込み
load_dotenv()

# Supabaseクライアントの初期化
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("エラー: SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを.envファイルに設定してください")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# 松山市議会のURL
BASE_URL = "https://ssp.kaigiroku.net/tenant/matsuyama/pg/index.html"


def setup_driver() -> webdriver.Chrome:
    """Seleniumドライバーのセットアップ"""
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # ヘッドレスモード（デバッグ用に一時的に無効化）
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver



def get_recent_meetings(driver: webdriver.Chrome, max_meetings: int = 3) -> List[Dict]:
    """直近の会議一覧を取得"""
    print("会議一覧ページにアクセス中...")
    driver.get("https://ssp.kaigiroku.net/tenant/matsuyama/MinuteBrowse.html")
    
    # ページが完全に読み込まれるまで待機
    wait = WebDriverWait(driver, 15)
    
    # 年度選択（2024年を選択）
    try:
        # 年度セレクトボックスが表示されるまで待機
        wait.until(EC.presence_of_element_located((By.ID, "view_year_select")))
        time.sleep(2)  # JavaScriptの実行を待つ
        
        driver.execute_script("""
            const select = document.getElementById("view_year_select");
            if (select) {
                select.value = "2024";
                select.dispatchEvent(new Event('change'));
            }
        """)
        time.sleep(3)  # 会議リストの更新を待つ
    except Exception as e:
        print(f"年度選択エラー: {e}")
        print("デフォルトの年度で続行します")
    
    # 会議一覧を取得
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    meeting_links = soup.select(".link-council")
    
    print(f"ページから見つかった会議リンク数: {len(meeting_links)}")
    
    meetings = []
    for i, link in enumerate(meeting_links[:max_meetings]):
        meeting_name = link.get_text(strip=True)
        
        if meeting_name:
            meetings.append({
                'name': meeting_name,
                'index': i  # リンクのインデックスを保存
            })
    
    print(f"取得した会議数: {len(meetings)}")
    return meetings


def get_meeting_content(driver: webdriver.Chrome, meeting_index: int) -> Dict:
    """会議の内容を取得"""
    print(f"会議内容を取得中...")
    
    # 会議リンクをクリック
    driver.execute_script(f"""
        const links = document.querySelectorAll(".link-council");
        if (links[{meeting_index}]) {{
            links[{meeting_index}].click();
        }}
    """)
    time.sleep(5)  # ページ読み込みを待つ
    
    # 会議録タブが存在するか確認
    tab_exists = driver.execute_script("""
        return document.getElementById('tab-minute-plain') !== null;
    """)
    
    if tab_exists:
        print("  会議録タブを検出、クリック中...")
        # 会議録タブをクリック
        driver.execute_script("""
            const tab = document.getElementById('tab-minute-plain');
            if (tab) {
                tab.click();
            }
        """)
        time.sleep(5)  # コンテンツの読み込みを待つ
        
        # コンテンツが表示されるまで待機
        for i in range(10):
            content_loaded = driver.execute_script("""
                const frame = document.getElementById('baseframe');
                return frame && frame.innerText.length > 100;
            """)
            if content_loaded:
                print(f"  コンテンツ読み込み完了（{i+1}回目の確認）")
                break
            print(f"  コンテンツ読み込み待機中...（{i+1}/10）")
            time.sleep(2)
    else:
        print("  警告: 会議録タブが見つかりません。目次から取得を試みます。")
    
    # 会議録全文を取得
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    # baseframe内のテキストを取得
    content_div = soup.find('div', id='baseframe')
    if not content_div:
        # 代替: minute-plain-view を探す
        content_div = soup.find('div', class_='minute-plain-view')
    
    if not content_div:
        # さらに代替: body全体から取得
        print("  警告: 専用コンテナが見つかりません。body全体から取得します。")
        content_div = soup.find('body')
    
    if not content_div:
        print("  エラー: コンテンツが見つかりません")
        return {'utterances': [], 'source_url': driver.current_url}
    
    full_text = content_div.get_text(strip=False)
    print(f"  取得したテキスト長: {len(full_text)} 文字")
    
    # 発言の抽出
    utterances = []
    lines = full_text.split('\n')
    
    sequence = 0
    current_speaker = "不明"
    current_content = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # ナビゲーション要素をスキップ
        if line in ['メインコンテンツへ移動', 'トップへ', 'ヘルプ', '会議一覧へ', '目次', '日程一覧', '資料一覧']:
            continue
        
        # 発言者の検出（○または◎で始まる行）
        if line.startswith('○') or line.startswith('◎'):
            # 前の発言を保存
            if current_content and len(''.join(current_content)) > 10:  # 最小文字数チェック
                utterances.append({
                    'speaker_name': current_speaker,
                    'speaker_role': '発言',
                    'content': '\n'.join(current_content),
                    'sequence_number': sequence,
                    'page_number': None
                })
                sequence += 1
                current_content = []
            
            # 新しい発言者（○や◎を除去）
            current_speaker = line.replace('○', '').replace('◎', '').strip()
            # 発言者名の後に続く内容も含める
            if current_speaker:
                # 発言者名と発言内容が同じ行にある場合を処理
                parts = current_speaker.split(None, 1)
                if len(parts) > 1:
                    current_speaker = parts[0]
                    current_content.append(parts[1])
        else:
            # 発言内容
            current_content.append(line)
    
    # 最後の発言を保存
    if current_content and len(''.join(current_content)) > 10:
        utterances.append({
            'speaker_name': current_speaker,
            'speaker_role': '発言',
            'content': '\n'.join(current_content),
            'sequence_number': sequence,
            'page_number': None
        })
    
    print(f"  取得した発言数: {len(utterances)}")
    
    # デバッグ: 最初の発言を表示
    if utterances:
        first = utterances[0]
        print(f"  最初の発言者: {first['speaker_name']}")
        print(f"  最初の発言内容（抜粋）: {first['content'][:100]}...")
    
    return {
        'utterances': utterances,
        'source_url': driver.current_url
    }



def parse_session_date(meeting_name: str) -> Optional[datetime]:
    """会議名から日付を抽出"""
    import re
    
    # 例: "令和　６年１２月定例会" -> 2024-12-01
    match = re.search(r'令和\s*(\d+)年\s*(\d+)月', meeting_name)
    if match:
        reiwa_year = int(match.group(1))
        month = int(match.group(2))
        # 令和6年 = 2024年
        year = 2018 + reiwa_year
        try:
            return datetime(year, month, 1)
        except ValueError:
            return None
    return None


def import_to_supabase(meeting_data: Dict, content_data: Dict):
    """データをSupabaseにインポート"""
    print("データベースにインポート中...")
    
    session_date = parse_session_date(meeting_data['name'])
    
    # 会議データを挿入
    meeting_record = {
        'council_name': '松山市議会',
        'meeting_type': '定例会' if '定例会' in meeting_data['name'] else '委員会',
        'meeting_name': meeting_data['name'],
        'session_date': session_date.isoformat() if session_date else None,
        'session_number': 1,
        'source_url': content_data['source_url']
    }
    
    # 既存の会議をチェック
    existing = supabase.table('meetings').select('id').eq(
        'source_url', content_data['source_url']
    ).execute()
    
    if existing.data:
        print(f"  既にインポート済み: {meeting_data['name']}")
        return
    
    # 会議を挿入
    meeting_result = supabase.table('meetings').insert(meeting_record).execute()
    meeting_id = meeting_result.data[0]['id']
    print(f"  会議を挿入: {meeting_id}")
    
    # 発言データを挿入
    utterances_to_insert = []
    for utterance in content_data['utterances']:
        utterances_to_insert.append({
            'meeting_id': meeting_id,
            'speaker_name': utterance['speaker_name'],
            'speaker_role': utterance['speaker_role'],
            'content': utterance['content'],
            'sequence_number': utterance['sequence_number'],
            'page_number': utterance['page_number']
        })
    
    if utterances_to_insert:
        supabase.table('utterances').insert(utterances_to_insert).execute()
        print(f"  発言を挿入: {len(utterances_to_insert)}件")


def main():
    """メイン処理"""
    print("=" * 60)
    print("松山市議会 会議録スクレイピング開始")
    print("=" * 60)
    
    driver = None
    try:
        driver = setup_driver()
        
        # 直近の会議を取得
        meetings = get_recent_meetings(driver, max_meetings=1)
        
        for meeting in meetings:
            print(f"\n処理中: {meeting['name']}")
            
            # 会議内容を取得
            content_data = get_meeting_content(driver, meeting['index'])
            
            # データベースにインポート
            import_to_supabase(meeting, content_data)
        
        print("\n" + "=" * 60)
        print("スクレイピング完了")
        print("=" * 60)
        
    except Exception as e:
        print(f"\nエラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        if driver:
            driver.quit()


if __name__ == "__main__":
    main()
