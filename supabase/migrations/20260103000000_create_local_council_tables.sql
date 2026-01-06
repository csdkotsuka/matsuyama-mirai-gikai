-- Create tables for local council meeting records

-- 会議テーブル
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    council_name TEXT NOT NULL,           -- 議会名（例: 松山市議会）
    meeting_type TEXT NOT NULL,           -- 会議種別（例: 定例会、委員会）
    meeting_name TEXT NOT NULL,           -- 会議名（例: 令和7年3月定例会）
    session_date DATE NOT NULL,           -- 開催日
    session_number INTEGER,               -- 第何号
    external_id TEXT,                     -- 外部システムのID
    source_url TEXT,                      -- 元データのURL
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 発言テーブル
CREATE TABLE utterances (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    speaker_name TEXT NOT NULL,           -- 発言者名
    speaker_role TEXT,                    -- 役割（例: 質問、答弁、議長）
    content TEXT NOT NULL,                -- 発言内容
    sequence_number INTEGER NOT NULL,     -- 発言順序
    page_number INTEGER,                  -- ページ番号
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_meetings_council_name ON meetings(council_name);
CREATE INDEX idx_meetings_session_date ON meetings(session_date DESC);
CREATE INDEX idx_meetings_external_id ON meetings(external_id);
CREATE INDEX idx_utterances_meeting_id ON utterances(meeting_id);
CREATE INDEX idx_utterances_speaker_name ON utterances(speaker_name);
CREATE INDEX idx_utterances_sequence ON utterances(meeting_id, sequence_number);

-- トリガー for updated_at
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utterances_updated_at BEFORE UPDATE ON utterances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS有効化
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE utterances ENABLE ROW LEVEL SECURITY;

-- コメント
COMMENT ON TABLE meetings IS '地方議会の会議情報を管理するテーブル';
COMMENT ON COLUMN meetings.council_name IS '議会名（例: 松山市議会）';
COMMENT ON COLUMN meetings.meeting_type IS '会議種別（例: 定例会、委員会）';
COMMENT ON COLUMN meetings.session_date IS '会議開催日';
COMMENT ON COLUMN meetings.external_id IS '外部システム（会議録検索システム）のID';

COMMENT ON TABLE utterances IS '会議での発言を管理するテーブル';
COMMENT ON COLUMN utterances.speaker_name IS '発言者名';
COMMENT ON COLUMN utterances.speaker_role IS '発言者の役割（質問、答弁、議長など）';
COMMENT ON COLUMN utterances.sequence_number IS '会議内での発言順序';
