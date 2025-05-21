import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import {
  Message,
  MessageSchema,
  SaveMessageRequestSchema,
  SaveMessageResponseSchema,
} from '@the-agent/shared';
import { GatewayServiceError } from '../types/service';
import { deductUserCredits } from '../d1/user';
import { EMBEDDING_MODEL } from '../utils/common';

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
            schema: SaveMessageResponseSchema,
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
    const { topKMessageIds, totalCost } = await stub.saveMessage(
      message,
      body.top_k_related,
      body.threshold
    );

    // Deduct credits from user
    await deductUserCredits(c.env, userId, totalCost, EMBEDDING_MODEL);

    // Return success response with CORS headers
    return c.json(
      {
        top_k_message_ids: topKMessageIds.map((id: string) => Number(id)),
      },
      200
    );
  }
}
