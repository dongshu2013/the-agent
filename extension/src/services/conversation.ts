/**
 * 会话服务 - 管理会话相关功能
 */

import { env } from "../utils/env";
import { indexedDB } from "../utils/db";
import { getApiKey, handleAuthError } from "./utils";
import { Conversation } from "../types/conversations";

/**
 * 创建新会话（调用后端接口）
 */
export const createConversationApi = async (
  apiKey?: string
): Promise<{ success: boolean; data?: Conversation; error?: string }> => {
  try {
    const API_ENDPOINT = "/v1/conversation/create";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const keyToUse = apiKey || (await getApiKey());

    if (keyToUse) {
      headers["Authorization"] = `Bearer ${keyToUse}`;
    } else {
      return handleAuthError();
    }

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        return handleAuthError();
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
    return {
      success: true,
      data: {
        id: data.id || crypto.randomUUID(),
        title: data.title || "New Chat",
        user_id: data.user_id,
        created_at: data.created_at,
        status: data.status,
      },
    };
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
    const API_ENDPOINT = `/v1/conversation/delete/${conversationId}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const keyToUse = apiKey || (await getApiKey());

    if (keyToUse) {
      headers["Authorization"] = `Bearer ${keyToUse}`;
    } else {
      return handleAuthError();
    }

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        return handleAuthError();
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
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const API_ENDPOINT = "/v1/conversation/list";
    const keyToUse = apiKey || (await getApiKey());
    if (!keyToUse) {
      return handleAuthError();
    }

    const formattedKey = keyToUse.trim();
    if (!formattedKey) {
      return handleAuthError();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${formattedKey}`,
    };

    const url = `${env.BACKEND_URL}${API_ENDPOINT}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        return handleAuthError();
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
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * 获取所有会话
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    // 首先尝试从 IndexedDB 获取会话列表
    const localConversations = await indexedDB.getAllConversations();
    if (localConversations && localConversations.length > 0) {
      console.log("Using conversations from IndexedDB", localConversations);
      return localConversations;
    }

    // 如果 IndexedDB 中没有数据，则从 API 获取
    console.log("No conversations in IndexedDB, fetching from API");
    const response = await getConversationsApi();
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch conversations");
    }

    const newConversations: Conversation[] = response.data.map((conv: any) => ({
      id: conv.id,
      title:
        conv?.title || conv.messages[0]?.content.slice(0, 20) || "New Chat",
      user_id: conv.user_id,
      created_at: conv.created_at,
      status: conv.status,
      messages: conv.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })),
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at),
    }));

    // 保存到 IndexedDB
    await Promise.all(
      newConversations.map((conv) => indexedDB.saveConversation(conv))
    );

    return newConversations;
  } catch (error) {
    console.error("Error in getConversations:", error);
    // 如果 API 调用失败，返回 IndexedDB 中的数据（如果有的话）
    const fallbackConversations = await indexedDB.getAllConversations();
    if (fallbackConversations && fallbackConversations.length > 0) {
      console.log("Using fallback conversations from IndexedDB");
      return fallbackConversations;
    }
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
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to create conversation");
    }

    const conversation: Conversation = {
      id: response.data.id,
      title: response?.data?.title || "New Chat",
      user_id: response.data.user_id,
      created_at: response.data.created_at,
      status: response.data.status,
    };

    // Save to IndexedDB
    await indexedDB.saveConversation(conversation);

    return conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
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
    const conversation = await indexedDB.getConversation(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // 获取会话的消息
    const messages = await indexedDB.getMessagesByConversation(id);
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

    // 从 IndexedDB 中删除会话和相关的消息
    await indexedDB.deleteConversation(id);
    await indexedDB.deleteMessagesByConversation(id);
  } catch (error) {
    throw error;
  }
};
