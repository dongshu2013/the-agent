import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { MessageSchema } from '@the-agent/shared';
import { GatewayServiceError } from '../types/service';
import { Message } from '../do/types';
import { deductUserCredits } from '../d1/user';
import { EMBEDDING_MODEL } from '../utils/common';

export class SaveMessage extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              message: MessageSchema,
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

    // Validate the message
    let message: Message;
    try {
      message = MessageSchema.parse(body.message);
    } catch (error) {
      console.error('Invalid message format:', error);
      throw new GatewayServiceError(400, 'Invalid message format');
    }

    // Save the message
    const doId = c.env.AgentContext.idFromName(userId);
    const stub = c.env.AgentContext.get(doId);
    const { success, topKMessageIds, totalCost } = await stub.saveMessage(
      message,
      body.top_k_related,
      body.threshold
    );

    // Deduct credits from user
    await deductUserCredits(c.env, userId, totalCost, EMBEDDING_MODEL);

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
