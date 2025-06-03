import { ApiKey } from '../types';
import { createApiClient } from './api/client';

export const getUserInfo = async (apiKey: ApiKey) => {
  const client = await createApiClient();
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
