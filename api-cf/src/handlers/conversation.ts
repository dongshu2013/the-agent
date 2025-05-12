import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';

// ===== CREATE CONVERSATION =====

export class CreateConversation extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'Conversation created successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              conversation: z.number()
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const id = c.env.AgentContext.idFromName(userId)
      const stub = c.env.AgentContext.get(id)
      const conversationId = await stub.createConversation()

      return c.json({
        success: true,
        conversation: conversationId
      }, 200);
    } catch (error) {
      console.error('Error creating conversation:', error);

      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
    }
  }
}

// ===== DELETE CONVERSATION =====

export class DeleteConversation extends OpenAPIRoute {
  schema = {
    request: {
      query: z.object({
        conversationId: z.number(),
      }),
    },
    responses: {
      '200': {
        description: 'Conversation deleted successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            })
          }
        }
      },
      '403': {
        description: 'Forbidden - user does not own the conversation',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                message: z.string(),
                code: z.string()
              })
            })
          }
        }
      },
      '404': {
        description: 'Conversation not found',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              error: z.object({
                message: z.string(),
                code: z.string()
              })
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const { conversationId } = c.req.query();
      
      const id = c.env.AgentContext.idFromName(userId)
      const stub = c.env.AgentContext.get(id)
      await stub.deleteConversation(conversationId)
      return c.json({
        success: true
      }, 200);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
    }
  }
}
// ===== LIST CONVERSATIONS =====

export class ListConversations extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'List of user conversations',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              conversations: z.array(
                z.object({
                  id: z.number(),
                  messages: z.array(
                    z.object({
                      id: z.number(),
                      role: z.string(),
                      content: z.string().optional(),
                      tool_calls: z.any().optional(),
                      tool_call_id: z.string().optional()
                    })
                  )
                })
              )
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get('userId');
      const env = c.env;
      
      const id = env.AgentContext.idFromName(userId)
      const stub = env.AgentContext.get(id)
      const conversations = await stub.listConversations()
      return c.json({
        success: true,
        conversations
      }, 200);
    } catch (error) {
      console.error('Error listing conversations:', error);
      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
    }
  }
}
