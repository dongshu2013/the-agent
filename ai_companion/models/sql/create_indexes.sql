-- Indexes for users table
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tg_user_id ON users(tg_user_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);

-- Indexes for chat_history table
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_messages ON chat_history USING gin (messages);
