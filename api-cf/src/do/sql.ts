// id is the epoch time of creation
export const CREATE_CONVERSATION_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS agent_conversations(
  id INTEGER PRIMARY KEY,
  status TEXT DEFAULT 'active',
  last_message_at INTEGER,
  title TEXT
);`;

// id is the epoch time of creation
export const CREATE_MESSAGE_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS agent_messages(
  id INTEGER PRIMARY KEY,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tool_calls TEXT,
  tool_call_id TEXT,
  name TEXT,
  FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id)
);`;

// SQL queries for table creation
export const CREATE_TELEGRAM_DIALOGS_TABLE_QUERY = `
CREATE TABLE IF NOT EXISTS telegram_dialogs (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  chat_type TEXT NOT NULL,
  chat_title TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_free BOOLEAN NOT NULL DEFAULT true,
  subscription_fee NUMERIC NOT NULL DEFAULT 0,
  last_synced_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id)
)`;

export const CREATE_TELEGRAM_MESSAGES_TABLE_QUERY = `
CREATE TABLE IF NOT EXISTS telegram_messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  message_timestamp INTEGER NOT NULL,
  sender_id TEXT NOT NULL,
  sender_username TEXT,
  sender_firstname TEXT,
  sender_lastname TEXT,
  embedding_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id, message_id),
  FOREIGN KEY(chat_id) REFERENCES telegram_dialogs(chat_id)
)`;
