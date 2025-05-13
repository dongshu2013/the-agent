import { CreditLog, GetUserResponse } from '@/types';

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
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

async function getApiService(endpoint: string, token: string): Promise<any> {
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

export async function postCheckout(token: string, amount: number): Promise<any> {
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

export async function getCreditHistory(token: string): Promise<GetCreditHistoryResponse> {
  return await getApiService('v1/user/credit_history', token);
}

export interface GetTelegramStatsResponse {
  channels_count: number;
  messages_count: number;
}

export async function getTelegramStats(token: string): Promise<GetTelegramStatsResponse> {
  return await getApiService('v1/tg/stats', token);
}
