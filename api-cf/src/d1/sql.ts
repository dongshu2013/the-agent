export const CREATE_USER_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY,
    user_email TEXT UNIQUE,
    api_key TEXT NOT NULL,
    api_key_enabled INTEGER NOT NULL DEFAULT 1 CHECK(api_key_enabled IN (0, 1)),
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

export const CREATE_CREDIT_HISTORY_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS credit_history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    tx_credits INTEGER NOT NULL,
    tx_type TEXT NOT NULL CHECK(tx_type IN ('credit', 'debit')),
    tx_reason TEXT NOT NULL,
    model TEXT,
    order_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(order_id) REFERENCES orders(id)
);`;

export const CREATE_ORDER_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    stripe_session_id TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'cancelled', 'failed', 'finalized')) DEFAULT('pending'),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);`;

export const CREATE_COUPON_CODE_TABLE_QUERY = `CREATE TABLE IF NOT EXISTS coupon_codes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    code TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL,
    max_uses INTEGER NOT NULL DEFAULT 1,
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    user_whitelist TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expired_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);`;
