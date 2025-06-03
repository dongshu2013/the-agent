import { GetUserResponse, TransactionReasonSchema, TransactionTypeSchema } from '@the-agent/shared';
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

export async function getCreditDaily(
  env: Env,
  userId: string,
  options: {
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<{ date: string; credits: number }[]> {
  const { startDate, endDate } = options;
  const db = env.DB;

  let baseQuery = `
    SELECT 
      DATE(created_at) as date, 
      SUM(tx_credits) as credits 
    FROM credit_history 
    WHERE user_id = ? AND tx_type = 'credit'
  `;

  const params: (string | number)[] = [userId];

  if (startDate) {
    baseQuery += ' AND created_at >= ?';
    params.push(startDate);
  }
  if (endDate) {
    baseQuery += ' AND created_at <= ?';
    params.push(endDate);
  }

  baseQuery += ' GROUP BY DATE(created_at) ORDER BY date ASC';

  const result = await db
    .prepare(baseQuery)
    .bind(...params)
    .all();

  if (!result.success) throw new GatewayServiceError(500, 'Failed to query db');

  return result.results.map(r => ({
    date: r.date as string,
    credits: r.credits as number,
  }));
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

// Redeem a coupon code for a user
export async function redeemCouponCode(
  env: Env,
  userId: string,
  userEmail: string,
  code: string
): Promise<{ added_credits: number; total_credits: number }> {
  const db = env.DB;

  // Get coupon code info with user_whitelist check
  const { results } = await db
    .prepare(
      `SELECT * FROM coupon_codes 
     WHERE code = ? 
     AND is_active = 1 
     AND (expired_at IS NULL OR expired_at > datetime('now'))
     AND (user_whitelist IS NULL OR user_whitelist LIKE ?)`
    )
    .bind(code, `%${userEmail}%`)
    .all();

  if (!results || results.length === 0) {
    throw new GatewayServiceError(400, 'Invalid, expired, or unauthorized coupon code');
  }

  const coupon = results[0] as {
    used_count: number;
    max_uses: number;
    credits: number;
  };
  if (coupon.used_count >= coupon.max_uses) {
    throw new GatewayServiceError(400, 'Coupon code has reached maximum uses');
  }

  // Check if user has already redeemed this coupon code
  const { results: redemptionResults } = await db
    .prepare(`SELECT * FROM coupon_redemptions WHERE user_id = ? AND coupon_code = ?`)
    .bind(userId, code)
    .all();

  if (redemptionResults && redemptionResults.length > 0) {
    throw new GatewayServiceError(400, 'You have already redeemed this coupon code');
  }

  // Start transaction
  const tx = await db.batch([
    // Update coupon used count
    db.prepare('UPDATE coupon_codes SET used_count = used_count + 1 WHERE code = ?').bind(code),
    // Add credits to user
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(coupon.credits, userId),
    // Add credit history
    db
      .prepare(
        `INSERT INTO credit_history (user_id, tx_credits, tx_type, tx_reason)
       VALUES (?, ?, ?, ?)`
      )
      .bind(
        userId,
        coupon.credits,
        TransactionTypeSchema.enum.debit,
        TransactionReasonSchema.enum.coupon_code
      ),
    // Record the coupon redemption
    db
      .prepare(
        `INSERT INTO coupon_redemptions (user_id, coupon_code)
       VALUES (?, ?)`
      )
      .bind(userId, code),
  ]);

  // Check if all operations succeeded
  for (const result of tx) {
    if (!result.success) {
      throw new GatewayServiceError(500, 'Failed to redeem coupon code');
    }
  }

  const newBalance = await getUserBalance(env, userId);
  return {
    added_credits: coupon.credits,
    total_credits: newBalance,
  };
}
