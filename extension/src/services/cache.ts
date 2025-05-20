/**
 * Gets the API key from local storage
 */

import { env } from '~/utils/env';

// Extract hostname from URL
const getHostname = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    return hostname;
  } catch (e) {
    console.error('Invalid URL:', url);
    return '';
  }
};

const formatApiKey = (apiKey: string): string => {
  return apiKey.replace(/"/g, '');
};

export const getApiKey = async (): Promise<string | null> => {
  const host = getHostname(env.WEB_URL);
  return new Promise(resolve => {
    chrome.storage.local.get(host, result => {
      resolve(formatApiKey(result[host]?.apiKey || null));
    });
  });
};

export const setApiKey = async (data: { apiKey: string }) => {
  data.apiKey = formatApiKey(data.apiKey);
  const host = getHostname(env.WEB_URL);
  chrome.storage.local.set({ [host]: data });
};
