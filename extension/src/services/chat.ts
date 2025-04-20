/**
 * 聊天服务 - 处理消息和聊天功能
 */

import { Message } from "../types/messages";
import { SaveMessageResponse } from "../types/conversations";
import OpenAI from "openai";
import { env } from "../utils/env";
import { handleAuthError, getApiKey } from "./utils";
import { indexedDB } from "../utils/db";
import { ChatRequest } from "../types/api";
import { getToolDescriptions } from "../tools/tool-descriptions";

// 发送聊天请求到后端
export const sendChatCompletion = async (
  request: ChatRequest,
  apiKey?: string,
  options: { stream?: boolean; signal?: AbortSignal } = {}
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const apiKeyToUse = apiKey || (await getApiKey());
    if (!apiKeyToUse) {
      return handleAuthError();
    }
    const client = new OpenAI({
      apiKey: apiKeyToUse,
      baseURL: env.BACKEND_URL + "/v1",
      dangerouslyAllowBrowser: true,
    });

    // 获取工具描述
    const tools = getToolDescriptions().map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    const response = await client.chat.completions.create(
      {
        model: env.OPENAI_MODEL,
        messages: request.messages as OpenAI.Chat.ChatCompletionMessageParam[],
        tools: tools,
        tool_choice: "auto",
        stream: options.stream,
      },
      { signal: options.signal }
    );

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to send chat request",
    };
  }
};

/**
 * 保存消息（调用后端接口）
 */
export const saveMessageApi = async ({
  conversation_id,
  message,
  top_k_related = 0,
  apiKey,
}: {
  conversation_id: string;
  message: Message;
  top_k_related?: number;
  apiKey?: string;
}): Promise<SaveMessageResponse> => {
  try {
    const API_ENDPOINT = "/v1/message/save";
    const apiKeyToUse = apiKey || (await getApiKey());
    if (!apiKeyToUse) {
      return handleAuthError();
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    headers["Authorization"] = `Bearer ${apiKeyToUse}`;
    const requestBody = {
      conversation_id: conversation_id,
      message: message,
      top_k_related: top_k_related,
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

    // 保存消息到 IndexedDB
    await indexedDB.saveMessage({
      ...message,
      conversation_id,
    });

    return {
      success: true,
      data: {
        top_k_messages: data.top_k_messages,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
