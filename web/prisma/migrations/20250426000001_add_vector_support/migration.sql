-- Enable pgvector extension first
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector embedding column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- Create a vector index on messages table
DROP INDEX IF EXISTS messages_embedding_idx;
CREATE INDEX messages_embedding_idx ON messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add vector embedding column to tg_messages table
ALTER TABLE tg_messages ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- Create a vector index on tg_messages table
DROP INDEX IF EXISTS tg_messages_embedding_idx;
CREATE INDEX tg_messages_embedding_idx ON tg_messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);