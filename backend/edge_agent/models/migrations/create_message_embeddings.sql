-- 创建 message_embeddings 表
CREATE TABLE IF NOT EXISTS message_embeddings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    embedding BYTEA NOT NULL,  -- 暂时使用 BYTEA 类型存储向量
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id)
); 