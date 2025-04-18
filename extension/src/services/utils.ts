/**
 * Utility functions for the application
 */

/**
 * Gets the API key from local storage
 */
export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem("apiKey");
  } catch (e) {
    console.error("Failed to get API key from localStorage:", e);
    return null;
  }
};
