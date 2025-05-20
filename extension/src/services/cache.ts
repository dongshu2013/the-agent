/**
 * Gets the API key from local storage
 */

import { ApiKey } from '~/types';
import { env } from '~/utils/env';

// Extract hostname from URL
export const API_KEY_TAG = new URL(env.WEB_URL).hostname + '_api_key';

const formatApiKey = (key: string): string => {
  return key.replace(/"/g, '');
};

export const getApiKey = async (): Promise<ApiKey | null> => {
  return new Promise(resolve => {
    chrome.storage.local.get(API_KEY_TAG, result => {
      const key = result[API_KEY_TAG]?.key;
      const enabled = result[API_KEY_TAG]?.enabled;
      resolve(key ? { key: formatApiKey(key), enabled } : null);
    });
  });
};

export const setApiKey = async (data: ApiKey) => {
  data.key = formatApiKey(data.key);
  chrome.storage.local.set({ [API_KEY_TAG]: data });
};
