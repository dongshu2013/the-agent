/**
 * API Service - Handles communication with our backend server
 */

// Chat request interface
export interface ChatRequest {
  messages: Array<{
    role: string;
    content: string;
    function_call?: any;
  }>;
  tools?: Array<{
    type: string;
    function: {
      name: string;
      description?: string;
      parameters?: Record<string, any>;
    };
  }>;
  temperature?: number;
  max_tokens?: number;
}

// 在类型定义部分添加工具调用类型
export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

// Chat response interface
export interface ChatResponse {
  success: boolean;
  data?: any;
  error?: string;
  tool_calls?: ToolCall[];
}

// Backend response types
export interface BackendDirectResponse {
  type: "response";
  content: string;
}

export interface BackendToolCallResponse {
  type: "tool_call";
  tool_call: {
    name: string;
    arguments: Record<string, any>;
  };
  message_content: string;
  conversation_context: Array<{
    role: string;
    content: string;
    function_call?: any;
  }>;
  model: string;
}

export type BackendResponse = BackendDirectResponse | BackendToolCallResponse;

// Available tools
export const AVAILABLE_TOOLS = [
  {
    type: "function",
    function: {
      name: "getWeather",
      description: "Get the current weather for a specific time and location",
      parameters: {
        type: "object",
        properties: {
          time: {
            type: "string",
            description:
              "The time to get weather for, e.g. 'now', 'today', 'tomorrow'",
          },
        },
        required: ["time"],
      },
    },
  },
];

// Backend API configuration
const BACKEND_URL = "http://localhost:8000"; // 本地后端URL
const API_ENDPOINTS = {
  CHAT_WITH_TOOLS: "/v1/chat/with-tools",
  TOOL_RESULT: "/v1/chat/tool-result",
  EXECUTE_TOOL: "/v1/chat/execute-tool",
};
const DEFAULT_API_KEY =
  "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";

// Flag to control direct API access (bypassing backend)
// 可以通过设置环境变量或LocalStorage来控制
// 本地开发默认为true(直连API)，生产环境可设为false(使用后端)
const USE_DIRECT_API = true;

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
    // Default to OpenRouter API if no key is provided
    const key = apiKey || DEFAULT_API_KEY;

    if (USE_DIRECT_API) {
      // 直接调用OpenRouter API
      debug("Using direct OpenRouter API (bypassing backend)");

      // OpenRouter API endpoint
      const url = "https://openrouter.ai/api/v1/chat/completions";

      const body: any = {
        model: "google/gemini-2.5-pro-exp-03-25:free",
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
      };

      // Add tools if provided
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools;
        body.tool_choice = "auto";
      }

      debug("Direct API request body:", body);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": "https://github.com",
          "X-Title": "MIZU Agent",
        },
        body: JSON.stringify(body),
      });

      debug("Direct API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        debug("Direct API error:", errorData);
        return {
          success: false,
          error: errorData.error?.message || `API Error: ${response.status}`,
        };
      }

      const data = await response.json();
      debug("Direct API successful response:", data);

      // Extract tool calls if any
      const message = data.choices[0].message;
      const toolCalls: ToolCall[] = [];

      if (message.tool_calls && message.tool_calls.length > 0) {
        message.tool_calls.forEach((toolCall: any) => {
          try {
            toolCalls.push({
              name: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments),
            });
          } catch (e) {
            debug("Error parsing tool call arguments:", e);
          }
        });
      }

      return {
        success: true,
        data,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    } else {
      // Send request to our backend server instead of OpenRouter directly
      debug(
        `Sending request to backend: ${BACKEND_URL}${API_ENDPOINTS.CHAT_WITH_TOOLS}`
      );
      debug("Request payload:", {
        messages: request.messages,
        api_key: key ? "***" : "not provided", // 隐藏真实API密钥
        model: "google/gemini-2.5-pro-exp-03-25:free",
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 1000,
      });

      const response = await fetch(
        `${BACKEND_URL}${API_ENDPOINTS.CHAT_WITH_TOOLS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: request.messages,
            api_key: key,
            model: "google/gemini-2.5-pro-exp-03-25:free",
            temperature: request.temperature || 0.7,
            max_tokens: request.max_tokens || 1000,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.detail || `API Error: ${response.status}`,
        };
      }

      const backendResponse = (await response.json()) as BackendResponse;

      console.log("Backend response:", backendResponse);

      // Process the response based on its type
      if (backendResponse.type === "tool_call") {
        // Extract tool call information
        const toolCalls: ToolCall[] = [
          {
            name: backendResponse.tool_call.name,
            arguments: backendResponse.tool_call.arguments,
          },
        ];

        // Format response to match our internal format
        return {
          success: true,
          data: {
            choices: [
              {
                message: {
                  content: backendResponse.message_content,
                  tool_calls: [
                    {
                      function: {
                        name: backendResponse.tool_call.name,
                        arguments: JSON.stringify(
                          backendResponse.tool_call.arguments
                        ),
                      },
                    },
                  ],
                },
              },
            ],
          },
          tool_calls: toolCalls,
        };
      } else {
        // Direct response with no tool calls
        return {
          success: true,
          data: {
            choices: [
              {
                message: {
                  content: backendResponse.content,
                },
              },
            ],
          },
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

/**
 * Send tool execution result back to the backend
 */
export const sendToolResult = async (
  toolName: string,
  arguments_: Record<string, any>,
  conversationId: string,
  messages: Array<{
    role: string;
    content: string;
    function_call?: any;
  }>,
  apiKey?: string
): Promise<ChatResponse> => {
  try {
    // Default to OpenRouter API if no key is provided
    const key = apiKey || DEFAULT_API_KEY;

    // Send the tool result to our backend
    const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.TOOL_RESULT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tool_name: toolName,
        arguments: arguments_,
        conversation_id: conversationId,
        messages: messages,
        api_key: key,
        model: "google/gemini-2.5-pro-exp-03-25:free",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.detail || `API Error: ${response.status}`,
      };
    }

    const backendResponse = (await response.json()) as BackendDirectResponse;

    // Return the final response
    return {
      success: true,
      data: {
        choices: [
          {
            message: {
              content: backendResponse.content,
            },
          },
        ],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
