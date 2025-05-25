import { Conversation } from '../types/conversations';
import Dexie, { Table } from 'dexie';
import { Model } from '~/types';
import { PROVIDER_MODELS } from './models';
import { Message } from '@the-agent/shared';
import { DEFAULT_MODEL, SYSTEM_MODEL_ID } from './constants';
import { env } from './env';
import { getApiKey } from '~/services/cache';
import { sortConversations } from './chat';

export interface UserInfo {
  id: string;
  username?: string;
  email?: string | null;
  api_key_enabled: boolean;
  api_key: string;
  credits: string; // Credits stored as string in IndexedDB
  created_at: string;
  updated_at: string;
  selectedModelId: string;
  photoURL?: string;
}

export interface VersionedMessage extends Message {
  version: number;
}

class MystaDB extends Dexie {
  getCurrentModel() {
    throw new Error('Method not implemented.');
  }
  conversations!: Table<Conversation>;
  messages!: Table<VersionedMessage>;
  users!: Table<UserInfo>;
  models!: Table<Model>;

  constructor() {
    super('mysta-agent');

    this.version(6).stores({
      conversations: 'id, *messages, user_id, last_selected_at',
      messages: 'id, conversation_id',
      users:
        'id, api_key, api_key_enabled, credits, created_at, email, username, photoURL, updated_at',
      models: 'id, userId, type, [userId+id]',
    });

    // Add index definitions
    this.messages.hook('creating', function (_, obj) {
      if (!obj.id) {
        obj.id = Date.now();
      }
    });
  }

  // User operations
  async saveUser(user: UserInfo): Promise<void> {
    await this.users.put(user);
  }

  async getUser(userId: string): Promise<UserInfo | null> {
    const user = await this.users.get(userId);
    return user || null;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.users.delete(userId);
  }

  // Model operations
  async getUserModels(userId: string) {
    if (!userId) {
      throw new Error('User ID is required to get models');
    }
    try {
      return await this.models.where('userId').equals(userId).toArray();
    } catch (error) {
      console.error('Error getting user models:', error);
      throw new Error(
        `Failed to get user models: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async addOrUpdateModel(model: {
    id: string;
    type: string;
    name: string;
    userId: string;
    apiKey: string;
    apiUrl: string;
  }) {
    const existingModel = await this.models
      .where('id')
      .equals(model.id)
      .and(m => m.userId === '')
      .first();
    if (existingModel) {
      await this.models.put({ ...existingModel, ...model });
    } else {
      await this.models.put(model);
    }
  }

  async deleteModel(modelId: string) {
    await this.models.delete(modelId);
  }

  // Conversation operations
  async saveConversation(conversation: Conversation): Promise<void> {
    await this.conversations.put(conversation);
  }

  async getConversation(id: number): Promise<Conversation | null> {
    const conversation = await this.conversations.get(id);
    return conversation || null;
  }

  async updateConversation(conversation: Conversation): Promise<void> {
    await this.conversations.put(conversation);
  }

  async getAllConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversations.where('user_id').equals(userId).toArray();
    const conversationsWithMessages = await Promise.all(
      conversations.map(
        async (conversation: Conversation) =>
          ({
            ...conversation,
            messages: await this.messages
              .where('conversation_id')
              .equals(conversation.id)
              .sortBy('id'),
          }) as Conversation
      ) || []
    );
    return sortConversations(conversationsWithMessages);
  }

  async deleteConversation(id: number): Promise<void> {
    await this.conversations.delete(id);
  }

  // Message operations
  async saveMessage(message: Message): Promise<void> {
    if (!message.id) {
      throw new Error('Message missing id');
    }

    // Check if message already exists in the database
    const existingMessage = await this.messages.get(message.id);
    const versionedMessage = {
      ...message,
      version: 1,
    };
    if (existingMessage) {
      // Use the existing version and increment it
      versionedMessage.version = existingMessage.version + 1;
    }
    await this.messages.put(versionedMessage);
  }

  async saveMessages(messages: Message[]): Promise<void> {
    await this.messages.bulkPut(messages.map(msg => ({ ...msg, version: 1 })));
  }

  async getMessagesByConversation(conversationId: number): Promise<VersionedMessage[]> {
    const messages = await this.messages
      .where('conversation_id')
      .equals(conversationId)
      .sortBy('id');
    return messages || [];
  }

  async getLastMessageVersion(conversationId: number): Promise<number> {
    // Get the last message in the conversation
    const messages = await this.messages
      .where('conversation_id')
      .equals(conversationId)
      .reverse()
      .limit(1)
      .toArray();

    return messages.length > 0 ? messages[0].version || 0 : 0;
  }

  async getLastInteractionTime(): Promise<number> {
    // Using reverse() and first() to get the highest id directly from the database
    const lastConversation = await this.conversations.orderBy('last_selected_at').reverse().first();
    return lastConversation?.last_selected_at || 0;
  }

  async deleteMessagesByConversation(conversationId: number): Promise<void> {
    await this.messages.where('conversation_id').equals(conversationId).delete();
  }

  // Related messages operations
  async getRelatedMessagesWithContext(
    messageIds: number[],
    conversationId: number
  ): Promise<Message[]> {
    const allMessages = await this.messages
      .where('conversation_id')
      .equals(conversationId)
      .sortBy('id');

    const contextMessages: Message[] = [];

    for (const messageId of messageIds) {
      const targetIndex = allMessages.findIndex((m: Message) => m.id === messageId);
      if (targetIndex === -1) continue;

      // Get 2 messages before and after the target message
      const start = Math.max(0, targetIndex - 2);
      const end = Math.min(allMessages.length, targetIndex + 3);
      contextMessages.push(...allMessages.slice(start, end));
    }

    return contextMessages;
  }

  async getRecentMessages(conversationId: number, limit: number): Promise<Message[]> {
    const messages = await this.messages
      .where('conversation_id')
      .equals(conversationId)
      .reverse()
      .sortBy('id');

    return messages.slice(0, limit);
  }

  // Conversation and Messages operations
  async saveConversationsAndMessages(conversations: Conversation[]): Promise<void> {
    try {
      await this.transaction('rw', [this.conversations, this.messages], async () => {
        for (const conversation of conversations) {
          const { messages, ...rest } = conversation;
          const existingConv = await this.conversations.get(conversation.id);
          if (!existingConv) {
            await this.conversations.put(rest);
          }

          if (messages && messages.length > 0) {
            const validMessages = messages.filter(msg => {
              if (msg && msg.id) {
                return {
                  ...msg,
                  conversation_id: conversation.id,
                };
              }
            });
            await this.messages.bulkPut(validMessages.map(msg => ({ ...msg, version: 1 })));
          }
        }
      });
    } catch (error) {
      throw new Error(
        `Failed to save conversations and messages: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async clearAllConversations() {
    await this.transaction('rw', [this.conversations, this.messages], async () => {
      await this.messages.clear();
      await this.conversations.clear();
    });
  }

  async clearUserData(userId: string) {
    await this.transaction('rw', [this.conversations, this.messages], async () => {
      // Delete all messages from conversations belonging to this user
      const userConversations = await this.conversations.where('user_id').equals(userId).toArray();

      const conversationIds = userConversations.map(conv => conv.id);

      // Delete all messages from these conversations
      await this.messages.where('conversation_id').anyOf(conversationIds).delete();

      // Delete all conversations for this user
      await this.conversations.where('user_id').equals(userId).delete();
    });
  }

  // 新增：获取当前用户（取 updated_at 最新的用户）
  async getCurrentUser(): Promise<UserInfo | null> {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return null;
    }
    return this.getUserByApiKey(apiKey.key);
  }

  async getSelectModel(): Promise<Model> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not found');
    }

    const selectedModel = await this.models.where('id').equals(user.selectedModelId).first();
    if (!selectedModel) {
      throw new Error('Model not found');
    }
    if (selectedModel.id === 'system') {
      const apiKey = await getApiKey();
      if (!apiKey?.enabled) {
        throw new Error('API key not found or not enabled');
      }
      selectedModel.apiKey = apiKey.key;
      selectedModel.apiUrl = env.BACKEND_URL;
    }
    return selectedModel;
  }

  async saveOrUpdateUser(user: UserInfo): Promise<void> {
    if (!user || !user.id) {
      throw new Error('Invalid user data: user ID is required');
    }

    try {
      const now = new Date().toISOString();
      const existing = await this.users.get(user.id);

      const systemModel = {
        id: SYSTEM_MODEL_ID,
        type: 'system',
        name: 'Mysta',
        userId: user.id,
        apiKey: '',
        apiUrl: '',
      };

      if (existing) {
        await this.users.put({
          ...user,
          selectedModelId: SYSTEM_MODEL_ID,
          created_at: existing.created_at,
          updated_at: now,
        });
      } else {
        await this.users.put({ ...user, created_at: now, updated_at: now });
      }

      await this.models.put(systemModel);
    } catch (error) {
      console.error('Error saving/updating user:', error);
      throw new Error(
        `Failed to save/update user: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  async getUserByApiKey(apiKey: string): Promise<UserInfo | null> {
    const user = await this.users.where('api_key').equals(apiKey).first();
    return user || null;
  }

  async initModels(userId: string): Promise<void> {
    const allModels = PROVIDER_MODELS.flatMap(provider =>
      provider.models.map(model => ({
        ...model,
        userId,
        name: model.id === 'system' ? DEFAULT_MODEL : model.name,
        type: model.id === 'system' ? 'Default' : provider.type,
        apiKey: model.id === 'system' ? '' : '',
        apiUrl: model.id === 'system' ? '' : model.apiUrl,
      }))
    );
    await this.models.bulkPut(allModels);
  }
}

let dbInstance = new MystaDB();

export async function resetDB() {
  await dbInstance.delete();
  dbInstance = new MystaDB();
  (window as unknown as { mystaDB: MystaDB }).mystaDB = dbInstance;
  return dbInstance;
}

const dbProxy = new Proxy(
  {},
  {
    get(_, prop) {
      return dbInstance[prop as keyof MystaDB];
    },
  }
);

export const db = dbProxy as MystaDB;
