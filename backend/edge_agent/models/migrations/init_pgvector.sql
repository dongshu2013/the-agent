-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 确保表已经创建后，添加向量索引
CREATE INDEX IF NOT EXISTS idx_message_embeddings_embedding ON message_embeddings USING ivfflat (embedding vector_cosine_ops);

-- 创建函数用于查询语义相似的消息
CREATE OR REPLACE FUNCTION find_similar_messages(
    p_conversation_id TEXT,
    p_embedding VECTOR,
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    message_id TEXT,
    role TEXT,
    content JSON,
    similarity FLOAT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id AS message_id,
        m.role,
        m.content,
        1 - (me.embedding <=> p_embedding) AS similarity,
        m.created_at
    FROM 
        message_embeddings me
    JOIN 
        messages m ON me.message_id = m.id
    WHERE 
        m.conversation_id = p_conversation_id
    ORDER BY 
        me.embedding <=> p_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 创建函数用于获取消息前后的上下文
CREATE OR REPLACE FUNCTION get_message_context(
    p_conversation_id TEXT,
    p_message_id TEXT,
    p_context_size INT DEFAULT 1
)
RETURNS TABLE (
    message_id TEXT,
    role TEXT,
    content JSON,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    WITH message_time AS (
        SELECT created_at
        FROM messages
        WHERE id = p_message_id
    )
    SELECT 
        m.id,
        m.role,
        m.content,
        m.created_at
    FROM 
        messages m, message_time mt
    WHERE 
        m.conversation_id = p_conversation_id
        AND m.id != p_message_id
        AND m.created_at BETWEEN 
            (mt.created_at - interval '1 hour' * p_context_size) 
            AND (mt.created_at + interval '1 hour' * p_context_size)
    ORDER BY 
        m.created_at;
END;
$$ LANGUAGE plpgsql; 