import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { listUserConversations } from '../../db';

// CORS headers as specified in the memory
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

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
export async function handleListConversationsOptions(c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
