import { Message } from "../types/messages";
import { Conversation } from "../types/conversations";
import Dexie, { Table } from "dexie";
import { env } from "./env";
import { Model, ModelType } from "~/types";

interface UserInfo {
  id: string;
  username: string;
  email: string | null;
  api_key_enabled: boolean;
  api_key: string;
  credits: string; // Credits stored as string in IndexedDB
  created_at: string;
  updated_at: string;
  selectedModelId: string;
  api_url: string;
}

class MizuDB extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  users!: Table<UserInfo>;
  models!: Table<{
    id: string;
    type: string;
    name: string;
    userId: string;
    apiKey: string;
    apiUrl: string;
  }>;

  constructor() {
    super("mizu-agent");

    this.version(6).stores({
      conversations: "id, created_at, *messages",
      messages: "message_id, conversation_id, created_at",
      users: "id, updated_at",
      models: "id, userId, type",
    });

    // Add index definitions
    this.messages.hook("creating", function (primKey, obj) {
      if (!obj.created_at) {
        obj.created_at = new Date().toISOString();
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
      throw new Error("User ID is required to get models");
    }
    try {
      return await this.models.where("userId").equals(userId).toArray();
    } catch (error) {
      console.error("Error getting user models:", error);
      throw new Error(
        `Failed to get user models: ${error instanceof Error ? error.message : "Unknown error"}`
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
    await this.models.put(model);
  }
  async deleteModel(modelId: string) {
    await this.models.delete(modelId);
  }

  // Conversation operations
  async saveConversation(conversation: Conversation): Promise<void> {
    await this.conversations.put(conversation);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const conversation = await this.conversations.get(id);
    return conversation || null;
  }

  async getAllConversations(): Promise<Conversation[]> {
    const conversations = await this.conversations
      .orderBy("created_at")
      .reverse()
      .toArray();

    return await Promise.all(
      conversations.map(async (conversation) => ({
        ...conversation,
        messages: await this.messages
          .where("conversation_id")
          .equals(conversation.id)
          .sortBy("created_at"),
      })) || []
    );
  }

  async deleteConversation(id: string): Promise<void> {
    await this.conversations.delete(id);
  }

  // Message operations
  async saveMessage(message: Message): Promise<void> {
    if (!message.message_id) {
      console.warn("Message missing message_id, generating new one");
      throw new Error("Message missing message_id");
    }

    try {
      await this.messages.put(message);
      console.log("Message saved successfully:", message.message_id);
    } catch (error) {
      console.error("Error in saveMessage:", error);
      throw error;
    }
  }

  async saveMessages(messages: Message[]): Promise<void> {
    await this.messages.bulkPut(messages);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const messages = await this.messages
      .where("conversation_id")
      .equals(conversationId)
      .sortBy("created_at");
    return messages || [];
  }

  async deleteMessagesByConversation(conversationId: string): Promise<void> {
    await this.messages
      .where("conversation_id")
      .equals(conversationId)
      .delete();
  }

  // Related messages operations
  async getRelatedMessagesWithContext(
    messageIds: string[],
    conversationId: string
  ): Promise<Message[]> {
    const allMessages = await this.messages
      .where("conversation_id")
      .equals(conversationId)
      .sortBy("created_at");

    const contextMessages: Message[] = [];

    for (const messageId of messageIds) {
      const targetIndex = allMessages.findIndex(
        (m: Message) => m.message_id === messageId
      );
      if (targetIndex === -1) continue;

      // Get 2 messages before and after the target message
      const start = Math.max(0, targetIndex - 2);
      const end = Math.min(allMessages.length, targetIndex + 3);
      contextMessages.push(...allMessages.slice(start, end));
    }

    return contextMessages;
  }

  async getRecentMessages(
    conversationId: string,
    limit: number
  ): Promise<Message[]> {
    const messages = await this.messages
      .where("conversation_id")
      .equals(conversationId)
      .reverse()
      .sortBy("created_at");

    return messages.slice(0, limit);
  }

  // Conversation and Messages operations
  async saveConversationsAndMessages(
    conversations: Array<{ conversation: Conversation }>,
    userId?: string
  ): Promise<void> {
    try {
      await this.transaction(
        "rw",
        [this.conversations, this.messages],
        async () => {
          // If userId is provided, clear old data first
          if (userId) {
            await this.clearUserData(userId);
          }

          for (const { conversation } of conversations) {
            if (!conversation || !conversation.id) {
              console.warn("Invalid conversation data:", conversation);
              continue;
            }

            // Save conversation
            await this.conversations.put({
              ...conversation,
              created_at: conversation.created_at || new Date().toISOString(),
            });

            // Save messages if they exist
            if (conversation.messages && conversation.messages.length > 0) {
              const validMessages = conversation.messages.filter(
                (msg) => msg && msg.message_id && msg.conversation_id
              );

              if (validMessages.length > 0) {
                await this.messages.bulkPut(validMessages);
              }
            }
          }
        }
      );
    } catch (error) {
      console.error("Error in saveConversationsAndMessages:", error);
      throw new Error(
        `Failed to save conversations and messages: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async clearAllConversations() {
    await this.transaction(
      "rw",
      this.conversations,
      this.messages,
      async () => {
        await this.messages.clear();
        await this.conversations.clear();
      }
    );
  }

  async clearUserData(userId: string) {
    await this.transaction(
      "rw",
      [this.conversations, this.messages],
      async () => {
        // Delete all messages from conversations belonging to this user
        const userConversations = await this.conversations
          .where("user_id")
          .equals(userId)
          .toArray();

        const conversationIds = userConversations.map((conv) => conv.id);

        // Delete all messages from these conversations
        await this.messages
          .where("conversation_id")
          .anyOf(conversationIds)
          .delete();

        // Delete all conversations for this user
        await this.conversations.where("user_id").equals(userId).delete();
      }
    );
  }

  // 新增：获取当前用户（取 updated_at 最新的用户）
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const users = await this.users.orderBy("updated_at").reverse().toArray();
      return users[0] || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw new Error(
        `Failed to get current user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getSelectModel(): Promise<Model | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const selectedModel = await this.models
        .where("id")
        .equals(user.selectedModelId)
        .first();
      if (!selectedModel) return null;

      return {
        id: selectedModel.id,
        name: selectedModel.name,
        type: selectedModel.type as ModelType,
        apiKey: selectedModel.apiKey,
        apiUrl: selectedModel.apiUrl,
      };
    } catch (error) {
      console.error("Error getting selected model:", error);
      return null;
    }
  }

  async saveOrUpdateUser(user: UserInfo): Promise<void> {
    console.log("saveOrUpdateUser = ", user);
    if (!user || !user.id) {
      throw new Error("Invalid user data: user ID is required");
    }

    try {
      const now = new Date().toISOString();
      const existing = await this.users.get(user.id);
      const systemModelId = "system";

      console.log(".....", env.LLM_API_KEY, env.LLM_API_URL);
      const systemModel = {
        id: systemModelId,
        type: "system",
        name: "Mysta Model",
        userId: user.id,
        apiKey: env.LLM_API_KEY,
        apiUrl: env.LLM_API_URL,
      };

      if (existing) {
        await this.users.put({
          ...user,
          selectedModelId: systemModelId,
          created_at: existing.created_at,
          updated_at: now,
        });
      } else {
        await this.users.put({ ...user, created_at: now, updated_at: now });
      }

      await this.models.put(systemModel);
    } catch (error) {
      console.error("Error saving/updating user:", error);
      throw new Error(
        `Failed to save/update user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export const db = new MizuDB();
