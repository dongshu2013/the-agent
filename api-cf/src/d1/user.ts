import { GatewayServiceError } from '../types/service';
import { CreditLog, UserInfo } from './types';

export async function createUser(
  env: Env,
  userId: string,
  email: string
): Promise<UserInfo> {
  const db = env.UDB;
  const apiKey = crypto.randomUUID();
  const result = await db
    .prepare(
      'INSERT INTO users (id, user_email, api_key, api_key_enabled) VALUES (?, ?, ?, ?)'
    )
    .bind(userId, email, apiKey, 1)
    .run();
  if (!result.success) {
    throw new GatewayServiceError(500, 'Failed to create user');
  }
  return {
    id: userId,
    email: email,
    api_key: apiKey,
    api_key_enabled: true,
    balance: 0,
  };
}

export async function getUserInfo(
  env: Env,
  userId: string
): Promise<UserInfo | null> {
  const db = env.UDB;
  const result = await db
    .prepare(
      'SELECT id, user_email, api_key, api_key_enabled, balance FROM users WHERE id = ?'
    )
    .bind(userId)
    .all();
  if (!result.success || result.results.length === 0) {
    return null;
  }
  return {
    id: result.results[0].id as string,
    email: result.results[0].user_email as string,
    api_key: result.results[0].api_key as string,
    api_key_enabled: (result.results[0].api_key_enabled as number) === 1,
    balance: result.results[0].balance as number,
  };
}

export async function getUserFromApiKey(
  env: Env,
  apiKey: string
): Promise<{ id: string; email: string }> {
  const db = env.UDB;
  const result = await db
    .prepare(
      'SELECT id, user_email FROM users ' +
        ' WHERE api_key = ? and api_key_enabled = 1'
    )
    .bind(apiKey)
    .all();
  if (!result.success || result.results.length === 0) {
    throw new GatewayServiceError(401, 'Invalid API Key');
  }
  return {
    id: result.results[0].id as string,
    email: result.results[0].user_email as string,
  };
}

export async function rotateApiKey(env: Env, userId: string): Promise<string> {
  const db = env.UDB;
  const newApiKey = crypto.randomUUID();
  const result = await db
    .prepare('UPDATE users SET api_key = ? WHERE id = ?')
    .bind(newApiKey, userId)
    .run();
  if (!result.success) {
    throw new GatewayServiceError(500, 'Failed to rotate API key');
  }
  return newApiKey;
}

export async function toggleApiKeyEnabled(
  env: Env,
  userId: string,
  enabled: boolean
): Promise<void> {
  const db = env.UDB;
  const result = await db
    .prepare('UPDATE users SET api_key_enabled = ? WHERE id = ?')
    .bind(enabled ? 1 : 0, userId)
    .run();
  if (!result.success) {
    throw new GatewayServiceError(500, 'Failed to update database');
  }
}

export async function getCreditLogs(
  env: Env,
  userId: string,
  limit = 10
): Promise<CreditLog[]> {
  const db = env.UDB;
  const result = await db
    .prepare(
      'SELECT id, tx_credits, tx_type, tx_reason, model, created_at' +
        ' FROM credit_history' +
        ' WHERE user_id = ?' +
        ' ORDER BY created_at DESC' +
        ' LIMIT ?'
    )
    .bind(userId, limit)
    .all();
  if (!result.success) {
    throw new GatewayServiceError(500, 'Failed to query db');
  }
  return result.results.map((r) => ({
    id: r.id as number,
    tx_credits: r.tx_credits as number,
    tx_type: r.tx_type as string,
    tx_reason: r.tx_reason as string,
    model: r.model as string,
    created_at: r.created_at as string,
  }));
}

export async function getUserBalance(
  env: Env,
  userId: string
): Promise<number> {
  const db = env.UDB;
  const result = await db
    .prepare('SELECT balance FROM users WHERE id = ?')
    .bind(userId)
    .all();
  if (!result.success || result.results.length === 0) {
    throw new GatewayServiceError(400, 'invalid user');
  }
  return (result.results[0].balance as number) || 0;
}

// Deduct credits from user
export async function deductUserCredits(
  env: Env,
  userId: string,
  amount: number,
  model?: string
): Promise<{ success: boolean; remainingCredits: number }> {
  const db = env.UDB;

  // Get current credits
  const currentCredits = await getUserBalance(env, userId);
  if (currentCredits < amount) {
    throw new GatewayServiceError(400, 'Insufficient credits');
  }

  // Record the transaction
  const insertTxStmt = db.prepare(
    'INSERT INTO credit_history' +
      '(user_id, tx_credits, tx_type, tx_reason, model)' +
      'VALUES (?, ?, ?, ?, ?)'
  );
  const updateBalanceStmt = db.prepare(
    'UPDATE users SET balance = balance - ? WHERE id = ?'
  );

  const [result1, result2] = await db.batch([
    insertTxStmt.bind(userId, -amount, 'debit', 'chat', model),
    updateBalanceStmt.bind(amount, userId),
  ]);
  if (!result1.success || !result2.success) {
    throw new GatewayServiceError(500, 'Failed to deduct credits');
  }
  return { success: true, remainingCredits: currentCredits - amount };
}
