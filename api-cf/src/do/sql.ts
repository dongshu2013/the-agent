// id is the epoch time of creation
export const CREATE_MESSAGE_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS agent_messages(
  id INTEGER PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content JSONB NOT NULL,
  tool_calls JSONB,
  tool_call_id TEXT,
  FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id)
);`

// id is the epoch time of creation
export const CREATE_CONVERSATION_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS agent_conversations(
  id INTEGER PRIMARY KEY,
  status TEXT DEFAULT 'active'
);`
