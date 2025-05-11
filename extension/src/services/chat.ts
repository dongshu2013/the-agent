/**
 * 聊天服务 - 处理消息和聊天功能
 */

import { Message } from "../types/messages";
import { SaveMessageResponse } from "../types/conversations";
import OpenAI from "openai";
import { env } from "../utils/env";
import { handleAuthError } from "./utils";
import { db } from "../utils/db";
import { ChatRequest } from "../types/api";
import { getToolDescriptions } from "../tools/tool-descriptions";

// 发送聊天请求到后端
export const sendChatCompletion = async (
  request: ChatRequest,
  apiKey?: string,
  options: { stream?: boolean; signal?: AbortSignal } = {}
): Promise<any> => {
  try {
    const currentUser = await db.getCurrentUser();
    const apiKeyToUse = apiKey || currentUser?.api_key;
    if (!apiKeyToUse) {
      return handleAuthError();
    }
    const client = new OpenAI({
      apiKey: apiKeyToUse,
      baseURL: env.BACKEND_URL + "/v1",
      dangerouslyAllowBrowser: true,
    });

    // get tool descriptions
    const tools = getToolDescriptions().map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    console.log("request.currentModel", request.currentModel);

    return client.beta.chat.completions.stream(
      {
        model:
          request.currentModel?.id === "system"
            ? env.OPENAI_MODEL || ""
            : request.currentModel?.name || "",
        messages: request.messages as OpenAI.Chat.ChatCompletionMessageParam[],
        tools: tools,
        tool_choice: "auto",
      },
      {
        signal: options.signal,
        query: {
          modelConfig: {
            ...request.currentModel,
            name:
              request.currentModel?.id === "system"
                ? env.OPENAI_MODEL
                : request.currentModel?.name,
            api_key: request.currentModel?.apiKey,
            api_url:
              request.currentModel?.id === "system"
                ? env.LLM_API_URL
                : request.currentModel?.apiUrl,
          },
        },
      }
    );
  } catch (error: any) {
    throw new Error(error.message || "Failed to send chat request");
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
    const user = await db.getCurrentUser();
    const apiKeyToUse = apiKey || user?.api_key;
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

    await db.saveMessage({
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
