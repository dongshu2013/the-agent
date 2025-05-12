import { CreditLog, UserInfo } from "./types";


export async function getUserInfo(env: Env, userId: string): Promise<UserInfo | null> {
  const db = env.UDB;
  const result = await db.prepare(
      "SELECT id, email, api_key, api_key_enabled, balance FROM users WHERE id = ?"
  ).bind(userId).all();
  if (!result.success || result.results.length === 0) {
      return null;
  }
  return {
    id: result.results[0].id as string,
    email: result.results[0].email as string,
    api_key: result.results[0].api_key as string,
    api_key_enabled: result.results[0].api_key_enabled as number === 1,
    balance: result.results[0].balance as number,
  };
}

export async function getUserFromApiKey(
  env: Env,
  apiKey: string
): Promise<{ id: string; email: string } | null> {
  const db = env.UDB;
  const result = await db.prepare(
      "SELECT id, email FROM users " +
      " WHERE api_key = ? and api_key_enabled = 1"
  ).bind(apiKey).all();
  if (!result.success || result.results.length === 0) {
      return null;
  }
  return {
    id: result.results[0].id as string,
    email: result.results[0].email as string,
  };
}

export async function getCreditLogs(env: Env, userId: string): Promise<CreditLog[]> {
  const db = env.UDB;
  const result = await db.prepare(
      "SELECT id, tx_credits, tx_type, model, created_at" +
      " FROM credit_history" +
      " WHERE user_id = ?" +
      " ORDER BY created_at DESC"
  ).bind(userId).all();
  if (!result.success || result.results.length === 0) {
      return [];
  }
  return result.results.map((r) => ({
    id: r.id as number,
    tx_credits: r.tx_credits as number,
    tx_type: r.tx_type as string,
    model: r.model as string,
    created_at: r.created_at as string,
  }));
}

export async function getUserBalance(env: Env, userId: string): Promise<number> {
  try {
    const db = env.UDB;
    const result = await db.prepare(
        "SELECT balance FROM users WHERE id = ?"
    ).bind(userId).all();
    if (!result.success || result.results.length === 0) {
      console.error('Error fetching user credits:', result.error);
      return 0;
    }
    return result.results[0].balance as number || 0;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return 0;
  }
}

// Deduct credits from user
export async function deductUserCredits(
  env: Env, 
  userId: string, 
  amount: number, 
  model?: string
): Promise<{ success: boolean; remainingCredits: number }> {
  try {
    const db = env.UDB;

    // Get current credits
    const currentCredits = await getUserBalance(env, userId);
    if (currentCredits < amount) {
      return { success: false, remainingCredits: currentCredits };
    }

    // Record the transaction
    const insertTxStmt = db.prepare(
        "INSERT INTO credit_history" +
        "(user_id, tx_credits, tx_type, tx_reason, model)" +
        "VALUES (?, ?, ?, ?, ?)"
    );
    const updateBalanceStmt = db.prepare(
        "UPDATE users SET balance = balance - ? WHERE id = ?"
    );

    const [result1, result2] = await db.batch([
        insertTxStmt.bind(userId, -amount, 'debit', 'chat', model),
        updateBalanceStmt.bind(amount, userId)
    ]);
    if (!result1.success || !result2.success) {
      console.error('Error deducting credits:', result1.error || result2.error);
      return { success: false, remainingCredits: currentCredits };
    }
    return { success: true, remainingCredits: currentCredits - amount };
  } catch (error) {
    console.error('Error deducting credits:', error);
    return { success: false, remainingCredits: 0 };
  }
}
