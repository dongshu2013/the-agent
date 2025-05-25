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
  if (!keyToUse?.enabled) {
    showLoginModal();
    throw new Error('Authentication required');
  }
  return new APIClient({
    baseUrl: env.BACKEND_URL,
    apiKey: keyToUse.key,
  });
};

/**
 * 同步所有会话
 */
export const syncConversations = async (
  userId: string,
  startFrom?: number
): Promise<Conversation[]> => {
  try {
    const client = await createApiClient();
    if (!startFrom) {
      startFrom = await db.getLastInteractionTime();
    }
    const response = await client.listConversations({ startFrom });
    const conversations = response.conversations.map(conv => ({
      id: Number(conv.id),
      title: conv.messages?.[0]?.content?.slice(0, 20) || 'New Chat',
      user_id: userId,
      messages: conv.messages,
    }));
    await db.saveConversationsAndMessages(conversations);

    return conversations;
  } catch (error) {
    console.error('Error in syncConversations:', error);
    throw error;
  }
};

export const createNewConversation = async (userId: string): Promise<Conversation> => {
  const convId = Date.now();
  const client = await createApiClient();
  await client.createConversation({ id: convId });
  const conversation: Conversation = {
    id: convId,
    title: 'New Chat',
    user_id: userId,
    messages: [],
    last_selected_at: Date.now(),
  };

  await db.saveConversation(conversation);
  return conversation;
};

/**
 * 选择会话
 */
export const selectConversation = async (id: number): Promise<Conversation | null> => {
  // 从 IndexedDB 获取会话
  const conversation = await db.getConversation(id);
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  conversation.last_selected_at = Date.now();
  await db.updateConversation(conversation);

  // 获取会话的消息
  const messages = await db.getMessagesByConversation(id);
  conversation.messages = messages;

  return conversation;
};

/**
 * 删除会话
 */
export const deleteConversation = async (id: number): Promise<void> => {
  const client = await createApiClient();
  await client.deleteConversation({ id });
  await db.deleteConversation(id);
  await db.deleteMessagesByConversation(id);
};
