-- Enable pgvector extension for embedding support
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding and summary columns to meetings table
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add embedding column to utterances table
ALTER TABLE utterances
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS meetings_embedding_idx ON meetings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS utterances_embedding_idx ON utterances USING ivfflat (embedding vector_cosine_ops);

-- Add comments
COMMENT ON COLUMN meetings.summary IS 'AI生成の会議要約';
COMMENT ON COLUMN meetings.embedding IS 'OpenAI embedding (1536次元ベクトル)';
COMMENT ON COLUMN utterances.embedding IS 'OpenAI embedding (1536次元ベクトル)';
