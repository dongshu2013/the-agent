-- Drop the index
DROP INDEX IF EXISTS tg_messages_embedding_idx;

-- Drop the embedding column
ALTER TABLE tg_messages DROP COLUMN IF EXISTS embedding;

-- Disable pgvector extension (optional, 如果其他表没有使用)
-- DROP EXTENSION IF EXISTS vector;