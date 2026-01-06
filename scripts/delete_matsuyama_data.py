#!/usr/bin/env python3
"""
既存の松山市議会データを削除するスクリプト
"""

import os
import sys
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

def delete_matsuyama_data():
    """松山市議会のデータを削除"""
    print("=" * 60)
    print("松山市議会データの削除")
    print("=" * 60)
    
    # 会議データを取得
    meetings = supabase.table('meetings').select('id').eq('council_name', '松山市議会').execute()
    
    if not meetings.data:
        print("\n削除するデータがありません")
        return
    
    print(f"\n削除する会議数: {len(meetings.data)}")
    
    for meeting in meetings.data:
        meeting_id = meeting['id']
        
        # 発言を削除（CASCADE設定があるので自動削除されるはずだが、念のため）
        utterances = supabase.table('utterances').delete().eq('meeting_id', meeting_id).execute()
        print(f"  会議ID {meeting_id} の発言を削除")
        
        # 会議を削除
        supabase.table('meetings').delete().eq('id', meeting_id).execute()
        print(f"  会議ID {meeting_id} を削除")
    
    print("\n削除完了")

if __name__ == "__main__":
    delete_matsuyama_data()
