import { DurableObject } from 'cloudflare:workers';
import OpenAI from 'openai';
import { CREATE_TELEGRAM_DIALOGS_TABLE_QUERY, CREATE_TELEGRAM_MESSAGES_TABLE_QUERY } from './sql';
import { TgChatInfo, TgMessageInfo, TelegramChatData, TelegramMessageData } from './types';
import { DEEPINFRA_API_BASE_URL, EMBEDDING_MODEL } from '../utils/common';

const TG_VECTOR_NAMESPACE = 'tg';

export class TgContext extends DurableObject<Env> {
  openai: OpenAI;
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(CREATE_TELEGRAM_DIALOGS_TABLE_QUERY);
    this.sql.exec(CREATE_TELEGRAM_MESSAGES_TABLE_QUERY);

    this.openai = new OpenAI({
      apiKey: env.DEEPINFRA_API_KEY,
      baseURL: DEEPINFRA_API_BASE_URL,
    });
  }

  // get my chat
  getMyChat() {
    const cursor = this.sql.exec(`SELECT * FROM telegram_dialogs`);
    const chats = [];

    for (const row of cursor) {
      chats.push({
        chat_id: row.chat_id,
        chat_title: row.chat_title,
        chat_type: row.chat_type,
        is_public: Boolean(row.is_public),
        is_free: Boolean(row.is_free),
        subscription_fee: Number(row.subscription_fee),
        last_synced_at: row.last_synced_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        status: row.status,
      });
    }

    return chats;
  }

  // Get stats for Telegram data
  async getStats(): Promise<{
    totalDialogs: number;
    totalMessages: number;
    lastSyncTime?: string;
  }> {
    const dialogsCountCursor = this.sql.exec(
      `SELECT COUNT(*) as channels_count FROM telegram_dialogs WHERE status = 'active'`
    );
    let totalDialogs = 0;
    for (const result of dialogsCountCursor) {
      totalDialogs = result.channels_count as number;
    }

    const messagesCountCursor = this.sql.exec(
      `SELECT COUNT(*) as messages_count FROM telegram_messages`
    );
    let totalMessages = 0;
    for (const result of messagesCountCursor) {
      totalMessages = result.messages_count as number;
    }

    return {
      totalDialogs,
      totalMessages,
    };
  }

  // Get all dialogs with filtering options
  async getDialogs(
    limit = 100,
    offset = 0,
    chatTitle?: string,
    isPublic?: boolean,
    isFree?: boolean,
    status?: string,
    sortBy = 'updated_at',
    sortOrder = 'desc'
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

    const params: unknown[] = [];

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

    const countResultCursor = this.sql.exec(countQuery, ...params);
    const countResults = [];
    for (const result of countResultCursor) {
      countResults.push(result);
    }
    const totalCount = countResults.length > 0 ? (countResults[0].total_count as number) || 0 : 0;

    // Add sorting and pagination
    const validSortColumns = ['updated_at', 'created_at', 'chat_title']; // 添加其他合法的排序列
    const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'updated_at';
    const sanitizedSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY d.${sanitizedSortBy} ${sanitizedSortOrder}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute the final query
    const dialogsCursor = this.sql.exec(query, ...params);
    const dialogs = [];
    for (const dialog of dialogsCursor) {
      dialogs.push(dialog);
    }

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
    limit = 100,
    offset = 0,
    messageText?: string,
    senderId?: string,
    senderUsername?: string,
    startTimestamp?: number,
    endTimestamp?: number,
    sortBy = 'message_timestamp',
    sortOrder = 'desc'
  ) {
    // Check if chat exists and user has access to it
    const chatCursor = this.sql.exec(
      `SELECT * FROM telegram_dialogs WHERE chat_id = ? AND status = 'active'`,
      ...[chatId]
    );

    const chats = [];
    for (const chat of chatCursor) {
      chats.push(chat);
    }

    if (chats.length === 0) {
      throw new Error(`Chat with ID ${chatId} not found or not accessible`);
    }

    const chat = chats[0];

    // Build the query with filters
    let query = `
      SELECT * FROM telegram_messages WHERE chat_id = ?
    `;

    const params: unknown[] = [chatId];

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

    const countResultCursor = this.sql.exec(countQuery, ...params);
    const countResults = [];
    for (const result of countResultCursor) {
      countResults.push(result);
    }
    const totalCount = countResults.length > 0 ? (countResults[0].total_count as number) || 0 : 0;

    // Add sorting and pagination
    const validSortColumns = ['message_timestamp', 'message_id']; // 添加其他合法的排序列
    const sanitizedSortBy = validSortColumns.includes(sortBy) ? sortBy : 'message_timestamp';
    const sanitizedSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sanitizedSortBy} ${sanitizedSortOrder}`;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // Execute the final query
    const messagesCursor = this.sql.exec(query, ...params);
    const messages = [];
    for (const message of messagesCursor) {
      messages.push(message);
    }

    // Prepare chat info for response
    const chatInfo: TgChatInfo = {
      id: chat.id as string,
      chat_id: chat.chat_id as string,
      chat_title: chat.chat_title as string,
      chat_type: chat.chat_type as string,
      is_public: chat.is_public === 1,
      is_free: chat.is_free === 1,
    };

    // Transform messages to correct type
    const messageInfos = messages.map((msg: Record<string, unknown>) => ({
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
    topK = 10,
    messageRange = 2,
    threshold = 0.7,
    isPublic?: boolean,
    isFree?: boolean
  ) {
    // Generate embedding for the search query
    let queryEmbeddingAvailable = false;
    const results: unknown[] = [];

    try {
      const response = await this.openai.embeddings.create({
        input: query,
        model: EMBEDDING_MODEL,
        encoding_format: 'float',
      });
      const embedding = response.data[0].embedding;
      queryEmbeddingAvailable = true;

      // Build filter for vector search
      const filter: Record<string, { $eq?: string }> = {};

      if (chatId) {
        filter.chat_id = { $eq: chatId };
      }

      // Search vector database for similar messages
      const vectorResults = await this.env.MYSTA_TG_INDEX.query(embedding, {
        topK,
        namespace: TG_VECTOR_NAMESPACE,
        filter,
        returnValues: false,
        returnMetadata: 'indexed',
      });

      // Process vector search results

      const matchIds = vectorResults.matches
        .filter(m => m.score && m.score >= threshold)
        .map(m => m.id);

      // Get matching messages and surrounding context
      for (const matchId of matchIds) {
        // Get the matching message
        const matchMessageCursor = this.sql.exec(
          `
          SELECT m.*, d.id as dialog_id, d.chat_title, d.chat_type, d.is_public, d.is_free
          FROM telegram_messages m
          JOIN telegram_dialogs d ON m.chat_id = d.chat_id
          WHERE m.id = ? AND d.status = 'active'
          `,
          ...[matchId]
        );

        const matchMessages = [];
        for (const message of matchMessageCursor) {
          matchMessages.push(message);
        }

        if (matchMessages.length === 0) continue;
        const matchMessage = matchMessages[0];

        // Apply additional filters on the database level
        if (isPublic !== undefined && matchMessage.is_public !== (isPublic ? 1 : 0)) continue;
        if (isFree !== undefined && matchMessage.is_free !== (isFree ? 1 : 0)) continue;

        // Get surrounding context messages
        const contextQuery = `
          SELECT m.*
          FROM telegram_messages m
          WHERE m.chat_id = ?
          AND m.message_timestamp BETWEEN 
            (SELECT message_timestamp FROM telegram_messages WHERE id = ?) - ? 
            AND (SELECT message_timestamp FROM telegram_messages WHERE id = ?) + ?
          ORDER BY m.message_timestamp
        `;

        const contextMessagesCursor = this.sql.exec(
          contextQuery,
          ...[matchMessage.chat_id, matchId, messageRange * 3600, matchId, messageRange * 3600]
        );

        const contextMessages = [];
        for (const message of contextMessagesCursor) {
          contextMessages.push(message);
        }

        // Prepare chat info
        const chatInfo: TgChatInfo = {
          id: matchMessage.dialog_id as string,
          chat_id: matchMessage.chat_id as string,
          chat_title: matchMessage.chat_title as string,
          chat_type: matchMessage.chat_type as string,
          is_public: matchMessage.is_public === 1,
          is_free: matchMessage.is_free === 1,
        };

        // Prepare message chunk with match indicators
        const messageChunk = contextMessages.map((msg: Record<string, unknown>) => {
          const isMatch = msg.id === matchId;
          const matchResult = isMatch
            ? vectorResults.matches.find(m => m.metadata?.message_id === matchId)
            : null;

          const result: TgMessageInfo = {
            id: msg.id as string,
            message_id: msg.message_id as string,
            message_text: msg.message_text as string,
            message_timestamp: msg.message_timestamp as number,
            sender_id: msg.sender_id as string,
            sender_username: msg.sender_username as string | null,
            sender_firstname: msg.sender_firstname as string | null,
            sender_lastname: msg.sender_lastname as string | null,
            is_match: isMatch,
            similarity: matchResult?.score || null,
          };
          return result;
        });

        // Add to results
        results.push({
          chat: chatInfo,
          message_chunk: messageChunk,
        });
      }
    } catch (error) {
      console.error('Error generating embedding or searching:', error);
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

  // Sync multiple Telegram chats
  async syncChats(chatsData: TelegramChatData[]): Promise<number> {
    let successCount = 0;

    for (const chatData of chatsData) {
      try {
        const {
          chat_id,
          chat_title,
          chat_type,
          is_public = false,
          is_free = true,
          subscription_fee = 0,
        } = chatData;

        // Check if chat already exists
        const existingChatCursor = this.sql.exec(
          `SELECT * FROM telegram_dialogs WHERE chat_id = ?`,
          ...[chat_id]
        );

        const existingChats = [];
        for (const chat of existingChatCursor) {
          existingChats.push(chat);
        }
        const existingChat = existingChats.length > 0 ? existingChats[0] : null;

        const now = new Date().toISOString();

        if (existingChat) {
          // Update existing chat
          this.sql.exec(
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
            `,
            ...[
              chat_title,
              chat_type,
              is_public ? 1 : 0,
              is_free ? 1 : 0,
              subscription_fee,
              now,
              now,
              chat_id,
            ]
          );
        } else {
          // Insert new chat
          const id = crypto.randomUUID();

          this.sql.exec(
            `
            INSERT INTO telegram_dialogs
            (id, chat_id, chat_title, chat_type, is_public, is_free, subscription_fee, last_synced_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            ...[
              id,
              chat_id,
              chat_title,
              chat_type,
              is_public ? 1 : 0,
              is_free ? 1 : 0,
              subscription_fee,
              now,
              now,
              now,
            ]
          );
        }
        successCount++;
      } catch (error) {
        console.error(`Error syncing chat ${chatData.chat_id}:`, error);
        // Continue with next chat even if one fails
      }
    }

    return successCount;
  }

  // Sync messages for a chat
  async syncMessages(
    chatId: string,
    messages: TelegramMessageData[],
    batchSize = 10
  ): Promise<number> {
    // Check if chat exists
    const chatCursor = this.sql.exec(
      `SELECT * FROM telegram_dialogs WHERE chat_id = ? AND status = 'active'`,
      ...[chatId]
    );

    const chats = [];
    for (const chat of chatCursor) {
      chats.push(chat);
    }

    if (chats.length === 0) {
      throw new Error(`Chat with ID ${chatId} not found or not accessible`);
    }

    let insertedCount = 0;
    const messagesToEmbed: { id: string; text: string }[] = [];

    // Use storage.transaction() instead of SQL transaction
    await this.ctx.storage.transaction(async () => {
      for (const message of messages) {
        const id = crypto.randomUUID();

        // Check if message already exists
        const existingMessageCursor = this.sql.exec(
          `SELECT * FROM telegram_messages WHERE chat_id = ? AND message_id = ?`,
          ...[chatId, message.message_id]
        );

        const existingMessages = [];
        for (const msg of existingMessageCursor) {
          existingMessages.push(msg);
        }
        const existingMessage = existingMessages.length > 0 ? existingMessages[0] : null;

        if (!existingMessage) {
          // Insert new message with optional fields
          this.sql.exec(
            `
            INSERT INTO telegram_messages
            (id, chat_id, message_id, message_text, message_timestamp, sender_id, sender_username, sender_firstname, sender_lastname)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            ...[
              id,
              chatId,
              message.message_id,
              message.message_text,
              message.message_timestamp,
              message.sender_id,
              message.sender_username || null,
              message.sender_firstname || null,
              message.sender_lastname || null,
            ]
          );

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

      // Update chat's last_synced_at and updated_at
      const now = new Date().toISOString();
      this.sql.exec(
        `
        UPDATE telegram_dialogs
        SET last_synced_at = ?, updated_at = ?
        WHERE chat_id = ?
        `,
        ...[now, now, chatId]
      );
    });

    // Generate embeddings for new messages in batches
    if (messagesToEmbed.length > 0) {
      for (let i = 0; i < messagesToEmbed.length; i += batchSize) {
        const batch = messagesToEmbed.slice(i, i + batchSize);
        await this._generateAndStoreEmbeddings(batch, chatId);
      }
    }

    return insertedCount;
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
        encoding_format: 'float',
      });

      const toInsert = response.data.map((item, index) => {
        return {
          id: messages[index].id,
          values: item.embedding,
          metadata: {
            chat_id: chatId,
          },
          namespace: TG_VECTOR_NAMESPACE,
        };
      });

      // Insert embeddings into vector database
      await this.env.MYSTA_TG_INDEX.insert(toInsert);

      // Update messages with embedding_id
      for (const message of messages) {
        this.sql.exec(
          `
          UPDATE telegram_messages
          SET embedding_id = ?
          WHERE id = ?
          `,
          ...[message.id, message.id]
        );
      }
    } catch (error) {
      console.error('Error generating embeddings:', error);
      // Continue execution even if embedding fails
    }
  }
}
