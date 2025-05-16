import { showLoginModal } from "~/utils/global-event";
import { env } from "../utils/env";
import { getApiKey } from "./cache";

/**
 * Get user's available credits by calling the backend API
 * Uses the API key for authentication
 */
export const getUserCredits = async (): Promise<{
  success: boolean;
  credits?: number;
  error?: string;
}> => {
  try {
    const API_ENDPOINT = "/v1/credits/balance";
    const apiKey = await getApiKey();

    if (!apiKey) {
      showLoginModal();
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
    };

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        showLoginModal();
      }

      return {
        success: false,
        error:
          errorData.detail ||
          errorData.error?.message ||
          `API Error: ${response.status} - ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        credits: data.credits,
      };
    } else {
      console.error("API returned success: false", data);
      return {
        success: false,
        error: data.detail || "Unknown error occurred while getting credits",
      };
    }
  } catch (error) {
    console.error("Failed to get user credits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Deduct credits from user account by calling the backend API
 * Uses the API key for authentication without requiring a user ID
 */
export const deductCreditsApi = async (
  creditsToDeduct: number,
  conversationId?: string,
  model?: string
) => {
  try {
    const API_ENDPOINT = "/v1/credits/deduct";
    const apiKey = await getApiKey();

    if (!apiKey) {
      showLoginModal();
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "x-api-key": apiKey,
    };

    const requestBody = {
      credits: creditsToDeduct,
      conversation_id: conversationId,
      model: model,
    };

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        showLoginModal();
      }

      throw new Error(
        errorData.detail ||
          errorData.error?.message ||
          `API Error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      console.error("API returned success: false", data);
      throw new Error(
        data.detail || "Unknown error occurred during credit deduction"
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    throw error;
  }
};
