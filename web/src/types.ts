export type TransactionReason = 'new_user' | 'order_pay' | 'system_add' | 'completion';

export interface CreditLog {
    id: number;
    tx_credits: number;
    tx_type: "debit" | "credit";
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
    }
}
