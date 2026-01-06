#!/usr/bin/env python3
"""
松山市議会のサンプルデータを作成するスクリプト
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# 環境変数の読み込み
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("エラー: SUPABASE_URLとSUPABASE_SERVICE_ROLE_KEYを.envファイルに設定してください")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def create_sample_data():
    """サンプルデータを作成"""
    print("=" * 60)
    print("松山市議会 サンプルデータ作成")
    print("=" * 60)
    
    # 既存データを削除
    print("\n既存データを削除中...")
    existing = supabase.table('meetings').select('id').eq('council_name', '松山市議会').execute()
    for meeting in existing.data:
        supabase.table('utterances').delete().eq('meeting_id', meeting['id']).execute()
        supabase.table('meetings').delete().eq('id', meeting['id']).execute()
    
    # サンプル会議データ
    meeting_data = {
        'council_name': '松山市議会',
        'meeting_type': '定例会',
        'meeting_name': '令和6年12月定例会',
        'session_date': '2024-12-10',
        'session_number': 1,
        'source_url': 'https://example.com/matsuyama/sample'
    }
    
    print("\n会議データを作成中...")
    meeting_result = supabase.table('meetings').insert(meeting_data).execute()
    meeting_id = meeting_result.data[0]['id']
    print(f"会議ID: {meeting_id}")
    
    # サンプル発言データ
    utterances = [
        {
            'meeting_id': meeting_id,
            'speaker_name': '議長',
            'speaker_role': '議長',
            'content': 'ただいまから、令和6年12月定例会を開会いたします。本日の議題は、道後温泉本館の保存修理工事の進捗状況、および松山空港の国際線誘致について、執行部より説明を求めます。',
            'sequence_number': 0,
            'page_number': 1
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '市長',
            'speaker_role': '答弁',
            'content': '道後温泉本館の保存修理工事につきましては、令和6年度も順調に進捗しております。本館は、国の重要文化財に指定されており、伝統的な工法を用いた修理を行っております。現在、屋根瓦の葺き替え作業が完了し、外壁の修復作業に入っております。工事完了は令和8年度を予定しており、完成後は観光客の皆様に、より安全で快適な温泉施設を提供できるものと考えております。',
            'sequence_number': 1,
            'page_number': 1
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '田中議員',
            'speaker_role': '質問',
            'content': '道後温泉本館の修理工事について、工事期間中の観光客への影響はどの程度でしょうか。また、工事完了後の集客見込みについてお聞かせください。',
            'sequence_number': 2,
            'page_number': 2
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '観光部長',
            'speaker_role': '答弁',
            'content': '工事期間中も、道後温泉別館「飛鳥乃湯泉」や「椿の湯」などの施設は通常通り営業しており、観光客の皆様には引き続き道後温泉をお楽しみいただいております。令和5年度の道後温泉地区の観光客数は約280万人で、工事前と比較して約15%の減少となっておりますが、工事完了後は年間350万人以上の集客を見込んでおります。',
            'sequence_number': 3,
            'page_number': 2
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '佐藤議員',
            'speaker_role': '質問',
            'content': '松山空港の国際線誘致について質問いたします。現在の国際線の運航状況と、今後の誘致計画についてお聞かせください。',
            'sequence_number': 4,
            'page_number': 3
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '市長',
            'speaker_role': '答弁',
            'content': '松山空港の国際線につきましては、現在、ソウル線と上海線が週3便ずつ運航しております。今後は、台湾や香港などへの路線拡大を目指し、航空会社との交渉を進めております。また、インバウンド観光客の受け入れ体制強化のため、空港内の多言語案内表示の充実や、Wi-Fi環境の整備を進めてまいります。',
            'sequence_number': 5,
            'page_number': 3
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '山本議員',
            'speaker_role': '質問',
            'content': '国際線の誘致に伴い、市内の宿泊施設や飲食店の受け入れ体制は十分でしょうか。また、多言語対応のガイドの育成状況についてもお聞かせください。',
            'sequence_number': 6,
            'page_number': 4
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '観光部長',
            'speaker_role': '答弁',
            'content': '市内の宿泊施設につきましては、現在約8,000室の客室数があり、繁忙期でも十分な受け入れ能力を有しております。また、多言語対応につきましては、観光ボランティアガイドの育成を進めており、現在、英語、中国語、韓国語に対応できるガイドが約150名おります。今後も、研修会の開催などを通じて、さらなる人材育成に努めてまいります。',
            'sequence_number': 7,
            'page_number': 4
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '鈴木議員',
            'speaker_role': '質問',
            'content': '道後温泉と松山空港の国際線誘致を連携させた観光振興策について、市としてどのような取り組みを考えておられますか。',
            'sequence_number': 8,
            'page_number': 5
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '市長',
            'speaker_role': '答弁',
            'content': '道後温泉と国際線を活用した観光振興につきましては、海外の旅行会社と連携し、道後温泉を中心とした観光ルートの開発を進めております。また、松山城や坊っちゃん列車など、市内の観光資源を組み合わせた魅力的なツアーを企画し、海外からの観光客誘致に努めてまいります。さらに、SNSを活用した情報発信や、現地でのプロモーション活動も積極的に展開してまいります。',
            'sequence_number': 9,
            'page_number': 5
        },
        {
            'meeting_id': meeting_id,
            'speaker_name': '議長',
            'speaker_role': '議長',
            'content': '以上で本日の議題は終了いたしました。次回の定例会は令和7年3月を予定しております。これにて閉会いたします。',
            'sequence_number': 10,
            'page_number': 6
        }
    ]
    
    print(f"\n発言データを作成中... ({len(utterances)}件)")
    supabase.table('utterances').insert(utterances).execute()
    
    print("\n" + "=" * 60)
    print("サンプルデータ作成完了")
    print("=" * 60)
    print(f"会議ID: {meeting_id}")
    print(f"会議名: {meeting_data['meeting_name']}")
    print(f"発言数: {len(utterances)}件")

if __name__ == "__main__":
    create_sample_data()
