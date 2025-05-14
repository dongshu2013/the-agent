export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionReason {
  NEW_USER = 'new_user',
  ORDER_PAY = 'order_pay',
  SYSTEM_ADD = 'system_add',
  COMPLETION = 'completion',
}

export interface CreditLog {
  id: number;
  tx_credits: number;
  tx_type: TransactionType;
  tx_reason?: TransactionReason;
  model?: string;
  created_at: string;
}

export interface GetUserResponse {
  user: {
    api_key: string;
    api_key_enabled: boolean;
    balance: number;
    email: string;
  };
}
