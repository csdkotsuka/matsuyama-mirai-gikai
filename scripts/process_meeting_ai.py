#!/usr/bin/env python3
"""
松山市議会データのAI処理スクリプト
- Embedding生成（Google Gemini API）
- 会議要約生成
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai

# 環境変数の読み込み
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not all([SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_API_KEY]):
    print("エラー: 必要な環境変数が設定されていません")
    print("- SUPABASE_URL")
    print("- SUPABASE_SERVICE_ROLE_KEY")
    print("- GOOGLE_API_KEY")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
genai.configure(api_key=GOOGLE_API_KEY)

def generate_embedding(text: str) -> list:
    """テキストのembeddingを生成"""
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']

def generate_summary(meeting_name: str, utterances: list) -> str:
    """会議の要約を生成"""
    # 全発言を結合
    full_text = f"会議名: {meeting_name}\n\n"
    for utt in utterances:
        full_text += f"{utt['speaker_name']}: {utt['content']}\n\n"
    
    # 要約を生成
    model = genai.GenerativeModel('gemini-3-flash-preview')
    response = model.generate_content(
        f"あなたは地方議会の会議録を要約する専門家です。以下の会議録を200文字程度で要約してください:\n\n{full_text[:8000]}"
    )
    
    return response.text

def process_meeting(meeting_id: str):
    """会議データのAI処理"""
    print(f"\n会議ID: {meeting_id} を処理中...")
    
    # 会議データを取得
    meeting = supabase.table('meetings').select('*').eq('id', meeting_id).execute()
    if not meeting.data:
        print("エラー: 会議が見つかりません")
        return
    
    meeting_data = meeting.data[0]
    meeting_name = meeting_data['meeting_name']
    print(f"会議名: {meeting_name}")
    
    # 発言データを取得
    utterances = supabase.table('utterances').select('*').eq('meeting_id', meeting_id).order('sequence_number').execute()
    print(f"発言数: {len(utterances.data)}件")
    
    # 1. 会議の要約を生成
    print("\n要約を生成中...")
    summary = generate_summary(meeting_name, utterances.data)
    print(f"要約: {summary}")
    
    # 会議の全文を結合してembeddingを生成
    print("\n会議全体のembeddingを生成中...")
    full_meeting_text = f"{meeting_name}\n{summary}\n"
    for utt in utterances.data:
        full_meeting_text += f"{utt['content']}\n"
    
    meeting_embedding = generate_embedding(full_meeting_text[:8000])  # テキスト長制限
    
    # 会議データを更新
    supabase.table('meetings').update({
        'summary': summary,
        'embedding': meeting_embedding
    }).eq('id', meeting_id).execute()
    print("✓ 会議データを更新しました")
    
    # 2. 各発言のembeddingを生成
    print(f"\n発言のembeddingを生成中... (0/{len(utterances.data)})", end='')
    for i, utterance in enumerate(utterances.data):
        # 発言者名と内容を結合
        text = f"{utterance['speaker_name']}: {utterance['content']}"
        embedding = generate_embedding(text)
        
        # 発言データを更新
        supabase.table('utterances').update({
            'embedding': embedding
        }).eq('id', utterance['id']).execute()
        
        print(f"\r発言のembeddingを生成中... ({i+1}/{len(utterances.data)})", end='')
    
    print("\n✓ 全ての発言のembeddingを生成しました")

def main():
    """メイン処理"""
    print("=" * 60)
    print("松山市議会データ AI処理 (Google Gemini)")
    print("=" * 60)
    
    # 松山市議会の会議を取得
    meetings = supabase.table('meetings').select('id, meeting_name').eq('council_name', '松山市議会').execute()
    
    if not meetings.data:
        print("\nエラー: 処理する会議が見つかりません")
        sys.exit(1)
    
    print(f"\n処理する会議数: {len(meetings.data)}件")
    
    for meeting in meetings.data:
        process_meeting(meeting['id'])
    
    print("\n" + "=" * 60)
    print("AI処理完了")
    print("=" * 60)

if __name__ == "__main__":
    main()
