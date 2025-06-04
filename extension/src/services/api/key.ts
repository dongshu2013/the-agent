import { ApiKey } from '../../types';

/**
 * Parse API key from string or object
 */
export const parseApiKey = (apiKey?: string | ApiKey | null): ApiKey | null => {
  if (!apiKey) return null;
  if (typeof apiKey === 'string') {
    return JSON.parse(apiKey) as ApiKey;
  }
  return apiKey;
};

/**
 * Compare two API keys for equality
 */
export const isEqualApiKey = (apiKey1: ApiKey | null, apiKey2: ApiKey | null): boolean => {
  return apiKey1?.key === apiKey2?.key && apiKey1?.enabled === apiKey2?.enabled;
};
