import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { createConversation, deleteConversation, listUserConversations } from '../db';

// CORS headers as specified in the memory
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

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
              conversation: z.object({
                id: z.string(),
                user_id: z.string(),
                created_at: z.string(),
                status: z.string()
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
      const env = c.env;
      
      // Create a new conversation
      const conversationId = await createConversation(env, userId);
      
      // Return success response with CORS headers
      return c.json({
        success: true,
        conversation: {
          id: conversationId,
          user_id: userId,
          created_at: new Date().toISOString(),
          status: 'active'
        }
      }, 200, corsHeaders);
    } catch (error) {
      console.error('Error creating conversation:', error);
      
      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500, corsHeaders);
    }
  }
}

// Handle OPTIONS requests for CORS preflight
export async function handleCreateConversationOptions(_c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// ===== DELETE CONVERSATION =====

export class DeleteConversation extends OpenAPIRoute {
  schema = {
    request: {
      query: z.object({
        conversationId: z.string(),
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
      const env = c.env;
      const { conversationId } = c.req.query();
      
      if (!conversationId) {
        return c.json({
          success: false,
          error: {
            message: 'Conversation ID is required',
            code: 'missing_conversation_id'
          }
        }, 400, corsHeaders);
      }
      
      // Delete the conversation
      const success = await deleteConversation(env, conversationId, userId);
      
      // Return success response with CORS headers
      return c.json({
        success
      }, 200, corsHeaders);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('permission')) {
          return c.json({
            success: false,
            error: {
              message: error.message,
              code: error.message.includes('permission') ? 'permission_denied' : 'not_found'
            }
          }, error.message.includes('permission') ? 403 : 404, corsHeaders);
        }
      }
      
      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500, corsHeaders);
    }
  }
}

// Handle OPTIONS requests for CORS preflight
export async function handleDeleteConversationOptions(_c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
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
                  id: z.string(),
                  user_id: z.string(),
                  created_at: z.string(),
                  status: z.string(),
                  messages: z.array(
                    z.object({
                      id: z.string(),
                      role: z.string(),
                      content: z.string().optional(),
                      timestamp: z.string(),
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
      
      // List user conversations
      const conversations = await listUserConversations(env, userId);
      
      // Return success response with CORS headers
      return c.json({
        success: true,
        conversations
      }, 200, corsHeaders);
    } catch (error) {
      console.error('Error listing conversations:', error);
      
      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500, corsHeaders);
    }
  }
}

// Handle OPTIONS requests for CORS preflight
export async function handleListConversationsOptions(_c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
