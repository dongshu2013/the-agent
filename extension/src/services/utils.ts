/**
 * Utility functions for the application
 */

import { env } from "~/utils/env";

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

// 处理授权错误
export const handleAuthError = () => {
  // 通知UI层显示API Key获取提示
  chrome.runtime.sendMessage({
    name: "api-key-missing",
    redirectUrl: env.SERVER_URL,
  });

  return {
    success: false,
    error: `Authentication failed. Please obtain an API key from ${env.SERVER_URL}`,
  };
};

// 处理API错误
export const handleApiError = (error: any): never => {
  console.error("API Error:", error);
  if (typeof error === "object" && error !== null) {
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
  throw error;
};
