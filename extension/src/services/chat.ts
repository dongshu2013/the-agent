/**
 * 聊天服务 - 管理聊天会话和消息
 */

import {
  sendChatRequest,
  ChatRequest,
  AVAILABLE_TOOLS,
  createConversationApi,
  deleteConversationApi,
  getConversationsApi,
  saveMessageApi,
} from "./api";

// 消息类型定义
export interface MessageType {
  id?: string; // 改为可选，因为新消息创建时还没有ID
  role: string;
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  type?: string; // 用于错误消息
}

// 会话类型定义
export interface Conversation {
  id: string;
  title: string;
  messages: MessageType[];
  createdAt: Date;
  updatedAt: Date;
}

// 缓存接口定义
interface CacheData<T> {
  data: T;
  timestamp: number;
}

// 缓存管理器
class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheData<any>>;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// 获取缓存管理器实例
const cacheManager = CacheManager.getInstance();

// 生成唯一ID
const generateId = (): string => {
  return crypto.randomUUID();
};

// 获取所有会话
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const cachedConversations =
      cacheManager.get<Conversation[]>("conversations");
    if (cachedConversations) {
      console.log("Using cached conversations");
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
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// 创建新会话
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
    console.error("Error creating conversation:", error);
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

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    cacheManager.set(`messages_${id}`, conversation.messages);
    return conversation;
  } catch (error) {
    console.error("Error selecting conversation:", error);
    throw error;
  }
};

// 删除会话
export const deleteConversation = async (id: string): Promise<void> => {
  try {
    const response = await deleteConversationApi(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to delete conversation");
    }

    cacheManager.delete("conversations");
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

// 添加用户消息
export const addUserMessage = async (content: string): Promise<MessageType> => {
  try {
    const message: MessageType = {
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
  content: string
): Promise<MessageType> => {
  try {
    const message: MessageType = {
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    return message;
  } catch (error) {
    console.error("Error adding assistant message:", error);
    throw error;
  }
};

// 获取当前会话
export const getCurrentConversation =
  async (): Promise<Conversation | null> => {
    try {
      const conversations = await getConversations();
      return conversations[0] || null; // 返回第一个会话作为当前会话
    } catch (error) {
      console.error("Error getting current conversation:", error);
      return null;
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
      throw new Error(
        saveUserMessageResponse.error || "Failed to save user message"
      );
    }

    // 更新用户消息的ID（从后端返回）
    userMessage.id = saveUserMessageResponse.data?.id;

    // 将消息添加到当前会话
    conversation.messages.push(userMessage);
    updateMessageCache(conversation.id, conversation.messages);

    // 将消息转换为API请求格式
    const messages = conversation.messages.map((msg: MessageType) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 添加系统消息（如果没有）
    if (!messages.some((m: { role: string }) => m.role === "system")) {
      messages.unshift({
        role: "system",
        content:
          "You are a helpful AI assistant named MIZU Agent. Answer questions succinctly and professionally. When a user asks about information that requires tools (like weather, time, etc.), identify the need and call the appropriate function.",
      });
    }

    // 构建请求
    const request: ChatRequest = {
      messages,
      ...(AVAILABLE_TOOLS.length > 0 ? { tools: AVAILABLE_TOOLS } : {}),
    };

    // 发送请求
    const response = await sendChatRequest(request, apiKey);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to get model response");
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
      throw new Error(
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw error;
  }
};

// 消息缓存管理函数
export const getCachedMessages = (
  conversationId: string
): MessageType[] | null => {
  return cacheManager.get<MessageType[]>(`messages_${conversationId}`);
};

export const updateMessageCache = (
  conversationId: string,
  messages: MessageType[]
): void => {
  cacheManager.set(`messages_${conversationId}`, messages);
};
