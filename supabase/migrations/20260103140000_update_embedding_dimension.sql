-- Gemini Embeddingは768次元のため、ベクトルカラムを更新
-- 既存のembeddingデータは削除される

-- meetingsテーブルのembeddingカラムを再作成
ALTER TABLE meetings 
DROP COLUMN IF EXISTS embedding;

ALTER TABLE meetings 
ADD COLUMN embedding vector(768);

-- utterancesテーブルのembeddingカラムを再作成
ALTER TABLE utterances 
DROP COLUMN IF EXISTS embedding;

ALTER TABLE utterances 
ADD COLUMN embedding vector(768);

-- インデックスを再作成
DROP INDEX IF EXISTS meetings_embedding_idx;
DROP INDEX IF EXISTS utterances_embedding_idx;

CREATE INDEX meetings_embedding_idx ON meetings 
USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX utterances_embedding_idx ON utterances 
USING ivfflat (embedding vector_cosine_ops);

-- コメントを更新
COMMENT ON COLUMN meetings.embedding IS 'Google Gemini embedding (768次元ベクトル)';
COMMENT ON COLUMN utterances.embedding IS 'Google Gemini embedding (768次元ベクトル)';
