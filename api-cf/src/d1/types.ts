
export interface UserInfo {
    id: string;
    email: string;
    api_key: string;
    api_key_enabled: boolean;
    balance: number;
}

export interface CreditLog {
    id: number;
    tx_credits: number;
    tx_type: string;
    model?: string | null;
    created_at: string;
}

export interface Order {
    id: string;
    user_id: string;
    amount: number;
    currency: string;
    stripe_session_id: string;
    credits: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'failed' | 'finalized';
