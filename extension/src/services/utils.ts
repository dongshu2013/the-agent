/**
 * Gets the API key from local storage
 */
export const getApiKey = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get("apiKey", (result) => {
      const storedApiKey = result.apiKey ?? null;
      resolve(storedApiKey?.replace(/"/g, "") ?? null);
    });
  });
};
