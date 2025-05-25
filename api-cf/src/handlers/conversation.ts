import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import {
  CreateConversationRequestSchema,
  CreateConversationResponseSchema,
  DeleteConversationRequestSchema,
  DeleteConversationResponseSchema,
  ListConversationsRequestSchema,
  ListConversationsResponseSchema,
} from '@the-agent/shared';

// ===== CREATE CONVERSATION =====

export class CreateConversation extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateConversationRequestSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Conversation created successfully',
        content: {
          'application/json': {
            schema: CreateConversationResponseSchema,
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
            schema: DeleteConversationRequestSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Conversation deleted successfully',
        content: {
          'application/json': {
            schema: DeleteConversationResponseSchema,
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
        deleted: true,
      },
      200
    );
  }
}

// ===== LIST CONVERSATIONS =====

export class ListConversations extends OpenAPIRoute {
  schema = {
    request: {
      query: ListConversationsRequestSchema,
    },
    responses: {
      '200': {
        description: 'List of user conversations',
        content: {
          'application/json': {
            schema: ListConversationsResponseSchema,
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
    const conversations = await stub.listConversations(c.req.query());
    return c.json(
      {
        conversations,
      },
      200
    );
  }
}
