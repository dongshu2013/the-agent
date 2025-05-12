import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { SaveMessageRequestSchema } from '../types/chat';

export class SaveMessage extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: SaveMessageRequestSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Message saved successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              top_k_message_ids: z.array(z.string()),
            }),
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
                message: z.string(),
                code: z.string(),
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
      const body = await c.req.json();

      // Save the message
      const id = c.env.AgentContext.idFromName(userId);
      const stub = c.env.AgentContext.get(id);
      const { success, topKMessageIds } = await stub.saveMessage(
        body.conversation_id,
        body.message,
        body.top_k_related || 0
      );

      // Return success response with CORS headers
      return c.json(
        {
          success,
          top_k_message_ids: topKMessageIds,
        },
        200
      );
    } catch (error) {
      console.error('Error saving message:', error);
      return c.json(
        {
          success: false,
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'An unknown error occurred',
            code: 'server_error',
          },
        },
        500
      );
    }
  }
}
