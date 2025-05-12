import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { saveMessage } from '../db';
import { SaveMessageRequestSchema } from '../types/chat';

// CORS headers as specified in the memory
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

export class SaveMessage extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: SaveMessageRequestSchema
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Message saved successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              top_k_messages: z.array(z.string())
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
      const body = await c.req.json();
      
      // Save the message
      const { success, topKMessages } = await saveMessage(
        env, 
        userId, 
        body.conversation_id, 
        body.message,
        body.top_k_related || 0
      );
      
      // Return success response with CORS headers
      return c.json({
        success,
        top_k_messages: topKMessages
      }, 200, corsHeaders);
    } catch (error) {
      console.error('Error saving message:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return c.json({
            success: false,
            error: {
              message: error.message,
              code: 'not_found'
            }
          }, 404, corsHeaders);
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
export async function handleSaveMessageOptions(_c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
