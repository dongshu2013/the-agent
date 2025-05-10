/**
 * Utility functions for the application
 */

import { env } from "~/utils/env";
import { db } from "~/utils/db";
/**
 * Gets the API key from local storage
 */
export const getApiKey = async (): Promise<string | null> => {
  try {
    const user = await db.getCurrentUser();
    return user?.api_key ? user.api_key : null;
  } catch (e) {
    console.error("Failed to get API key from localStorage:", e);
    return null;
  }
};

export const handleAuthError = () => {
  chrome.runtime.sendMessage({
    name: "api-key-missing",
    redirectUrl: env.BACKEND_URL,
  });

  return {
    success: false,
    error: `Authentication failed. Please obtain an API key from ${env.BACKEND_URL}`,
  };
};

export const handleApiError = (error: any): never => {
  console.error("API Error:", error);
  if (typeof error === "object" && error !== null) {
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
  throw error;
};
