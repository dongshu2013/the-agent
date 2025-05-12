import { OrderStatus } from './types';

async function getCreditFromAmount(amount: number) {
  return amount;
}

export async function createOrder(env: Env, userId: string, amount: number) {
  const db = env.UDB;
  const result = await db
    .prepare('INSERT INTO orders (user_id, amount, credits) VALUES (?, ?, ?)')
    .bind(userId, amount, getCreditFromAmount(amount))
    .run();
  if (!result.success) {
    throw new Error('Failed to create order');
  }
}

export async function updateOrderSessionId(
  env: Env,
  orderId: string,
  sessionId: string
) {
  const db = env.UDB;
  const result = await db
    .prepare('UPDATE orders SET stripe_session_id = ? WHERE id = ?')
    .bind(sessionId, orderId)
    .run();
  if (!result.success) {
    throw new Error('Failed to update order');
  }
}

export async function updateOrderStatus(
  env: Env,
  orderId: string,
  status: OrderStatus
) {
  const db = env.UDB;
  const result = await db
    .prepare('UPDATE orders SET status = ? WHERE id = ?')
    .bind(status, orderId)
    .run();
  if (!result.success) {
    throw new Error('Failed to update order');
  }
}

export async function finalizeOrder(env: Env, orderId: string) {
  const db = env.UDB;
  const orders = await db
    .prepare('SELECT user_id, credits FROM orders WHERE id = ?')
    .bind(orderId)
    .all();
  if (!orders.success || orders.results.length === 0) {
    throw new Error('Order not found');
  }
  const order = orders.results[0];

  const stmt1 = db.prepare(
    "UPDATE orders SET status = 'finalized' WHERE id = ?"
  );
  const stmt2 = db.prepare(
    'INSERT INTO credit_history' +
      '(user_id, tx_credits, tx_type, tx_reason, order_id)' +
      'VALUES (?, ?, ?, ?, ?)'
  );
  const stmt3 = db.prepare(
    'UPDATE users SET balance = balance + ? WHERE id = ?'
  );

  const [result1, result2, result3] = await db.batch([
    stmt1.bind(orderId),
    stmt2.bind(order.user_id, order.credits, 'credit', 'order', orderId),
    stmt3.bind(order.credits, order.user_id),
  ]);

  if (!result1.success || !result2.success || !result3.success) {
    throw new Error('Failed to finalize order');
  }
}
