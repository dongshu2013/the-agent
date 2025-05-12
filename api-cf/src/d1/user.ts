
export async function getUserFromApiKey(env: Env, apiKey: string): Promise<string | null> {
  const db = env.UDB;
  const result = await db.prepare(
      "SELECT id FROM users WHERE api_key = ? and api_key_enabled = true"
  ).bind(apiKey).all();
  if (!result.success || result.results.length === 0) {
      return null;
  }
  return result.results[0].id as string;
}

// Get user credits
export async function getUserCredits(env: Env, userId: string): Promise<number> {
  try {
    const db = env.UDB;
    // Query the balances table for the user's credits
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
    const currentCredits = await getUserCredits(env, userId);
    if (currentCredits < amount) {
      return { success: false, remainingCredits: currentCredits };
    }

    // Record the transaction
    const insertTxStmt = db.prepare(
        "INSERT INTO credit_history" +
        "(user_id, tx_credits, tx_type, model)" +
        "VALUES (?, ?, ?, ?)"
    );
    const updateBalanceStmt = db.prepare(
        "UPDATE users SET balance = balance - ? WHERE id = ?"
    );

    const [result1, result2] = await db.batch([
        insertTxStmt.bind(userId, -amount, 'chat', model),
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
