#!/usr/bin/env python3
"""
松山市議会データの確認スクリプト
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

def check_data():
    """データの確認"""
    print("=" * 60)
    print("松山市議会データの確認")
    print("=" * 60)
    
    # 会議データを取得
    meetings = supabase.table('meetings').select('*').eq('council_name', '松山市議会').execute()
    
    print(f"\n会議数: {len(meetings.data)}")
    
    if meetings.data:
        for meeting in meetings.data:
            print(f"\n会議ID: {meeting['id']}")
            print(f"会議名: {meeting['meeting_name']}")
            print(f"開催日: {meeting['session_date']}")
            print(f"URL: {meeting['source_url']}")
            
            # この会議の発言数を取得
            utterances = supabase.table('utterances').select('id, speaker_name, content').eq('meeting_id', meeting['id']).execute()
            print(f"発言数: {len(utterances.data)}")
            
            if utterances.data:
                print(f"\n最初の発言:")
                first = utterances.data[0]
                print(f"  発言者: {first['speaker_name']}")
                print(f"  内容: {first['content'][:200]}...")

if __name__ == "__main__":
    check_data()
