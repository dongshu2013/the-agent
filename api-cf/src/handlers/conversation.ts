import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';

// ===== CREATE CONVERSATION =====

export class CreateConversation extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              id: z.number().optional(),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Conversation created successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              id: z.number(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const doId = c.env.AgentContext.idFromName(userId);
    const stub = c.env.AgentContext.get(doId);

    const { id } = await c.req.json();
    const convId = id || Date.now();
    await stub.createConversation(convId);

    return c.json(
      {
        success: true,
        id: convId,
      },
      200
    );
  }
}

// ===== DELETE CONVERSATION =====

export class DeleteConversation extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              id: z.number(),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Conversation deleted successfully',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const { id } = await c.req.json();

    const doId = c.env.AgentContext.idFromName(userId);
    const stub = c.env.AgentContext.get(doId);
    await stub.deleteConversation(id);
    return c.json(
      {
        success: true,
      },
      200
    );
  }
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
                  id: z.number(),
                  messages: z.array(
                    z.object({
                      id: z.number(),
                      role: z.string(),
                      content: z.string().optional(),
                      tool_calls: z.any().optional(),
                      tool_call_id: z.string().optional(),
                    })
                  ),
                })
              ),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const env = c.env;

    const doId = env.AgentContext.idFromName(userId);
    const stub = env.AgentContext.get(doId);
    const conversations = await stub.listConversations();
    return c.json(
      {
        success: true,
        conversations,
      },
      200
    );
  }
}
