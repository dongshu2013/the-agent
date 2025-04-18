import { getApiKey } from "./utils";
import { Message, MemoryOptions } from "../types";
import { env } from "../utils/env";

/**
 * 生成记忆上下文，用于LLM的输入
 * @param conversationId 当前会话ID
 * @param currentMessage 当前用户消息
 * @param options 记忆策略选项
 * @returns 返回带有上下文的消息列表
 */
export async function generateMemory(
  conversationId: string,
  currentMessage: string,
  options: MemoryOptions = {}
): Promise<Message[]> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("API key not found for memory generation");
      return [
        {
          role: "system",
          content: options.systemPrompt || "You are a helpful AI assistant.",
        },
        { role: "user", content: currentMessage },
      ];
    }

    // 默认使用策略2 (最近消息 + 语义相关)
    const strategy = options.strategy || 2;

    const response = await fetch(`${env.BACKEND_URL}/v1/memory/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        current_message: currentMessage,
        strategy: strategy,
        system_prompt: options.systemPrompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Memory generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error("Error generating memory:", error);

    // 在故障情况下返回基本上下文
    return [
      {
        role: "system",
        content: options.systemPrompt || "You are a helpful AI assistant.",
      },
      { role: "user", content: currentMessage },
    ];
  }
}

/**
 * 确认消息已被处理并添加到记忆系统
 * @param messageId 消息ID
 * @returns 成功状态
 */
export async function addMessageToMemory(messageId: string): Promise<boolean> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("API key not found for adding message to memory");
      return false;
    }

    const response = await fetch(`${env.BACKEND_URL}/v1/memory/add_message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        message_id: messageId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Adding message to memory failed: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error adding message to memory:", error);
    return false;
  }
}

/**
 * 检索与查询语义相关的消息
 * @param conversationId 会话ID
 * @param query 查询文本
 * @param limit 结果数量限制
 * @returns 相关消息数组
 */
export async function getSimilarMessages(
  conversationId: string,
  query: string,
  limit: number = 5
): Promise<Message[]> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("API key not found for similar messages query");
      return [];
    }

    const response = await fetch(`${env.BACKEND_URL}/v1/memory/similar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        query: query,
        limit: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Similar messages query failed: ${response.status}`);
    }

    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error("Error getting similar messages:", error);
    return [];
  }
}
