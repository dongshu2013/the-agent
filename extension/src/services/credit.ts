import { env } from "../utils/env";
import { handleAuthError, getApiKey } from "./utils";
import { db } from "../utils/db";

/**
 * Get user's available credits by calling the backend API
 * Uses the API key for authentication
 */
export const getUserCredits = async (): Promise<{ success: boolean; credits?: number; error?: string }> => {
  try {
    const API_ENDPOINT = "/v1/credits/balance";
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      return handleAuthError();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        return handleAuthError();
      }

      return {
        success: false,
        error: errorData.detail || 
               errorData.error?.message || 
               `API Error: ${response.status} - ${response.statusText}`
      };
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        credits: data.credits
      };
    } else {
      console.error("API returned success: false", data);
      return {
        success: false,
        error: data.detail || "Unknown error occurred while getting credits"
      };
    }
  } catch (error) {
    console.error("Failed to get user credits:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};

/**
 * Deduct credits from user account by calling the backend API
 * Uses the API key for authentication without requiring a user ID
 */
export const deductCreditsApi = async (creditsToDeduct: number, description: string = "API credit deduction") => {
  try {
    const API_ENDPOINT = "/v1/credits/deduct";
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      return handleAuthError();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };

    const requestBody = {
      credits: creditsToDeduct
    };

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        return handleAuthError();
      }

      throw new Error(
        errorData.detail ||
        errorData.error?.message ||
        `API Error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();
    
    if (data.success) {
      try {
        // Update local database only if the API call was successful
        // Use the user_id returned from the API response
        if (data.user_id) {
          await db.deductCredits(data.user_id, creditsToDeduct, description);
          console.log(`Local database updated: deducted ${creditsToDeduct} credits from user ${data.user_id}`);
        }
      } catch (dbError) {
        console.error("Failed to update local database:", dbError);
        // We don't throw here as the server-side update was successful
        // Just log the error for debugging purposes
      }
    } else {
      console.error("API returned success: false", data);
      throw new Error(data.detail || "Unknown error occurred during credit deduction");
    }
    
    return data;
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    throw error;
  }
};