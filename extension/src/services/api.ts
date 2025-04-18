/**
 * API Service - Handles communication with our backend server
 */

import {
  Message,
  ChatRequest,
  ChatResponse,
  CreateConversationResponse,
  SaveMessageResponse,
} from "../types";

export const AVAILABLE_TOOLS: any[] = [];
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const API_KEY_URL = "https://the-agent-production.up.railway.app/profile";

// 处理授权错误
export const handleAuthError = () => {
  // 通知UI层显示API Key获取提示
  chrome.runtime.sendMessage({
    name: "api-key-missing",
    redirectUrl: API_KEY_URL,
  });

  return {
    success: false,
    error: `Authentication failed. Please obtain an API key from ${API_KEY_URL}`,
  };
};

// 添加调试日志函数
const debug = (message: string, data?: any) => {
  console.log(`[MIZU API] ${message}`, data || "");
};

/**
 * 创建新会话（调用后端接口）
 */
export const createConversationApi = async (
  apiKey?: string
): Promise<CreateConversationResponse> => {
  try {
    const API_ENDPOINT = "/v1/conversation/create";

    debug(
      `Creating new conversation via backend: ${BACKEND_URL}${API_ENDPOINT}`
    );

    // 构建请求头
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 如果提供了API key，添加到请求头
    if (apiKey) {
      // 使用Bearer Token作为认证方式
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      debug("Warning: No API key provided for conversation creation");
      // 尝试从localStorage读取apiKey
      try {
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedApiKey) {
          headers["Authorization"] = `Bearer ${storedApiKey}`;
          debug("Using API key from localStorage");
        }
      } catch (e) {
        debug("Failed to read API key from localStorage:", e);
      }
    }

    // 打印headers以便调试（不包含API key值）
    debug("Request headers:", {
      ...headers,
      Authorization: headers["Authorization"] ? "[REDACTED]" : undefined,
    });

    // 发送请求到后端
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}), // 空请求体，由后端生成ID
    });

    debug("Backend response status:", response.status);

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      debug("Backend error:", errorData);

      // 如果是认证错误，调用统一处理方法
      if (response.status === 401 || response.status === 403) {
        debug("Authentication error. API key might be invalid or missing");
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

    // 解析从后端返回的数据
    const data = await response.json();
    debug("Backend successful response:", data);

    // 返回成功响应
    return {
      success: true,
      data: {
        id: data.id || crypto.randomUUID(), // 使用后端返回的ID，如果没有则生成一个
        title: data.title || "New Chat",
      },
    };
  } catch (error) {
    debug("Error in createConversationApi:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
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
    } else {
      // 尝试从localStorage读取apiKey
      try {
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedApiKey) {
          headers["X-API-Key"] = storedApiKey;
          debug("Using API key from localStorage in chat request");
        }
      } catch (e) {
        debug("Failed to read API key from localStorage:", e);
      }
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

      // 如果是认证错误，调用统一处理方法
      if (response.status === 401 || response.status === 403) {
        debug("Authentication error. API key might be invalid or missing");
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

/**
 * 删除会话（调用后端接口）
 */
export const deleteConversationApi = async (
  conversationId: string,
  apiKey?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const API_ENDPOINT = `/v1/conversation/delete/${conversationId}`;

    debug(`Deleting conversation via backend: ${BACKEND_URL}${API_ENDPOINT}`);

    // 构建请求头
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 如果提供了API key，添加到请求头
    if (apiKey) {
      // 使用Bearer Token认证格式
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      debug("Warning: No API key provided for conversation deletion");
      // 尝试从localStorage读取apiKey
      try {
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedApiKey) {
          headers["Authorization"] = `Bearer ${storedApiKey}`;
          debug("Using API key from localStorage");
        }
      } catch (e) {
        debug("Failed to read API key from localStorage:", e);
      }
    }

    // 打印headers以便调试（不包含API key值）
    debug("Request headers:", {
      ...headers,
      Authorization: headers.Authorization ? "Bearer [REDACTED]" : undefined,
    });

    // 发送请求到后端
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({}), // 空请求体
    });

    debug("Backend response status:", response.status);

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      debug("Backend error:", errorData);

      // 如果是认证错误，调用统一处理方法
      if (response.status === 401 || response.status === 403) {
        debug("Authentication error. API key might be invalid or missing");
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

    // 解析从后端返回的数据
    const data = await response.json();
    debug("Backend successful response:", data);

    // 返回成功响应
    return {
      success: true,
    };
  } catch (error) {
    debug("Error in deleteConversationApi:", error);
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

    debug(
      `Fetching user conversations from backend: ${BACKEND_URL}${API_ENDPOINT}`
    );

    // 构建请求头
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 如果提供了API key，添加到请求头
    if (apiKey) {
      // 使用Bearer Token认证格式
      headers["Authorization"] = `Bearer ${apiKey}`;
    } else {
      debug("Warning: No API key provided for fetching conversations");
      // 尝试从localStorage读取apiKey
      try {
        const storedApiKey = localStorage.getItem("apiKey");
        if (storedApiKey) {
          headers["Authorization"] = `Bearer ${storedApiKey}`;
          debug("Using API key from localStorage");
        }
      } catch (e) {
        debug("Failed to read API key from localStorage:", e);
      }
    }

    // 打印headers以便调试（不包含API key值）
    debug("Request headers:", {
      ...headers,
      Authorization: headers["Authorization"] ? "Bearer [REDACTED]" : undefined,
    });

    // 发送请求到后端
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINT}`, {
      method: "GET",
      headers,
    });

    debug("Backend response status:", response.status);

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      debug("Backend error:", errorData);

      // 如果是认证错误，调用统一处理方法
      if (response.status === 401 || response.status === 403) {
        debug("Authentication error. API key might be invalid or missing");
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

    // 解析从后端返回的数据
    const data = await response.json();
    debug("Backend successful response with conversations:", data.length);

    // 返回成功响应
    return {
      success: true,
      data,
    };
  } catch (error) {
    debug("Error in getConversationsApi:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
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

    debug(`Saving message via backend: ${BACKEND_URL}${API_ENDPOINT}`);

    // 构建请求头
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 尝试从localStorage读取apiKey
    try {
      const storedApiKey = localStorage.getItem("apiKey");
      if (storedApiKey) {
        headers["Authorization"] = `Bearer ${storedApiKey}`;
        debug("Using API key from localStorage");
      } else {
        throw new Error("No API key found");
      }
    } catch (e) {
      debug("Failed to read API key from localStorage:", e);
      return handleAuthError();
    }

    // 打印headers以便调试（不包含API key值）
    debug("Request headers:", {
      ...headers,
      Authorization: headers.Authorization ? "[REDACTED]" : undefined,
    });

    // 构建请求体
    const requestBody = {
      conversation_id: conversationId,
      message: {
        role: message.role,
        content: message.content,
      },
    };

    debug("Request body:", requestBody);

    // 发送请求到后端
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINT}`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    debug("Backend response status:", response.status);

    // 检查响应状态
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      debug("Backend error:", errorData);

      // 如果是认证错误，调用统一处理方法
      if (response.status === 401 || response.status === 403) {
        debug("Authentication error. API key might be invalid or missing");
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

    // 解析从后端返回的数据
    const data = await response.json();
    debug("Backend successful response:", data);

    // 返回成功响应
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
    debug("Error in saveMessageApi:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
