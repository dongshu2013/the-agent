
export interface CreditLog {
    id: number;
    tx_credits: number;
    tx_type: string;
    tx_reason?: string;
    model?: string;
    created_at: string;
}


export interface GetUserResponse {
    api_key: string;
    api_key_enabled: boolean;
    balance: number;
    email: string;
}
