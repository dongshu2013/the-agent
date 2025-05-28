import { APIClient } from '@the-agent/shared';
import { env } from '../../configs/env';
import { getApiKey } from '../../storages/cache';
import { showLoginModal } from '~/utils/global-event';

/**
 * Create API client instance with authentication
 */
export const createApiClient = async (): Promise<APIClient> => {
  const keyToUse = await getApiKey();
  if (!keyToUse?.enabled) {
    showLoginModal();
    throw new Error('Authentication required');
  }
  return new APIClient({
    baseUrl: env.BACKEND_URL,
    apiKey: keyToUse.key,
  });
};
