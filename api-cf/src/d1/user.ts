import {
  CreditLog,
  GetUserResponse,
  TransactionReasonSchema,
  TransactionTypeSchema,
} from '@the-agent/shared';
import { GatewayServiceError } from '../types/service';
import { getCreditFromAmount } from '../utils/common';

export async function createUser(
  env: Env,
  userId: string,
  email: string
): Promise<GetUserResponse> {
  const db = env.DB;
  const apiKey = crypto.randomUUID();
  const result = await db
    .prepare('INSERT INTO users (id, user_email, api_key, api_key_enabled) VALUES (?, ?, ?, ?)')
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

export async function getUserInfo(env: Env, userId: string): Promise<GetUserResponse | null> {
  const db = env.DB;
  const result = await db
    .prepare('SELECT id, user_email, api_key, api_key_enabled, balance FROM users WHERE id = ?')
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
  const db = env.DB;
  const result = await db
    .prepare('SELECT id, user_email FROM users ' + ' WHERE api_key = ? and api_key_enabled = 1')
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
  const db = env.DB;
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
  const db = env.DB;
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
  options: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    model?: string;
    transType?: string;
    transReason?: string;
  } = {}
): Promise<{ history: CreditLog[]; total: number }> {
  const { limit = 100, offset = 0, startDate, endDate, model, transType, transReason } = options;

  const db = env.DB;
  let baseQuery = ' FROM credit_history WHERE user_id = ?';
  const params: (string | number)[] = [userId];

  if (startDate) {
    baseQuery += ' AND created_at >= ?';
    params.push(startDate);
  }
  if (endDate) {
    baseQuery += ' AND created_at <= ?';
    params.push(endDate);
  }
  if (model) {
    baseQuery += ' AND model = ?';
    params.push(model);
  }
  if (transType) {
    baseQuery += ' AND tx_type = ?';
    params.push(transType);
  }
  if (transReason) {
    baseQuery += ' AND tx_reason = ?';
    params.push(transReason);
  }

  // 查询总数
  const totalResult = await db
    .prepare('SELECT COUNT(*) as total' + baseQuery)
    .bind(...params)
    .all();
  const total = totalResult.success ? (totalResult.results[0].total as number) : 0;

  // 查询分页数据
  const query =
    'SELECT id, tx_credits, tx_type, tx_reason, model, created_at' +
    baseQuery +
    ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const pageParams = [...params, limit, offset];
  const result = await db
    .prepare(query)
    .bind(...pageParams)
    .all();

  if (!result.success) throw new GatewayServiceError(500, 'Failed to query db');

  return {
    history: result.results.map(r => ({
      id: r.id as number,
      tx_credits: r.tx_credits as number,
      tx_type: r.tx_type as string,
      tx_reason: r.tx_reason as string,
      model: r.model as string,
      created_at: r.created_at as string,
    })),
    total,
  };
}

export async function getUserBalance(env: Env, userId: string): Promise<number> {
  const db = env.DB;
  const result = await db.prepare('SELECT balance FROM users WHERE id = ?').bind(userId).all();
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
): Promise<{ success: boolean }> {
  const db = env.DB;

  const deductCredits = getCreditFromAmount(amount);
  const insertTxStmt = db.prepare(
    'INSERT INTO credit_history' +
      '(user_id, tx_credits, tx_type, tx_reason, model)' +
      'VALUES (?, ?, ?, ?, ?)'
  );
  const updateBalanceStmt = db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?');

  const [result1, result2] = await db.batch([
    insertTxStmt.bind(
      userId,
      deductCredits,
      TransactionTypeSchema.enum.credit,
      TransactionReasonSchema.enum.completion,
      model
    ),
    updateBalanceStmt.bind(deductCredits, userId),
  ]);
  if (!result1.success || !result2.success) {
    throw new GatewayServiceError(500, 'Failed to deduct credits');
  }
  return { success: true };
}
