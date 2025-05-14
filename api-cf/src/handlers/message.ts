import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { ChatMessageSchema } from '../types/chat';

export class SaveMessage extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              message: ChatMessageSchema.extend({
                id: z.number(),
                conversation_id: z.number(),
              }),
              top_k_related: z.number().default(0),
              threshold: z.number().default(0.7),
            }),
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
              top_k_message_ids: z.array(z.number()),
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
    const userId = c.get('userId');
    const body = await c.req.json();

    // Save the message
    const doId = c.env.AgentContext.idFromName(userId);
    const stub = c.env.AgentContext.get(doId);
    const { success, topKMessageIds } = await stub.saveMessage(
      body.message,
      body.top_k_related,
      body.threshold
    );

    // Return success response with CORS headers
    return c.json(
      {
        success,
        top_k_message_ids: topKMessageIds,
      },
      200
    );
  }
}
