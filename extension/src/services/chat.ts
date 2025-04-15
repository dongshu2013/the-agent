/**
 * 聊天服务 - 管理聊天会话和消息
 */

import {
  sendChatRequest,
  sendToolResult,
  ChatRequest,
  ChatResponse,
  AVAILABLE_TOOLS,
} from "./api";
import { executeTool } from "./tools";
import { Storage } from "@plasmohq/storage";

// 存储实例
const storage = new Storage();

// 消息类型
export interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

// 会话类型
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// 生成唯一ID
const generateId = (): string => {
  return crypto.randomUUID();
};

// 获取所有会话
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const conversations = await storage.get<Conversation[]>("conversations");
    return conversations || [];
  } catch (error) {
    console.error("获取会话失败:", error);
    return [];
  }
};

// 获取当前会话ID
export const getCurrentConversationId = async (): Promise<string | null> => {
  try {
    const id = await storage.get<string>("currentConversationId");
    return id || null;
  } catch (error) {
    console.error("获取当前会话ID失败:", error);
    return null;
  }
};

// 获取当前会话
export const getCurrentConversation =
  async (): Promise<Conversation | null> => {
    try {
      const id = await getCurrentConversationId();
      if (!id) return null;

      const conversations = await getConversations();
      return conversations.find((c) => c.id === id) || null;
    } catch (error) {
      console.error("获取当前会话失败:", error);
      return null;
    }
  };

// 创建新会话
export const createNewConversation = async (): Promise<Conversation> => {
  try {
    const newConversation: Conversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const conversations = await getConversations();
    const conversationsList = conversations || [];
    await storage.set("conversations", [newConversation, ...conversationsList]);
    await storage.set("currentConversationId", newConversation.id);

    return newConversation;
  } catch (error) {
    console.error("Failed to create new conversation:", error);
    throw error;
  }
};

// 选择会话
export const selectConversation = async (
  id: string
): Promise<Conversation | null> => {
  try {
    const conversations = await getConversations();
    const conversation = conversations.find((c) => c.id === id);

    if (conversation) {
      await storage.set("currentConversationId", id);
      return conversation;
    }

    return null;
  } catch (error) {
    console.error("选择会话失败:", error);
    throw error;
  }
};

// 删除会话
export const deleteConversation = async (id: string): Promise<void> => {
  try {
    const conversations = await getConversations();
    const updatedConversations = conversations.filter((c) => c.id !== id);

    await storage.set("conversations", updatedConversations);

    // 如果删除的是当前会话，选择另一个会话或创建新的
    const currentId = await getCurrentConversationId();
    if (currentId === id) {
      if (updatedConversations.length > 0) {
        await storage.set("currentConversationId", updatedConversations[0].id);
      } else {
        const newConversation = await createNewConversation();
        await storage.set("currentConversationId", newConversation.id);
      }
    }
  } catch (error) {
    console.error("删除会话失败:", error);
    throw error;
  }
};

// 清除当前会话消息
export const clearCurrentConversation = async (): Promise<void> => {
  try {
    const id = await getCurrentConversationId();
    if (!id) return;

    const conversations = await getConversations();
    const updatedConversations = conversations.map((c) =>
      c.id === id ? { ...c, messages: [], updatedAt: new Date() } : c
    );

    await storage.set("conversations", updatedConversations);
  } catch (error) {
    console.error("清除会话失败:", error);
    throw error;
  }
};

// 添加用户消息到当前会话
export const addUserMessage = async (content: string): Promise<Message> => {
  try {
    let conversation = await getCurrentConversation();

    // 如果没有当前会话，创建一个新的
    if (!conversation) {
      conversation = await createNewConversation();
    }

    const message: Message = {
      id: generateId(),
      type: "user",
      content,
      timestamp: new Date(),
    };

    // 更新会话
    const updatedMessages = [...conversation.messages, message];
    await updateConversationMessages(conversation.id, updatedMessages);

    return message;
  } catch (error) {
    console.error("添加用户消息失败:", error);
    throw error;
  }
};

// 添加助手消息到当前会话
export const addAssistantMessage = async (
  content: string
): Promise<Message> => {
  try {
    const conversation = await getCurrentConversation();
    if (!conversation) throw new Error("当前没有活跃的会话");

    const message: Message = {
      id: generateId(),
      type: "assistant",
      content,
      timestamp: new Date(),
    };

    // 更新会话
    const updatedMessages = [...conversation.messages, message];
    await updateConversationMessages(conversation.id, updatedMessages);

    return message;
  } catch (error) {
    console.error("添加助手消息失败:", error);
    throw error;
  }
};

// 更新会话标题
export const updateConversationTitle = async (
  id: string,
  title: string
): Promise<void> => {
  try {
    const conversations = await getConversations();
    const updatedConversations = conversations.map((c) =>
      c.id === id ? { ...c, title, updatedAt: new Date() } : c
    );

    await storage.set("conversations", updatedConversations);
  } catch (error) {
    console.error("更新会话标题失败:", error);
    throw error;
  }
};

// 更新会话消息
const updateConversationMessages = async (
  id: string,
  messages: Message[]
): Promise<void> => {
  try {
    const conversations = await getConversations();

    // 更新指定会话的消息
    const updatedConversations = conversations.map((c) => {
      if (c.id === id) {
        // 如果是新会话（只有一两条消息），尝试从用户问题生成标题
        let title = c.title;
        if (c.title === "New Chat" && messages.length <= 2) {
          const firstUserMsg = messages.find((m) => m.type === "user");
          if (firstUserMsg) {
            title = firstUserMsg.content.substring(0, 30);
            if (firstUserMsg.content.length > 30) title += "...";
          }
        }

        return {
          ...c,
          messages,
          title,
          updatedAt: new Date(),
        };
      }
      return c;
    });

    await storage.set("conversations", updatedConversations);
  } catch (error) {
    console.error("更新会话消息失败:", error);
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
    await addUserMessage(content);

    // 获取当前会话的所有消息
    const conversation = await getCurrentConversation();
    if (!conversation) throw new Error("No active conversation");

    // 将消息转换为API请求格式
    const messages = conversation.messages.map((msg) => ({
      role:
        msg.type === "user"
          ? "user"
          : msg.type === "assistant"
            ? "assistant"
            : "system",
      content: msg.content,
    }));

    // 添加系统消息（如果没有）
    if (!messages.some((m) => m.role === "system")) {
      messages.unshift({
        role: "system",
        content:
          "You are a helpful AI assistant named MIZU Agent. Answer questions succinctly and professionally. When a user asks about information that requires tools (like weather, time, etc.), identify the need and call the appropriate function.",
      });
    }

    // 构建请求
    const request: ChatRequest = {
      messages,
      temperature: 0.7,
      tools: AVAILABLE_TOOLS, // 无论是否直连都添加工具定义
    };

    // Step 1: Send request to backend which calls LLM (or directly to OpenRouter)
    const response = await sendChatRequest(request, apiKey);
    console.log("Initial API response:", response);

    // Step 2: Check if there are tool calls in the response
    if (
      response.success &&
      response.tool_calls &&
      response.tool_calls.length > 0
    ) {
      // Get the initial message content (might be empty or have instructions)
      const initialContent = response.data.choices[0].message.content || "";

      // Add a system message indicating tool call processing if there's content
      if (initialContent.trim()) {
        await addAssistantMessage(`🔍 ${initialContent}`);
      }

      // Process the tool call
      const toolCall = response.tool_calls[0];
      const { name, arguments: args } = toolCall;

      // Log the tool call (visible only to the user)
      await addAssistantMessage(
        `⚙️ Calling tool: ${name}(${JSON.stringify(args)})`
      );

      // Step 3: Execute the tool locally in the client
      const toolResult = await executeTool(name, args);

      // Log the tool result
      await addAssistantMessage(
        `📊 Tool result: ${JSON.stringify(toolResult.success ? toolResult.result : { error: toolResult.error })}`
      );

      // Step 4: Send the tool result back to the backend or process directly
      let finalResponse;

      try {
        // Create messages with tool result
        const messagesWithToolResult = [
          ...messages,
          {
            role: "assistant",
            content: initialContent,
            function_call: {
              name,
              arguments: JSON.stringify(args),
            },
          },
          {
            role: "function",
            name,
            content: JSON.stringify(
              toolResult.success
                ? toolResult.result
                : { error: toolResult.error }
            ),
          },
        ];

        // Send request with tool result
        finalResponse = await sendChatRequest(
          {
            messages: messagesWithToolResult,
            temperature: 0.7,
          },
          apiKey
        );
      } catch (error) {
        console.error("Error sending tool result:", error);
        throw new Error(
          `Failed to process tool result: ${error instanceof Error ? error.message : String(error)}`
        );
      }

      if (!finalResponse.success || !finalResponse.data) {
        throw new Error(
          finalResponse.error || "Failed to get follow-up response"
        );
      }

      // Step 5: Get the final assistant response
      const assistantResponse = finalResponse.data.choices[0].message.content;

      // Add the final response to the UI
      await addAssistantMessage(assistantResponse);

      return assistantResponse;
    }

    // No tool calls, just process the regular response
    if (!response.success || !response.data) {
      const errorMessage = response.error || "Failed to get model response";
      await addAssistantMessage(
        `Sorry, there was an error processing your request: ${errorMessage}`
      );
      throw new Error(errorMessage);
    }

    // 获取响应内容
    const assistantResponse = response.data.choices[0].message.content;

    // 添加助手回复
    await addAssistantMessage(assistantResponse);

    return assistantResponse;
  } catch (error) {
    console.error("Failed to send message:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    await addAssistantMessage(`Error: ${errorMessage}`);
    throw error;
  }
};
