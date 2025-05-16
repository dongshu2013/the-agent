import { WebInteractionResult } from "./tab-toolkit";
import { env } from "../utils/env";
import { getApiKey } from "../services/cache";
import { showLoginModal } from "~/utils/global-event";

// Ensure Chrome types are available
declare const chrome: any;

export class TgToolkit {
  private static readonly API_ENDPOINT = "/v1/tg";

  /**
   * Get a list of user's Telegram dialogs
   * @param limit Maximum number of dialogs to return (default: 100)
   * @param offset Offset for pagination (default: 0)
   * @param chatTitle Optional filter by chat title
   * @param isPublic Optional filter by public status
   * @param isFree Optional filter by free status
   * @param status Optional filter by status
   * @param sortBy Field to sort by (default: "updated_at")
   * @param sortOrder Sort order (default: "desc")
   */
  static async getDialogs(
    limit: number = 100,
    offset: number = 0,
    chatTitle?: string,
    isPublic?: boolean,
    isFree?: boolean,
    status?: string,
    sortBy: string = "updated_at",
    sortOrder: string = "desc",
    apiKey?: string
  ): Promise<WebInteractionResult> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      if (chatTitle) params.append("chat_title", chatTitle);
      if (isPublic !== undefined)
        params.append("is_public", isPublic.toString());
      if (isFree !== undefined) params.append("is_free", isFree.toString());
      if (status) params.append("status", status);
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);

      // Get API key
      const apiKeyToUse = apiKey || (await getApiKey());
      if (!apiKeyToUse) {
        showLoginModal();
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      headers["Authorization"] = `Bearer ${apiKeyToUse}`;

      // Make API request
      const response = await fetch(
        `${env.BACKEND_URL}${this.API_ENDPOINT}/get_dialogs?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await response.json();

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

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get messages from a specified chat
   * @param chatId ID of the chat to get messages from
   * @param limit Maximum number of messages to return (default: 100)
   * @param offset Offset for pagination (default: 0)
   * @param messageText Optional filter by message text
   * @param senderId Optional filter by sender ID
   * @param startTimestamp Optional filter by start timestamp
   * @param endTimestamp Optional filter by end timestamp
   * @param sortBy Field to sort by (default: "message_timestamp")
   * @param sortOrder Sort order (default: "desc")
   */
  static async getMessages(
    chatId: string,
    limit: number = 100,
    offset: number = 0,
    messageText?: string,
    senderId?: string,
    startTimestamp?: number,
    endTimestamp?: number,
    sortBy: string = "message_timestamp",
    sortOrder: string = "desc",
    apiKey?: string
  ): Promise<WebInteractionResult> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("chat_id", chatId);
      params.append("limit", limit.toString());
      params.append("offset", offset.toString());

      if (messageText) params.append("message_text", messageText);
      if (senderId) params.append("sender_id", senderId);
      if (startTimestamp)
        params.append("start_timestamp", startTimestamp.toString());
      if (endTimestamp) params.append("end_timestamp", endTimestamp.toString());
      params.append("sort_by", sortBy);
      params.append("sort_order", sortOrder);

      // Get API key
      const apiKeyToUse = apiKey || (await getApiKey());
      if (!apiKeyToUse) {
        showLoginModal();
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      headers["Authorization"] = `Bearer ${apiKeyToUse}`;

      // Make API request
      const response = await fetch(
        `${env.BACKEND_URL}${this.API_ENDPOINT}/get_messages?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await response.json();

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

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Search messages based on vector similarity
   * @param query Search query
   * @param chatId Optional chat ID to limit search to
   * @param topK Maximum number of results to return (default: 10)
   * @param messageRange Number of messages before and after the match to include (default: 2)
   * @param threshold Similarity threshold (default: 0.7)
   * @param isPublic Optional filter by public status
   * @param isFree Optional filter by free status
   */
  static async searchMessages(
    query: string,
    chatId?: string,
    topK: number = 10,
    messageRange: number = 2,
    threshold: number = 0.7,
    isPublic?: boolean,
    isFree?: boolean,
    apiKey?: string
  ): Promise<WebInteractionResult> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("query", query);

      if (chatId) params.append("chat_id", chatId);
      params.append("top_k", topK.toString());
      params.append("message_range", messageRange.toString());
      params.append("threshold", threshold.toString());
      if (isPublic !== undefined)
        params.append("is_public", isPublic.toString());
      if (isFree !== undefined) params.append("is_free", isFree.toString());

      // Get API key
      const apiKeyToUse = apiKey || (await getApiKey());
      if (!apiKeyToUse) {
        showLoginModal();
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      headers["Authorization"] = `Bearer ${apiKeyToUse}`;

      // Make API request
      const response = await fetch(
        `${env.BACKEND_URL}${this.API_ENDPOINT}/search_messages?${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await response.json();

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

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
