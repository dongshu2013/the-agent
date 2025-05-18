/**
 * Gets the API key from local storage
 */
export const getApiKey = async (): Promise<string | null> => {
  return new Promise(resolve => {
    chrome.storage.local.get('apiKey', result => {
      const storedApiKey = result.apiKey ?? null;
      resolve(storedApiKey?.replace(/"/g, '') ?? null);
    });
  });
};

export const setApiKey = async (apiKey: string) => {
  const apiKeyWithoutQuotes = apiKey.replace(/"/g, '');
  chrome.storage.local.set({ apiKey: apiKeyWithoutQuotes });
};
