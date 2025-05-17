import { Message } from "../types/messages";
import { Conversation } from "../types/conversations";
import Dexie, { Table } from "dexie";
import { env } from "./env";
import { Model } from "~/types";
import { getApiKey } from "~/services/cache";
import { PROVIDER_MODELS } from "./models";

export const systemModelId = "system";

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
  photoURL?: string;
}

class MizuDB extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  users!: Table<UserInfo>;
  models!: Table<Model>;

  constructor() {
    super("mizu-agent");

    this.version(6).stores({
      conversations: "id, *messages, user_id",
      messages: "id, conversation_id",
      users:
        "id, api_key, api_key_enabled, credits, created_at, email, username, photoURL, updated_at",
      models: "id, userId, type, [userId+id]",
    });

    // Add index definitions
    this.messages.hook("creating", function (primKey, obj) {
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
    const existingModel = await this.models
      .where("id")
      .equals(model.id)
      .and((m) => m.userId === "")
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

  async getConversation(id: string): Promise<Conversation | null> {
    const conversation = await this.conversations.get(id);
    return conversation || null;
  }

  async getAllConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversations
      .where("user_id")
      .equals(userId)
      .toArray();

    return await Promise.all(
      conversations
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map(async (conversation: Conversation) => ({
          ...conversation,
          messages: await this.messages
            .where("conversation_id")
            .equals(conversation.id)
            .sortBy("id"),
        })) || []
    );
  }

  async deleteConversation(id: string): Promise<void> {
    await this.conversations.delete(id);
  }

  // Message operations
  async saveMessage(message: Message): Promise<void> {
    if (!message.id) {
      throw new Error("Message missing id");
    }

    try {
      await this.messages.put(message);
    } catch (error) {
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
      .sortBy("id");
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
    messageIds: number[],
    conversationId: string
  ): Promise<Message[]> {
    const allMessages = await this.messages
      .where("conversation_id")
      .equals(conversationId)
      .sortBy("id");

    const contextMessages: Message[] = [];

    for (const messageId of messageIds) {
      const targetIndex = allMessages.findIndex(
        (m: Message) => m.id === messageId
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
      .sortBy("id");

    return messages.slice(0, limit);
  }

  // Conversation and Messages operations
  async saveConversationsAndMessages(
    conversations: Conversation[],
    userId: string
  ): Promise<void> {
    try {
      await this.transaction(
        "rw",
        [this.conversations, this.messages],
        async () => {
          // If userId is provided, clear old data first
          await this.clearUserData(userId);

          for (const conversation of conversations) {
            const { messages, ...rest } = conversation;
            await this.conversations.put(rest);

            if (messages && messages.length > 0) {
              const validMessages = messages.filter((msg) => {
                if (msg && msg.id) {
                  return {
                    ...msg,
                    conversation_id: conversation.id,
                  };
                }
              });
              await this.messages.bulkPut(validMessages);
            }
          }
        }
      );
    } catch (error) {
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
        type: selectedModel.type,
        apiKey: selectedModel.apiKey,
        apiUrl: selectedModel.apiUrl,
        userId: selectedModel.userId,
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

      const systemModel = {
        id: systemModelId,
        type: "system",
        name: "Mysta",
        userId: user.id,
        apiKey: "",
        apiUrl: "",
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
  async getUserByApiKey(): Promise<UserInfo | null> {
    const apiKey = await getApiKey();
    if (!apiKey) return null;
    const user = await this.users.where("api_key").equals(apiKey).first();
    return user || null;
  }

  async initModels(userId: string): Promise<void> {
    const allModels = PROVIDER_MODELS.flatMap((provider) =>
      provider.models.map((model) => ({
        ...model,
        userId,
        name: model.id === "system" ? env.DEFAULT_MODEL : model.name,
        type: model.id === "system" ? "Default" : provider.type,
        apiKey: model.id === "system" ? "" : "",
        apiUrl: model.id === "system" ? "" : model.apiUrl,
      }))
    );
    await this.models.bulkPut(allModels);
  }
}

let dbInstance = new MizuDB();

export async function resetDB() {
  await dbInstance.delete();
  dbInstance = new MizuDB();
  (window as any).mizuDB = dbInstance;
  return dbInstance;
}

const dbProxy = new Proxy(
  {},
  {
    get(target, prop) {
      return dbInstance[prop as keyof MizuDB];
    },
  }
);

export const db = dbProxy as MizuDB;
