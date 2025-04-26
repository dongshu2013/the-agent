-- Add vector embedding column to tg_messages table
ALTER TABLE tg_messages ADD COLUMN embedding vector(1024);

-- Create a vector index on the embedding column
CREATE INDEX tg_messages_embedding_idx ON tg_messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
