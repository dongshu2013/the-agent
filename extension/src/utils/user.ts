import { APIClient } from '@the-agent/shared';
import { ApiKey } from '../types';
import { env } from './env';

export const parseApiKey = (apiKey?: string | ApiKey | null): ApiKey | null => {
  if (!apiKey) return null;
  if (typeof apiKey === 'string') {
    return JSON.parse(apiKey) as ApiKey;
  }
  return apiKey;
};

export const isEqualApiKey = (apiKey1: ApiKey | null, apiKey2: ApiKey | null): boolean => {
  return apiKey1?.key === apiKey2?.key && apiKey1?.enabled === apiKey2?.enabled;
};

export const getUserInfo = async (apiKey: ApiKey) => {
  const client = new APIClient({
    baseUrl: env.BACKEND_URL,
    apiKey: apiKey.key,
  });
  const user = await client.getUser();
  const now = new Date().toISOString();
  return {
    id: user.id,
    email: user.email,
    api_key_enabled: apiKey.enabled,
    api_key: apiKey.key,
    credits: user.balance.toString(),
    created_at: now,
    updated_at: now,
    selectedModelId: 'system',
  };
};
