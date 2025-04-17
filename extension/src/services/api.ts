/**
 * API Service - Handles communication with our backend server
 */

// 导入 Plasmo 的存储机制
import { Storage } from "@plasmohq/storage";

// 初始化存储
const storage = new Storage();

// 空的可用工具数组，先暂时不启用工具调用功能
export const AVAILABLE_TOOLS: any[] = [];

// Chat request interface
export interface ChatRequest {
  model?: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  max_tokens?: number;
  stream?: boolean;
}

// Chat response interface
export interface ChatResponse {
  success: boolean;
  data?: any;
  error?: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
}

// 添加调试日志函数
const debug = (message: string, data?: any) => {
  console.log(`[MIZU API] ${message}`, data || "");
};

/**
 * Send a chat request to our backend server
 */
export const sendChatRequest = async (
  request: ChatRequest,
  apiKey?: string
): Promise<ChatResponse> => {
  try {
    // 使用固定的后端URL
    const BACKEND_URL = "http://localhost:8000";
    const API_ENDPOINT = "/v1/chat/completions";

    // Send request to our backend server
    debug(`Sending request to backend: ${BACKEND_URL}${API_ENDPOINT}`);

    // 准备请求体 - 直接发送完整请求结构
    const body = {
      ...request, // 包括model, messages, temperature等字段
    };

    // 构建请求头
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 如果提供了API key，添加到请求头
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    debug("Backend request payload:", body);

    // 发送请求到后端
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    debug("Backend response status:", response.status);

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      debug("Backend error:", errorData);
      return {
        success: false,
        error:
          errorData.detail ||
          errorData.error?.message ||
          `API Error: ${response.status}`,
      };
    }

    // 解析从后端返回的数据
    const data = await response.json();
    debug("Backend successful response:", data);

    // 返回成功响应
    return {
      success: true,
      data,
    };
  } catch (error) {
    debug("Error in sendChatRequest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
