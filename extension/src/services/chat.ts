/**
 * 聊天服务 - 处理消息和聊天功能
 */

import { Message, ChatRequest, SaveMessageResponse } from "../types";
import OpenAI from "openai";
import { env } from "../utils/env";
import { handleApiError, handleAuthError } from "./utils";
import CacheManager from "./cache";
import { getCurrentConversation } from "./conversation";

// 获取缓存管理器实例
const cacheManager = CacheManager.getInstance();

// 添加用户消息
export const addUserMessage = async (content: string): Promise<Message> => {
  try {
    const message: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    return message;
  } catch (error) {
    console.error("Error adding user message:", error);
    throw error;
  }
};

// 添加助手消息
export const addAssistantMessage = async (
  content: string | null
): Promise<Message> => {
  try {
    const message: Message = {
      role: "assistant",
      content: content || "no response",
      timestamp: new Date(),
    };
    return message;
  } catch (error) {
    console.error("Error adding assistant message:", error);
    throw error;
  }
};

// 发送消息并获取响应
export const sendMessage = async (
  content: string,
  apiKey?: string
): Promise<string> => {
  try {
    // 添加用户消息
    const userMessage = await addUserMessage(content);

    // 获取当前会话
    const conversation = await getCurrentConversation();
    if (!conversation) throw new Error("No active conversation");

    // 保存用户消息到后端
    const saveUserMessageResponse = await saveMessageApi(
      conversation.id,
      userMessage
    );
    if (!saveUserMessageResponse.success) {
      return handleApiError(
        saveUserMessageResponse.error || "Failed to save user message"
      );
    }

    // 更新用户消息的ID（从后端返回）
    userMessage.id = saveUserMessageResponse.data?.id;

    // 将消息添加到当前会话
    conversation.messages.push(userMessage);
    updateMessageCache(conversation.id, conversation.messages);

    // 将消息转换为API请求格式
    const messages = conversation.messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 添加系统消息（如果没有）
    if (!messages.some((m: { role: string }) => m.role === "system")) {
      messages.unshift({
        role: "system",
        content: env.SYSTEM_PROMPT,
      });
    }

    // 构建请求
    const request: ChatRequest = {
      messages,
    };

    // 发送请求
    const response = await sendChatRequest(request, apiKey);
    if (!response.success || !response.data) {
      return handleApiError(response.error || "Failed to get model response");
    }

    // 获取响应内容
    const assistantResponse = response.data.choices[0].message.content;

    // 添加助手回复
    const assistantMessage = await addAssistantMessage(assistantResponse);

    // 保存助手消息到后端
    const saveAssistantMessageResponse = await saveMessageApi(
      conversation.id,
      assistantMessage
    );
    if (!saveAssistantMessageResponse.success) {
      return handleApiError(
        saveAssistantMessageResponse.error || "Failed to save assistant message"
      );
    }

    // 更新助手消息的ID（从后端返回）
    assistantMessage.id = saveAssistantMessageResponse.data?.id;

    // 将助手消息添加到当前会话
    conversation.messages.push(assistantMessage);
    updateMessageCache(conversation.id, conversation.messages);

    return assistantResponse;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};

// 消息缓存管理函数
export const getCachedMessages = (conversationId: string): Message[] | null => {
  return cacheManager.get<Message[]>(`messages_${conversationId}`);
};

export const updateMessageCache = (
  conversationId: string,
  messages: Message[]
): void => {
  cacheManager.set(`messages_${conversationId}`, messages);
};

// 发送聊天请求到后端
export const sendChatRequest = async (
  request: ChatRequest,
  apiKey?: string,
  options: { stream?: boolean; signal?: AbortSignal } = {}
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const client = new OpenAI({
      apiKey: apiKey || localStorage.getItem("apiKey") || "",
      baseURL: env.BACKEND_URL,
      dangerouslyAllowBrowser: true,
    });

    const messages = request.messages.map((msg) => ({
      role: msg.role as "user" | "assistant" | "system",
      content: msg.content || "",
    }));

    const response = await client.chat.completions.create(
      {
        model: env.DEFAULT_MODEL,
        messages,
        ...(request.tools ? { tools: request.tools } : {}),
        stream: options.stream,
      },
      { signal: options.signal }
    );

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error("Error in sendChatRequest:", error);
    return {
      success: false,
      error: error.message || "Failed to send chat request",
    };
  }
};

/**
 * 保存消息（调用后端接口）
 */
export const saveMessageApi = async (
  conversationId: string,
  message: Message
): Promise<SaveMessageResponse> => {
  try {
    const API_ENDPOINT = "/v1/message/save";
    const apiKey = localStorage.getItem("apiKey");

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

    const requestBody = {
      conversation_id: conversationId,
      message: {
        role: message.role,
        content: message.content,
      },
    };

    const response = await fetch(`${env.BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
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
        id: data.id,
        conversation_id: data.conversation_id,
        role: data.role,
        content: data.content,
        created_at: data.created_at,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
