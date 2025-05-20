/**
 * 会话服务 - 管理会话相关功能
 */

import { env } from '../utils/env';
import { getApiKey } from './cache';
import { Conversation } from '../types/conversations';
import { db } from '../utils/db';
import { showLoginModal } from '~/utils/global-event';
import { APIClient } from '@the-agent/shared';

// Create API client instance
const createApiClient = async (): Promise<APIClient> => {
  const keyToUse = await getApiKey();
  if (!keyToUse || !keyToUse.trim()) {
    showLoginModal();
    throw new Error('Authentication required');
  }
  return new APIClient({
    baseUrl: env.BACKEND_URL,
    apiKey: keyToUse,
  });
};

export const createConversationApi = async (): Promise<{
  success: boolean;
  id?: number;
  error?: string;
}> => {
  try {
    const client = await createApiClient();
    const response = await client.createConversation({});
    return {
      success: true,
      id: response.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const deleteConversationApi = async (
  conversationId: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const client = await createApiClient();
    const response = await client.deleteConversation({ id: conversationId });

    return {
      success: response.deleted,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * 获取所有会话
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const user = await db.getUserByApiKey();
    if (!user) {
      throw new Error('User not found');
    }

    const client = await createApiClient();
    const response = await client.listConversations();
    const serverConversations: Conversation[] = response.conversations.map(conv => ({
      id: Number(conv.id),
      title: conv.messages?.[0]?.content?.slice(0, 20) || 'New Chat',
      user_id: user?.id || '',
      messages: conv.messages,
    }));
    await db.saveConversationsAndMessages(serverConversations, user.id);

    return serverConversations;
  } catch (error) {
    console.error('Error in getConversations:', error);
    throw error;
  }
};

/**
 * 获取当前会话
 */
export const getCurrentConversation = async (): Promise<Conversation | null> => {
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
    const user = await db.getUserByApiKey();
    if (!response.success || !response.id || !user) {
      throw new Error(response.error || 'Failed to create conversation');
    }

    const conversation: Conversation = {
      id: response.id,
      title: 'New Chat',
      user_id: user?.id || '',
      messages: [],
    };

    await db.saveConversation(conversation);

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * 选择会话
 */
export const selectConversation = async (id: number): Promise<Conversation | null> => {
  try {
    // 从 IndexedDB 获取会话
    const conversation = await db.getConversation(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // 获取会话的消息
    const messages = await db.getMessagesByConversation(id);
    conversation.messages = messages;

    return conversation;
  } catch (error) {
    throw error;
  }
};

/**
 * 删除会话
 */
export const deleteConversation = async (id: number): Promise<void> => {
  try {
    const response = await deleteConversationApi(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete conversation');
    }

    await db.deleteConversation(id);
    await db.deleteMessagesByConversation(id);
  } catch (error) {
    throw error;
  }
};
