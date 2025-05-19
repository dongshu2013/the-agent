import {
  CreditLog,
  GetUserResponse,
  TelegramStats,
  TransactionReason,
  TransactionType,
} from '@/types';

async function postApiService(endpoint: string, token: string, body?: object) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch data');
  }

  return data;
}

async function getApiService(endpoint: string, token: string) {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

export async function postCheckout(
  token: string,
  amount: number,
): Promise<{
  order_id: string;
  session_id: string;
  public_key: string;
}> {
  return await postApiService('v1/stripe/checkout', token, { amount });
}

export async function postToggleApiKey(token: string, enabled: boolean): Promise<void> {
  await postApiService('v1/user/toggle_api_key_enabled', token, { enabled });
}

export async function postRotateApiKey(token: string): Promise<{ newApiKey: string }> {
  const response = await postApiService('v1/user/rotate_api_key', token);
  return response as { newApiKey: string };
}

export async function getUserInfo(token: string): Promise<GetUserResponse> {
  return await getApiService('v1/user', token);
}

export interface GetCreditHistoryResponse {
  history: CreditLog[];
}

export async function getCreditHistory(
  token: string,
  params: {
    startDate?: string;
    endDate?: string;
    model?: string;
    transType?: TransactionType;
    transReason?: TransactionReason;
  } = {},
): Promise<GetCreditHistoryResponse> {
  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.model) queryParams.append('model', params.model);
  if (params.transType) queryParams.append('transType', params.transType);
  if (params.transReason) queryParams.append('transReason', params.transReason);

  const queryString = queryParams.toString();
  const endpoint = queryString ? `v1/user/credit_history?${queryString}` : 'v1/user/credit_history';

  return await getApiService(endpoint, token);
}

export async function redeemCouponCode(
  token: string,
  code: string,
): Promise<{ success: boolean; credits?: number; error?: string }> {
  try {
    const response = await postApiService('v1/user/redeem_coupon_code', token, { code });
    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to redeem coupon code',
    };
  }
}

export async function getTelegramStats(token: string): Promise<TelegramStats> {
  const response = await getApiService('v1/tg/stats', token);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch Telegram stats');
  }
  return response.data;
}
