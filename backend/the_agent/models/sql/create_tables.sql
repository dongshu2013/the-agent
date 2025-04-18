-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tg_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    avatar_url VARCHAR(255),
    balance INTEGER DEFAULT '0',
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    last_active BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT
);

CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    system_prompt TEXT NOT NULL,
    enable_persona BOOLEAN DEFAULT FALSE,
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    assistant_message TEXT NOT NULL,
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Create user_personas table
CREATE TABLE IF NOT EXISTS user_personas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    version INTEGER NOT NULL,
    persona TEXT NOT NULL,
    last_processed_message_id INTEGER NOT NULL,
    messages_processed INTEGER NOT NULL,
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
