import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import {
  Message,
  MessageSchema,
  SaveMessageRequestSchema,
  SaveMessageResponseSchema,
} from '@the-agent/shared';
import { GatewayServiceError } from '../types/service';
import { getUserBalance } from '../d1/user';
import { deductUserCredits } from '../d1/user';

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

    const currentCredits = await getUserBalance(c.env, userId);
    if (currentCredits <= 0) {
      throw new GatewayServiceError(402, 'Insufficient credits');
    }

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

    const { totalCost, relatedMessages } = await stub.saveMessage(message);

    if (totalCost > 0) {
      await deductUserCredits(c.env, userId, totalCost, 'embedding');
    }

    return c.json(
      {
        success: true,
        related_messages: relatedMessages,
      },
      200
    );
  }
}
