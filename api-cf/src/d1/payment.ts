import { GatewayServiceError } from '../types/service';
import { OrderStatus, TransactionType, TransactionReason } from './types';

const BASE = 10000; // 10000 * 100 = 10^6 = 1USDT

function getCreditFromAmount(amount: number) {
  return amount * BASE;
}

export async function createOrder(
  env: Env,
  userId: string,
  amount: number
): Promise<string> {
  const db = env.DB;
  const result = await db
    .prepare('INSERT INTO orders (user_id, amount) VALUES (?, ?)')
    .bind(userId, amount)
    .run();
  if (!result.success) {
    throw new GatewayServiceError(500, 'Failed to create order');
  }
  return String(result.meta.last_row_id);
}

export async function updateOrderStatus(
  env: Env,
  orderId: string,
  sessionId: string,
  status: OrderStatus
) {
  const db = env.DB;
  const result = await db
    .prepare('UPDATE orders SET status = ?, stripe_session_id = ? WHERE id = ?')
    .bind(status, sessionId, orderId)
    .run();
  if (!result.success) {
    throw new GatewayServiceError(500, 'Failed to update order');
  }
}

export async function finalizeOrder(
  env: Env,
  orderId: string,
  sessionId: string,
  amount: number
) {
  const db = env.DB;
  const orders = await db
    .prepare('SELECT user_id FROM orders WHERE id = ?')
    .bind(orderId)
    .all();
  if (!orders.success || orders.results.length === 0) {
    throw new GatewayServiceError(404, 'Order not found');
  }
  const order = orders.results[0];
  const credits = getCreditFromAmount(amount);

  const stmt1 = db.prepare(
    'UPDATE orders SET status = ?, stripe_session_id = ? WHERE id = ?'
  );
  const stmt2 = db.prepare(
    'INSERT INTO credit_history (user_id, tx_credits, tx_type, tx_reason, order_id) VALUES (?, ?, ?, ?, ?)'
  );
  const stmt3 = db.prepare(
    'UPDATE users SET balance = balance + ? WHERE id = ?'
  );

  const [result1, result2, result3] = await db.batch([
    stmt1.bind(OrderStatus.FINALIZED, sessionId, orderId),
    stmt2.bind(
      order.user_id,
      credits,
      TransactionType.DEBIT,
      TransactionReason.ORDER_PAY,
      orderId
    ),
    stmt3.bind(credits, order.user_id),
  ]);

  if (!result1.success || !result2.success || !result3.success) {
    throw new GatewayServiceError(500, 'Failed to finalize order');
  }
}
