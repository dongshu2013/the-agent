import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { deleteConversation } from '../../db';

// CORS headers as specified in the memory
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

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
export async function handleDeleteConversationOptions(c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
