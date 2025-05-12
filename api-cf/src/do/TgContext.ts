import { DurableObject } from "cloudflare:workers";
import OpenAI from "openai";
import {
  CREATE_TELEGRAM_DIALOGS_TABLE_QUERY,
  CREATE_TELEGRAM_MESSAGES_TABLE_QUERY,
} from "./sql";
import {
  ChatInfo,
  MessageInfo,
  TelegramChatData,
  TelegramMessageData,
} from "./types";

// Constants for embedding model
const EMBEDDING_MODEL = "intfloat/multilingual-e5-large";
const EMBEDDING_API_BASE_URL = "https://api.deepinfra.com/v1/openai";
const DEFAULT_VECTOR_NAMESPACE = "telegram";

// Interface for Vector Index
interface VectorizeIndex {
  query(vector: number[], options: any): Promise<any>;
  insert(vectors: any[]): Promise<any>;
}

// Extend env type to include the vector index
declare global {
  interface Env {
    TELEGRAM_E5_INDEX: VectorizeIndex;
  }
}

export class TgContext extends DurableObject<Env> {
  openai: OpenAI;
  sql: D1Database;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql as unknown as D1Database;

    // Initialize database tables
    this.sql.exec(CREATE_TELEGRAM_DIALOGS_TABLE_QUERY);
    this.sql.exec(CREATE_TELEGRAM_MESSAGES_TABLE_QUERY);

    // Initialize OpenAI client for embeddings
    this.openai = new OpenAI({
      apiKey: env.EMBEDDING_API_KEY,
      baseURL: EMBEDDING_API_BASE_URL,
    });
  }

  // Get all dialogs with filtering options
  async getDialogs(
    limit: number = 100,
    offset: number = 0,
    chatTitle?: string,
    isPublic?: boolean,
    isFree?: boolean,
    status?: string,
    sortBy: string = "updated_at",
    sortOrder: string = "desc"
  ) {
    // Build the query with filters
    let query = `
      SELECT 
        d.*,
        (SELECT COUNT(*) FROM telegram_messages m WHERE m.chat_id = d.chat_id) as message_count
      FROM 
        telegram_dialogs d
      WHERE 1=1
    `;

    const params: any[] = [];

    if (chatTitle) {
      query += ` AND d.chat_title LIKE ?`;
      params.push(`%${chatTitle}%`);
    }

    if (isPublic !== undefined) {
      query += ` AND d.is_public = ?`;
      params.push(isPublic ? 1 : 0);
    }

    if (isFree !== undefined) {
      query += ` AND d.is_free = ?`;
      params.push(isFree ? 1 : 0);
    }

    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    } else {
      query += ` AND d.status = 'active'`;
    }

    // Count total matching records
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM (${query})
    `;
    const countStmt = this.sql.prepare(countQuery).bind(...params);
    const countResult = await countStmt.first();
    const totalCount = (countResult?.total_count as number) || 0;

    // Add sorting and pagination
    query += ` ORDER BY d.${sortBy} ${sortOrder === "asc" ? "ASC" : "DESC"}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute the final query
    const stmt = this.sql.prepare(query).bind(...params);
    const result = await stmt.all();
    const dialogs = result.results;

    return {
      dialogs,
      total_count: totalCount,
      limit,
      offset,
    };
  }

  // Get messages for a specific chat with filtering options
  async getMessages(
    chatId: string,
    limit: number = 100,
    offset: number = 0,
    messageText?: string,
    senderId?: string,
    senderUsername?: string,
    startTimestamp?: number,
    endTimestamp?: number,
    sortBy: string = "message_timestamp",
    sortOrder: string = "desc"
  ) {
    // Check if chat exists and user has access to it
    const chatStmt = this.sql
      .prepare(
        `
      SELECT * FROM telegram_dialogs WHERE chat_id = ? AND status = 'active'
    `
      )
      .bind(chatId);

    const chat = await chatStmt.first();

    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found or not accessible`);
    }

    // Build the query with filters
    let query = `
      SELECT * FROM telegram_messages WHERE chat_id = ?
    `;

    const params: any[] = [chatId];

    if (messageText) {
      query += ` AND message_text LIKE ?`;
      params.push(`%${messageText}%`);
    }

    if (senderId) {
      query += ` AND sender_id = ?`;
      params.push(senderId);
    }

    if (senderUsername) {
      query += ` AND sender_username LIKE ?`;
      params.push(`%${senderUsername}%`);
    }

    if (startTimestamp) {
      query += ` AND message_timestamp >= ?`;
      params.push(startTimestamp);
    }

    if (endTimestamp) {
      query += ` AND message_timestamp <= ?`;
      params.push(endTimestamp);
    }

    // Count total matching records
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM (${query})
    `;
    const countStmt = this.sql.prepare(countQuery).bind(...params);
    const countResult = await countStmt.first();
    const totalCount = (countResult?.total_count as number) || 0;

    // Add sorting and pagination
    query += ` ORDER BY ${sortBy} ${sortOrder === "asc" ? "ASC" : "DESC"}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute the final query
    const messagesStmt = this.sql.prepare(query).bind(...params);
    const result = await messagesStmt.all();
    const messages = result.results as Record<string, unknown>[];

    // Prepare chat info for response
    const chatInfo: ChatInfo = {
      id: chat.id as string,
      chat_id: chat.chat_id as string,
      chat_title: chat.chat_title as string,
      chat_type: chat.chat_type as string,
      is_public: chat.is_public === 1,
      is_free: chat.is_free === 1,
    };

    // Transform messages to correct type
    const messageInfos = messages.map((msg) => ({
      id: msg.id as string,
      message_id: msg.message_id as string,
      message_text: msg.message_text as string,
      message_timestamp: msg.message_timestamp as number,
      sender_id: msg.sender_id as string,
      sender_username: msg.sender_username as string | null,
      sender_firstname: msg.sender_firstname as string | null,
      sender_lastname: msg.sender_lastname as string | null,
    }));

    return {
      chat: chatInfo,
      messages: messageInfos,
      total_count: totalCount,
      limit,
      offset,
    };
  }

  // Search messages using vector similarity
  async searchMessages(
    query: string,
    chatId?: string,
    topK: number = 10,
    messageRange: number = 2,
    threshold: number = 0.7,
    isPublic?: boolean,
    isFree?: boolean
  ) {
    // Generate embedding for the search query
    let queryEmbeddingAvailable = false;
    let results: any[] = [];

    try {
      const response = await this.openai.embeddings.create({
        input: query,
        model: EMBEDDING_MODEL,
        encoding_format: "float",
      });
      const embedding = response.data[0].embedding;
      queryEmbeddingAvailable = true;

      // Build filter for vector search
      const filter: any = {};

      if (chatId) {
        filter.chat_id = { $eq: chatId };
      }

      // Search vector database for similar messages
      const vectorResults = await this.env.TELEGRAM_E5_INDEX.query(embedding, {
        topK,
        namespace: DEFAULT_VECTOR_NAMESPACE,
        filter,
        returnValues: false,
        returnMetadata: "indexed",
      });

      // Process vector search results
      const matchIds = new Set<string>();
      for (const match of vectorResults.matches) {
        if (match.score && match.score >= threshold) {
          const metadata = match.metadata as any;
          if (metadata && metadata.message_id) {
            matchIds.add(metadata.message_id);
          }
        }
      }

      // Get matching messages and surrounding context
      for (const matchId of matchIds) {
        // Get the matching message
        const matchStmt = this.sql
          .prepare(
            `
          SELECT m.*, d.id as dialog_id, d.chat_title, d.chat_type, d.is_public, d.is_free
          FROM telegram_messages m
          JOIN telegram_dialogs d ON m.chat_id = d.chat_id
          WHERE m.id = ? AND d.status = 'active'
        `
          )
          .bind(matchId);

        const matchMessage = await matchStmt.first();

        if (!matchMessage) continue;

        // Apply additional filters on the database level
        if (
          isPublic !== undefined &&
          matchMessage.is_public !== (isPublic ? 1 : 0)
        )
          continue;
        if (isFree !== undefined && matchMessage.is_free !== (isFree ? 1 : 0))
          continue;

        // Get surrounding context messages
        const contextQuery = `
          SELECT m.*
          FROM telegram_messages m
          WHERE m.chat_id = ?
          AND m.message_timestamp BETWEEN 
            (SELECT message_timestamp FROM telegram_messages WHERE id = ?) - ${
              messageRange * 3600
            } 
            AND (SELECT message_timestamp FROM telegram_messages WHERE id = ?) + ${
              messageRange * 3600
            }
          ORDER BY m.message_timestamp
        `;

        const contextStmt = this.sql
          .prepare(contextQuery)
          .bind(matchMessage.chat_id, matchId, matchId);
        const contextResult = await contextStmt.all();
        const contextMessages = contextResult.results as Record<
          string,
          unknown
        >[];

        // Prepare chat info
        const chatInfo: ChatInfo = {
          id: matchMessage.dialog_id as string,
          chat_id: matchMessage.chat_id as string,
          chat_title: matchMessage.chat_title as string,
          chat_type: matchMessage.chat_type as string,
          is_public: matchMessage.is_public === 1,
          is_free: matchMessage.is_free === 1,
        };

        // Prepare message chunk with match indicators
        const messageChunk = contextMessages.map(
          (msg: Record<string, unknown>) => {
            const isMatch = msg.id === matchId;
            const result: MessageInfo = {
              id: msg.id as string,
              message_id: msg.message_id as string,
              message_text: msg.message_text as string,
              message_timestamp: msg.message_timestamp as number,
              sender_id: msg.sender_id as string,
              sender_username: msg.sender_username as string | null,
              sender_firstname: msg.sender_firstname as string | null,
              sender_lastname: msg.sender_lastname as string | null,
              is_match: isMatch,
              similarity: isMatch
                ? vectorResults.matches.find(
                    (m) => (m.metadata as any)?.message_id === matchId
                  )?.score || null
                : null,
            };
            return result;
          }
        );

        // Add to results
        results.push({
          chat: chatInfo,
          message_chunk: messageChunk,
        });
      }
    } catch (error) {
      console.error("Error generating embedding or searching:", error);
      // Fall back to simple text search if embedding fails
      if (!queryEmbeddingAvailable) {
        // TODO: Implement fallback text search if needed
      }
    }

    return {
      results,
      query_embedding_available: queryEmbeddingAvailable,
    };
  }

  // Sync a Telegram chat
  async syncChat(chatData: TelegramChatData): Promise<string> {
    const {
      chat_id,
      chat_title,
      chat_type,
      is_public,
      is_free,
      subscription_fee,
    } = chatData;

    // Check if chat already exists
    const chatStmt = this.sql
      .prepare(
        `
      SELECT * FROM telegram_dialogs WHERE chat_id = ?
    `
      )
      .bind(chat_id);

    const existingChat = await chatStmt.first();

    const now = new Date().toISOString();

    if (existingChat) {
      // Update existing chat
      const updateStmt = this.sql
        .prepare(
          `
        UPDATE telegram_dialogs
        SET 
          chat_title = ?,
          chat_type = ?,
          is_public = ?,
          is_free = ?,
          subscription_fee = ?,
          last_synced_at = ?,
          updated_at = ?,
          status = 'active'
        WHERE chat_id = ?
      `
        )
        .bind(
          chat_title,
          chat_type,
          is_public ? 1 : 0,
          is_free ? 1 : 0,
          subscription_fee,
          now,
          now,
          chat_id
        );

      await updateStmt.run();

      return chat_id;
    } else {
      // Insert new chat
      const id = crypto.randomUUID();

      const insertStmt = this.sql
        .prepare(
          `
        INSERT INTO telegram_dialogs
        (id, chat_id, chat_title, chat_type, is_public, is_free, subscription_fee, last_synced_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
        )
        .bind(
          id,
          chat_id,
          chat_title,
          chat_type,
          is_public ? 1 : 0,
          is_free ? 1 : 0,
          subscription_fee,
          now,
          now,
          now
        );

      await insertStmt.run();

      return chat_id;
    }
  }

  // Sync messages for a chat
  async syncMessages(
    chatId: string,
    messages: TelegramMessageData[]
  ): Promise<number> {
    // Check if chat exists
    const chatStmt = this.sql
      .prepare(
        `
      SELECT * FROM telegram_dialogs WHERE chat_id = ? AND status = 'active'
    `
      )
      .bind(chatId);

    const chat = await chatStmt.first();

    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found or not accessible`);
    }

    let insertedCount = 0;
    const messagesToEmbed: { id: string; text: string }[] = [];

    // Insert messages in transaction
    await this.sql.exec("BEGIN TRANSACTION");

    try {
      for (const message of messages) {
        const id = crypto.randomUUID();

        // Check if message already exists
        const msgStmt = this.sql
          .prepare(
            `
          SELECT * FROM telegram_messages WHERE chat_id = ? AND message_id = ?
        `
          )
          .bind(chatId, message.message_id);

        const existingMessage = await msgStmt.first();

        if (!existingMessage) {
          // Insert new message
          const insertStmt = this.sql
            .prepare(
              `
            INSERT INTO telegram_messages
            (id, chat_id, message_id, message_text, message_timestamp, sender_id, sender_username, sender_firstname, sender_lastname)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
            )
            .bind(
              id,
              chatId,
              message.message_id,
              message.message_text,
              message.message_timestamp,
              message.sender_id,
              message.sender_username,
              message.sender_firstname,
              message.sender_lastname
            );

          await insertStmt.run();

          insertedCount++;

          // Collect messages for embedding
          if (message.message_text.trim().length > 0) {
            messagesToEmbed.push({
              id,
              text: message.message_text,
            });
          }
        }
      }

      await this.sql.exec("COMMIT");

      // Update chat's last_synced_at and updated_at
      const now = new Date().toISOString();
      const updateStmt = this.sql
        .prepare(
          `
        UPDATE telegram_dialogs
        SET last_synced_at = ?, updated_at = ?
        WHERE chat_id = ?
      `
        )
        .bind(now, now, chatId);

      await updateStmt.run();

      // Generate embeddings for new messages in batches
      if (messagesToEmbed.length > 0) {
        // Process in batches of 10
        const batchSize = 10;
        for (let i = 0; i < messagesToEmbed.length; i += batchSize) {
          const batch = messagesToEmbed.slice(i, i + batchSize);
          await this._generateAndStoreEmbeddings(batch, chatId);
        }
      }

      return insertedCount;
    } catch (error) {
      // Rollback on error
      await this.sql.exec("ROLLBACK");
      throw error;
    }
  }

  // Helper method to generate and store embeddings
  private async _generateAndStoreEmbeddings(
    messages: { id: string; text: string }[],
    chatId: string
  ): Promise<void> {
    try {
      // Create texts array for embedding
      const texts: string[] = [];
      for (const message of messages) {
        texts.push(message.text);
      }

      const response = await this.openai.embeddings.create({
        input: texts,
        model: EMBEDDING_MODEL,
        encoding_format: "float",
      });

      const toInsert = response.data.map((item, index) => {
        return {
          id: messages[index].id,
          values: item.embedding,
          metadata: {
            message_id: messages[index].id,
            chat_id: chatId,
          },
          namespace: DEFAULT_VECTOR_NAMESPACE,
        };
      });

      // Insert embeddings into vector database
      await this.env.TELEGRAM_E5_INDEX.insert(toInsert);

      // Update messages with embedding_id
      for (const message of messages) {
        const updateStmt = this.sql
          .prepare(
            `
          UPDATE telegram_messages
          SET embedding_id = ?
          WHERE id = ?
        `
          )
          .bind(message.id, message.id);

        await updateStmt.run();
      }
    } catch (error) {
      console.error("Error generating embeddings:", error);
      // Continue execution even if embedding fails
    }
  }
}
