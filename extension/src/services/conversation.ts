/**
 * 会话服务 - 管理会话相关功能
 */

import { env } from "../utils/env";
import { getApiKey } from "./utils";
import { Conversation } from "../types/conversations";
import { db } from "../utils/db";
import { Message } from "~/types";
import { showLoginModal } from "~/utils/globalEvent";

/**
 * 创建新会话（调用后端接口）
 */
export const createConversationApi = async (
  apiKey?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const API_ENDPOINT = "/v1/conversation/create";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const keyToUse = apiKey || (await getApiKey());

    if (keyToUse) {
      headers["x-api-key"] = keyToUse;
    } else {
      showLoginModal();
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
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

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * 删除会话（调用后端接口）
 */
export const deleteConversationApi = async (
  conversationId: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const API_ENDPOINT = `/v1/conversation/delete`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const keyToUse = apiKey || (await getApiKey());

    if (keyToUse) {
      headers["x-api-key"] = keyToUse;
    } else {
      showLoginModal();
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ id: conversationId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        showLoginModal();
      }
      if (response.status === 404) {
        return {
          success: true,
        };
      }
      return {
        success: false,
        error:
          errorData.detail ||
          errorData.error?.message ||
          `API Error: ${response.status} - ${response.statusText}`,
      };
    }

    await response.json();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * 获取用户会话列表（调用后端接口）
 */
export const getConversationsApi = async (
  apiKey?: string
): Promise<{
  success: boolean;
  conversations: { id: string; messages: Message[] }[];
  error?: string;
}> => {
  try {
    const API_ENDPOINT = "/v1/conversation/list";
    const keyToUse = (apiKey || (await getApiKey()))?.trim();
    if (!keyToUse || !keyToUse.trim()) {
      showLoginModal();
      return {
        success: false,
        conversations: [],
        error: "Unauthorized",
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${keyToUse}`,
      "x-api-key": keyToUse,
    };

    const url = `${env.BACKEND_URL}${API_ENDPOINT}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          conversations: [],
          error: "Unauthorized",
        };
      }
      return {
        success: false,
        conversations: [],
        error:
          errorData.detail ||
          errorData.error?.message ||
          `API Error: ${response.status} - ${response.statusText}`,
      };
    }

    return await response.json();
  } catch (error) {
    return {
      success: false,
      conversations: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * 获取所有会话
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await getConversationsApi();
    const user = await db.getUserByApiKey();
    if (!user) {
      throw new Error("User not found");
    }

    console.log("response = 🍓🍓 .... ", response);
    const serverConversations: Conversation[] = response?.conversations?.map(
      (conv: any) => ({
        id: conv.id,
        title:
          conv?.title || conv.messages[0]?.content.slice(0, 20) || "New Chat",
        user_id: user?.id || "",
        messages: conv.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        })),
      })
    );

    console.log("serverConversations = 🍓🍓 .... ", serverConversations);

    await db.saveConversationsAndMessages(serverConversations, user.id);

    return serverConversations;
  } catch (error) {
    console.error("Error in getConversations:", error);
    throw error;
  }
};

/**
 * 获取当前会话
 */
export const getCurrentConversation =
  async (): Promise<Conversation | null> => {
    try {
      const conversations = await getConversations();
      return conversations[0] || null; // 返回第一个会话作为当前会话
    } catch (error) {
      return null;
    }
  };

/**
 * 创建新会话
 */
export const createNewConversation = async (): Promise<Conversation> => {
  try {
    const response = await createConversationApi();
    const user = await db.getUserByApiKey();
    if (!response.success || !response.id || !user) {
      throw new Error(response.error || "Failed to create conversation");
    }

    const conversation: Conversation = {
      id: response.id,
      title: "New Chat",
      user_id: user?.id || "",
    };

    await db.saveConversation(conversation);

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * 选择会话
 */
export const selectConversation = async (
  id: string
): Promise<Conversation | null> => {
  try {
    // 从 IndexedDB 获取会话
    const conversation = await db.getConversation(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // 获取会话的消息
    const messages = await db.getMessagesByConversation(id);
    conversation.messages = messages;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * 删除会话
 */
export const deleteConversation = async (id: string): Promise<void> => {
  try {
    const response = await deleteConversationApi(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to delete conversation");
    }

    await db.deleteConversation(id);
    await db.deleteMessagesByConversation(id);
  } catch (error) {
    throw error;
  }
};
