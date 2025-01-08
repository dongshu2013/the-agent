-- Indexes for users table
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tg_user_id ON users(tg_user_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Indexes for user_personas table
CREATE INDEX IF NOT EXISTS idx_user_personas_user_version ON user_personas(user_id, version);

-- Indexes for agents table
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agents_enable_persona ON agents(enable_persona);
