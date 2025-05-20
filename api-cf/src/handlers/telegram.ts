import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { corsHeaders } from '../utils/common';
import { TelegramStatsSchema } from '@the-agent/shared';
import { createSuccessResponse, createErrorResponse, ApiErrorCode } from '../types/api';

// ===== GET MY CHAT =====

export class GetMyChat extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'My chat',
        content: {
          'application/json': {
            schema: z.array(
              z.object({
                success: z.boolean(),
                data: z.object({
                  chat_id: z.string(),
                  chat_title: z.string(),
                  chat_type: z.string(),
                  is_public: z.boolean(),
                  is_free: z.boolean(),
                  subscription_fee: z.number(),
                  last_synced_at: z.string(),
                  created_at: z.string(),
                  updated_at: z.string(),
                  status: z.string(),
                }),
              })
            ),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const id = c.env.TgContext.idFromName(userId);
      const stub = c.env.TgContext.get(id);
      const result = await stub.getMyChat();

      return c.json(createSuccessResponse(result), 200);
    } catch (error) {
      console.error('Error getting my chat:', error);

      return c.json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          error instanceof Error ? error.message : 'An unknown error occurred'
        ),
        500
      );
    }
  }
}

// ===== GET TELEGRAM STATS =====

export class GetTelegramStats extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'Telegram stats',
        content: {
          'application/json': {
            schema: TelegramStatsSchema,
          },
        },
      },
      '500': {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const id = c.env.TgContext.idFromName(userId);
      const stub = c.env.TgContext.get(id);
      const result = await stub.getStats();

      return c.json(createSuccessResponse(result), 200);
    } catch (error) {
      console.error('Error getting Telegram stats:', error);

      return c.json(
        createErrorResponse(
          ApiErrorCode.INTERNAL_ERROR,
          error instanceof Error ? error.message : 'An unknown error occurred'
        ),
        500
      );
    }
  }
}

// ===== GET TELEGRAM DIALOGS =====

export class GetTelegramDialogs extends OpenAPIRoute {
  schema = {
    request: {
      query: z.object({
        limit: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : 100)),
        offset: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : 0)),
        chat_title: z.string().optional(),
        is_public: z
          .string()
          .optional()
          .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
        is_free: z
          .string()
          .optional()
          .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
        status: z.string().optional(),
        sort_by: z.string().optional().default('updated_at'),
        sort_order: z.string().optional().default('desc'),
      }),
    },
    responses: {
      '200': {
        description: 'List of Telegram dialogs',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                dialogs: z.array(
                  z.object({
                    id: z.string(),
                    chat_id: z.string(),
                    chat_type: z.string(),
                    chat_title: z.string(),
                    is_public: z.boolean(),
                    is_free: z.boolean(),
                    subscription_fee: z.number(),
                    last_synced_at: z.string(),
                    status: z.string(),
                    created_at: z.string(),
                    updated_at: z.string(),
                    message_count: z.number(),
                  })
                ),
                total_count: z.number(),
                limit: z.number(),
                offset: z.number(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const query = c.req.query();

      const limit = parseInt(query.limit || '100', 10);
      const offset = parseInt(query.offset || '0', 10);
      const chatTitle = query.chat_title;
      const isPublic = query.is_public ? query.is_public === 'true' : undefined;
      const isFree = query.is_free ? query.is_free === 'true' : undefined;
      const status = query.status;
      const sortBy = query.sort_by || 'updated_at';
      const sortOrder = query.sort_order || 'desc';

      // Use Durable Object to get Telegram dialogs
      const id = c.env.TgContext.idFromName(userId);
      const stub = c.env.TgContext.get(id);
      const result = await stub.getDialogs(
        limit,
        offset,
        chatTitle,
        isPublic,
        isFree,
        status,
        sortBy,
        sortOrder
      );

      // Return success response with CORS headers
      return c.json(
        {
          success: true,
          data: result,
        },
        200
      );
    } catch (error) {
      console.error('Error getting Telegram dialogs:', error);

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
          },
        },
        500
      );
    }
  }
}

// ===== GET TELEGRAM MESSAGES V2 =====

export class GetTelegramMessages extends OpenAPIRoute {
  schema = {
    request: {
      query: z.object({
        chat_id: z.string(),
        limit: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : 100)),
        offset: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : 0)),
        message_text: z.string().optional(),
        sender_id: z.string().optional(),
        sender_username: z.string().optional(),
        start_timestamp: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : undefined)),
        end_timestamp: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : undefined)),
        sort_by: z.string().optional().default('message_timestamp'),
        sort_order: z.string().optional().default('desc'),
      }),
    },
    responses: {
      '200': {
        description: 'List of Telegram messages',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                chat: z.object({
                  id: z.string(),
                  chat_id: z.string(),
                  chat_title: z.string(),
                  chat_type: z.string(),
                  is_public: z.boolean(),
                  is_free: z.boolean(),
                }),
                messages: z.array(
                  z.object({
                    id: z.string(),
                    message_id: z.string(),
                    message_text: z.string(),
                    message_timestamp: z.number(),
                    sender_id: z.string(),
                    sender_username: z.string().nullable(),
                    sender_firstname: z.string().nullable(),
                    sender_lastname: z.string().nullable(),
                  })
                ),
                total_count: z.number(),
                limit: z.number(),
                offset: z.number(),
              }),
            }),
          },
        },
      },
      '404': {
        description: 'Chat not found',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const query = c.req.query();

      const chatId = query.chat_id;
      if (!chatId) {
        return c.json(
          {
            success: false,
            error: {
              code: 'MISSING_CHAT_ID',
              message: 'Chat ID is required',
            },
          },
          400
        );
      }

      const limit = parseInt(query.limit || '100', 10);
      const offset = parseInt(query.offset || '0', 10);
      const messageText = query.message_text;
      const senderId = query.sender_id;
      const senderUsername = query.sender_username;
      const startTimestamp = query.start_timestamp
        ? parseInt(query.start_timestamp, 10)
        : undefined;
      const endTimestamp = query.end_timestamp ? parseInt(query.end_timestamp, 10) : undefined;
      const sortBy = query.sort_by || 'message_timestamp';
      const sortOrder = query.sort_order || 'desc';

      // Use Durable Object to get Telegram messages
      const id = c.env.TgContext.idFromName(userId);
      const stub = c.env.TgContext.get(id);
      const result = await stub.getMessages(
        chatId,
        limit,
        offset,
        messageText,
        senderId,
        senderUsername,
        startTimestamp,
        endTimestamp,
        sortBy,
        sortOrder
      );

      // Return success response with CORS headers
      return c.json(
        {
          success: true,
          data: result,
        },
        200
      );
    } catch (error) {
      console.error('Error getting Telegram messages:', error);

      // Handle specific error cases
      if (
        error instanceof Error &&
        (error.message.includes('not found') || error.message.includes('permission'))
      ) {
        return c.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          },
          404
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
          },
        },
        500
      );
    }
  }
}

// ===== SEARCH TELEGRAM MESSAGES V2 =====

export class SearchTelegramMessages extends OpenAPIRoute {
  schema = {
    request: {
      query: z.object({
        query: z.string(),
        chat_id: z.string().optional(),
        top_k: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : 10)),
        message_range: z
          .string()
          .optional()
          .transform(val => (val ? parseInt(val, 10) : 2)),
        threshold: z
          .string()
          .optional()
          .transform(val => (val ? parseFloat(val) : 0.7)),
        is_public: z
          .string()
          .optional()
          .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
        is_free: z
          .string()
          .optional()
          .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
      }),
    },
    responses: {
      '200': {
        description: 'Search results',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              data: z.object({
                results: z.array(
                  z.object({
                    chat: z.object({
                      id: z.string(),
                      chat_id: z.string(),
                      chat_title: z.string(),
                      chat_type: z.string(),
                      is_public: z.boolean(),
                      is_free: z.boolean(),
                    }),
                    message_chunk: z.array(
                      z.object({
                        id: z.string(),
                        message_id: z.string(),
                        message_text: z.string(),
                        message_timestamp: z.number(),
                        sender_id: z.string(),
                        sender_username: z.string().nullable(),
                        sender_firstname: z.string().nullable(),
                        sender_lastname: z.string().nullable(),
                        is_match: z.boolean(),
                        similarity: z.number().nullable(),
                      })
                    ),
                  })
                ),
                query_embedding_available: z.boolean(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const query = c.req.query();

      const searchQuery = query.query;
      if (!searchQuery) {
        return c.json(
          {
            success: false,
            error: {
              code: 'MISSING_QUERY',
              message: 'Search query is required',
            },
          },
          400
        );
      }

      const chatId = query.chat_id;
      const topK = parseInt(query.top_k || '10', 10);
      const messageRange = parseInt(query.message_range || '2', 10);
      const threshold = parseFloat(query.threshold || '0.7');
      const isPublic = query.is_public ? query.is_public === 'true' : undefined;
      const isFree = query.is_free ? query.is_free === 'true' : undefined;

      // Use Durable Object to search Telegram messages
      const id = c.env.TgContext.idFromName(userId);
      const stub = c.env.TgContext.get(id);
      const result = await stub.searchMessages(
        searchQuery,
        chatId,
        topK,
        messageRange,
        threshold,
        isPublic,
        isFree
      );

      // Return success response with CORS headers
      return c.json(
        {
          success: true,
          data: result,
        },
        200
      );
    } catch (error) {
      console.error('Error searching Telegram messages:', error);

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
          },
        },
        500
      );
    }
  }
}

// ===== SYNC TELEGRAM CHAT =====

export class SyncTelegramChat extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              chats: z.array(
                z.object({
                  chat_id: z.string(),
                  chat_title: z.string(),
                  chat_type: z.string(),
                  is_public: z.boolean().default(false),
                  is_free: z.boolean().default(true),
                  subscription_fee: z.number().default(0),
                })
              ),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Number of chats synchronized successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              count: z.number(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const { chats } = await c.req.json();

      if (!Array.isArray(chats)) {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Request must contain a chats array',
            },
          },
          400
        );
      }

      // Use Durable Object to sync Telegram chats
      const id = c.env.TgContext.idFromName(userId);
      const stub = c.env.TgContext.get(id);
      const result = await stub.syncChats(chats);

      // Return success response with CORS headers
      return c.json(
        {
          success: true,
          count: result,
        },
        200
      );
    } catch (error) {
      console.error('Error syncing Telegram chats:', error);

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
          },
        },
        500
      );
    }
  }
}

// ===== SYNC TELEGRAM MESSAGES =====

const TgMessageSchema = z.object({
  chat_id: z.string(),
  message_id: z.string(),
  message_text: z.string(),
  message_timestamp: z.number(),
  sender_id: z.string(),
  sender_username: z.string().nullable().optional(),
  sender_firstname: z.string().nullable().optional(),
  sender_lastname: z.string().nullable().optional(),
});
type TgMessage = z.infer<typeof TgMessageSchema>;

export class SyncTelegramMessages extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              messages: z.array(TgMessageSchema),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Messages synchronized successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              count: z.number(),
            }),
          },
        },
      },
      '404': {
        description: 'Chat not found',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                code: z.string(),
                message: z.string(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const body: { messages: TgMessage[] } = await c.req.json();

      // Group messages by chat_id
      const messagesByChat = new Map<string, TgMessage[]>();
      for (const message of body.messages) {
        if (!messagesByChat.has(message.chat_id)) {
          messagesByChat.set(message.chat_id, []);
        }
        messagesByChat.get(message.chat_id)?.push(message);
      }

      let totalCount = 0;

      // Use Durable Object to sync Telegram messages for each chat
      const id = c.env.TgContext.idFromName(userId);
      const stub = c.env.TgContext.get(id);

      // Process each chat's messages
      for (const [chatId, messages] of messagesByChat) {
        const result = await stub.syncMessages(chatId, messages);
        totalCount += result;
      }

      // Return success response with CORS headers
      return c.json(
        {
          success: true,
          count: totalCount,
        },
        200,
        corsHeaders
      );
    } catch (error) {
      console.error('Error syncing Telegram messages:', error);

      // Handle specific error cases
      if (
        error instanceof Error &&
        (error.message.includes('not found') || error.message.includes('permission'))
      ) {
        return c.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: error.message,
            },
          },
          404
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
          },
        },
        500
      );
    }
  }
}
