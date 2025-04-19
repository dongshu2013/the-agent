-- Add vector embedding column to messages table
ALTER TABLE messages ADD COLUMN embedding vector(1024);

-- Create a vector index on the embedding column
CREATE INDEX messages_embedding_idx ON messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
