import { Message } from "../types/messages";
import { Conversation } from "../types/conversations";

interface UserInfo {
  id: string;
  username: string;
  email: string | null;
  api_key_enabled: boolean;
  api_key: string;
}

class IndexedDB {
  private dbName = "mizu-agent";
  private dbVersion = 2;
  private stores = {
    conversations: "conversations",
    messages: "messages",
  };

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create conversations store
        if (!db.objectStoreNames.contains(this.stores.conversations)) {
          const conversationStore = db.createObjectStore(
            this.stores.conversations,
            { keyPath: "id" }
          );
          conversationStore.createIndex("created_at", "created_at", {
            unique: false,
          });
        }

        // Create messages store
        if (!db.objectStoreNames.contains(this.stores.messages)) {
          const messageStore = db.createObjectStore(this.stores.messages, {
            keyPath: "message_id",
            autoIncrement: false,
          });
          messageStore.createIndex("conversation_id", "conversation_id", {
            unique: false,
          });
          messageStore.createIndex("created_at", "created_at", {
            unique: false,
          });
        }
      };
    });
  }

  async saveUser(user: UserInfo): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        this.stores.conversations,
        "readwrite"
      );
      const store = transaction.objectStore(this.stores.conversations);
      const request = store.put(user);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(userId: string): Promise<UserInfo | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.stores.conversations, "readonly");
      const store = transaction.objectStore(this.stores.conversations);
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteUser(userId: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        this.stores.conversations,
        "readwrite"
      );
      const store = transaction.objectStore(this.stores.conversations);
      const request = store.delete(userId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Conversation operations
  async saveConversation(conversation: Conversation): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        this.stores.conversations,
        "readwrite"
      );
      const store = transaction.objectStore(this.stores.conversations);
      const request = store.put(conversation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.stores.conversations, "readonly");
      const store = transaction.objectStore(this.stores.conversations);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllConversations(): Promise<Conversation[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.stores.conversations, "readonly");
      const store = transaction.objectStore(this.stores.conversations);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConversation(id: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        this.stores.conversations,
        "readwrite"
      );
      const store = transaction.objectStore(this.stores.conversations);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Message operations
  async saveMessage(message: Message): Promise<void> {
    console.log("Saving message:", message);

    // 确保消息有 message_id
    if (!message.message_id) {
      console.warn("Message missing message_id, generating new one");
      message.message_id = crypto.randomUUID();
    }

    // 确保消息有所有必需的字段
    if (
      !message.role ||
      !message.content ||
      !message.created_at ||
      !message.conversation_id ||
      !message.message_id
    ) {
      console.error("Message missing required fields:", message);
      throw new Error("Message missing required fields");
    }

    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.stores.messages, "readwrite");
      const store = transaction.objectStore(this.stores.messages);

      try {
        const request = store.put(message);

        request.onsuccess = () => {
          console.log("Message saved successfully:", message.message_id);
          resolve();
        };

        request.onerror = (event) => {
          console.error("Error saving message:", event);
          reject(request.error);
        };
      } catch (error) {
        console.error("Error in saveMessage:", error);
        reject(error);
      }
    });
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.stores.messages, "readonly");
      const store = transaction.objectStore(this.stores.messages);
      const index = store.index("conversation_id");
      const request = index.getAll(conversationId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMessagesByConversation(conversationId: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.stores.messages, "readwrite");
      const store = transaction.objectStore(this.stores.messages);
      const index = store.index("conversation_id");
      const request = index.openCursor(conversationId);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // 获取相关消息及其上下文
  async getRelatedMessagesWithContext(
    messageIds: string[],
    conversationId: string
  ): Promise<Message[]> {
    const db = await this.openDB();
    const transaction = db.transaction(["messages"], "readonly");
    const store = transaction.objectStore("messages");
    const index = store.index("conversation_id");

    const allMessages: Message[] = [];

    for (const messageId of messageIds) {
      // 获取目标消息
      const targetMessage = await store.get(messageId);
      if (!targetMessage) continue;

      // 获取同一对话的所有消息
      const request = index.getAll(conversationId);
      const messages = await new Promise<Message[]>((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });

      // 按时间排序
      messages.sort(
        (a: Message, b: Message) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // 找到目标消息的索引
      const targetIndex = messages.findIndex((m) => m.message_id === messageId);
      if (targetIndex === -1) continue;

      // 获取前后各2条消息
      const start = Math.max(0, targetIndex - 2);
      const end = Math.min(messages.length, targetIndex + 3);
      const contextMessages = messages.slice(start, end);

      allMessages.push(...contextMessages);
    }

    return allMessages;
  }

  // 获取最近的N条消息
  async getRecentMessages(
    conversationId: string,
    limit: number
  ): Promise<Message[]> {
    const db = await this.openDB();
    const transaction = db.transaction(["messages"], "readonly");
    const store = transaction.objectStore("messages");
    const index = store.index("conversation_id");

    const request = index.getAll(conversationId);
    const messages = await new Promise<Message[]>((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });

    // 按时间排序并获取最新的N条
    messages.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return messages.slice(0, limit);
  }
}

export const indexedDB = new IndexedDB();
