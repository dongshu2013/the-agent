import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { createConversation } from '../../db';

// CORS headers as specified in the memory
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

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
export async function handleCreateConversationOptions(c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
