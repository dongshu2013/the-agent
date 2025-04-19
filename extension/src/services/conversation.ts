/**
 * 会话服务 - 管理会话相关功能
 */

import {
  Conversation,
  CreateConversationResponse,
  Message,
  ChatRequest,
  SaveMessageResponse,
} from "../types";
import { env } from "../utils/env";
import { handleAuthError } from "./utils";
import CacheManager from "./cache";
import OpenAI from "openai";

// 获取缓存管理器实例
const cacheManager = CacheManager.getInstance();
/**
 * 创建新会话（调用后端接口）
 */
export const createConversationApi = async (
  apiKey?: string
): Promise<CreateConversationResponse> => {
  try {
    const API_ENDPOINT = "/v1/conversation/create";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      try {
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedApiKey) {
          headers["Authorization"] = `Bearer ${storedApiKey}`;
        }
      } catch (e) {}
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

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      try {
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedApiKey) {
          headers["Authorization"] = `Bearer ${storedApiKey}`;
        }
      } catch (e) {}
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      try {
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedApiKey) {
          headers["Authorization"] = `Bearer ${storedApiKey}`;
        }
      } catch (e) {}
    }

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
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
    const cachedConversations =
      cacheManager.get<Conversation[]>("conversations");
    if (cachedConversations) {
      return cachedConversations;
    }

    const response = await getConversationsApi();
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to fetch conversations");
    }

    const conversations: Conversation[] = response.data.map((conv: any) => ({
      id: conv.id,
      title: conv.title,
      messages: conv.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })),
      createdAt: new Date(conv.created_at),
      updatedAt: new Date(conv.updated_at),
    }));

    cacheManager.set("conversations", conversations);
    return conversations;
  } catch (error) {
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

    const newConversation: Conversation = {
      id: response.data.id,
      title: response.data.title || "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    cacheManager.delete("conversations");
    return newConversation;
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
    const conversations = await getConversations();
    const conversation = conversations.find((c) => c.id === id);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    cacheManager.set(`messages_${id}`, conversation.messages);
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

    // 清除所有相关缓存
    cacheManager.delete("conversations"); // 清除会话列表缓存
    cacheManager.delete(`messages_${id}`); // 清除该会话的消息缓存
  } catch (error) {
    throw error;
  }
};
