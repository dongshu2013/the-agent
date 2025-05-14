# Step1: Setup Local D1 Database

We need to creat proper tables in local D1 instance:

```bash
// create user table
npx wrangler d1 execute mysta-staging --command="CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY,
    user_email TEXT,
    api_key TEXT NOT NULL,
    api_key_enabled INTEGER NOT NULL DEFAULT 1 CHECK(api_key_enabled IN (0, 1)),
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);" --local
```

```bash
// create order table
npx wrangler d1 execute mysta-staging --command="CREATE TABLE IF NOT EXISTS orders(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    stripe_session_id TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'completed', 'cancelled', 'failed', 'finalized')) DEFAULT('pending'),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);" --local
```

```bash
// create credit history table
npx wrangler d1 execute mysta-staging --command="CREATE TABLE IF NOT EXISTS credit_history(
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
);" --local
```

```bash
// insert test user
npx wrangler d1 execute mysta-staging --command="INSERT INTO users (id, user_email, api_key, api_key_enabled) VALUES ('test-user', 'test@gmail.com', '06c375fa-d9a1-4b13-84e2-d7d58d091994', 1);" --local
```

# Step2: Start local server:

```bash
npx wrangler dev --experimental-vectorize-bind-to-prod
```

1. Do not use _--remote_ flag, sqlite backed duraable object doesn't support remote mode
2. _--experimental-vectorize-bind-to-prod_ flag will affect vectorize index in remote mode

## Step3.2: If you want to deploy:

```bash
npx wrangler deploy
```

## Step4: Call the server

```bash
// create conversation
curl -X POST -H "x-api-key: 06c375fa-d9a1-4b13-84e2-d7d58d091994" -H "Content-Type: application/json" http://localhost:8787/v1/conversation/create

// delete conversation
curl -X POST -H "x-api-key: 06c375fa-d9a1-4b13-84e2-d7d58d091994" -H "Content-Type: application/json" http://localhost:8787/v1/conversation/delete -d {"id": 1747186603009}

// list conversation
curl -X GET -H "x-api-key: 06c375fa-d9a1-4b13-84e2-d7d58d091994" -H "Content-Type: application/json" http://localhost:8787/v1/conversation/list
```

# Appendex: Setup Vectorize DB

```
// create the vector db
npx wrangler vectorize create mysta-e5-large --dimensions=1024 --metric=cosine
```

```bash
// create index for conversation id
npx wrangler vectorize create-metadata-index mysta-e5-large --property-name=conversation_id --type=string
```

```bash
// create index for user id
npx wrangler vectorize create-metadata-index mysta-e5-large --property-name=user_id --type=string
```
