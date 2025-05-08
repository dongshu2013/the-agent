/**
 * Transaction types for credit transactions
 * Must match the TransactionType enum in schema.prisma
 */
export enum TransactionType {
  NEW_USER = 'new_user',
  ORDER_PAY = 'order_pay',
  SYSTEM_ADD = 'system_add',
  COMPLETION = 'completion',
}

/**
 * Order status types
 * Must match the OrderStatus enum in schema.prisma
 */
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
