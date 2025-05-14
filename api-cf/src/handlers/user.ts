import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import {
  createUser,
  getCreditLogs,
  getUserBalance,
  getUserInfo,
  rotateApiKey,
  toggleApiKeyEnabled,
} from '../d1/user';

export class GetUser extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'User info',
        content: {
          'application/json': {
            schema: z.object({
              api_key: z.string(),
              api_key_enabled: z.boolean(),
              balance: z.number(),
              email: z.string(),
              user_id: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const userInfo = await getUserInfo(c.env, userId);
    if (!userInfo) {
      // initiate user
      const email = c.get('userEmail');
      if (!email) {
        throw new Error('User email not found');
      }
      const user = await createUser(c.env, userId, email);
      return c.json(
        {
          success: true,
          user: {
            api_key: user.api_key,
            api_key_enabled: user.api_key_enabled,
            balance: user.balance,
            email: user.email,
            user_id: user.id,
          },
        },
        200
      );
    } else {
      return c.json(
        {
          success: true,
          user: {
            api_key: userInfo.api_key,
            api_key_enabled: userInfo.api_key_enabled,
            balance: userInfo.balance,
            email: userInfo.email,
          },
        },
        200
      );
    }
  }
}

export class GetUserBalance extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'User info',
        content: {
          'application/json': {
            schema: z.object({
              balance: z.number(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const balance = await getUserBalance(c.env, userId);
    return c.json(
      {
        balance,
      },
      200
    );
  }
}

export class GetCreditLogs extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'Credit logs',
        content: {
          'application/json': {
            schema: z.object({
              history: z.array(
                z.object({
                  id: z.number(),
                  tx_credits: z.number(),
                  tx_type: z.string(),
                  tx_reason: z.string().optional(),
                  model: z.string().optional(),
                  created_at: z.string(),
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
    const query = c.req.query();

    // Extract query parameters
    const options = {
      startDate: query.startDate,
      endDate: query.endDate,
      model: query.model,
      transType: query.transType,
      transReason: query.transReason,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    };

    // console.log('Credit history query options:', options);

    const creditLogs = await getCreditLogs(c.env, userId, options);
    return c.json({ history: creditLogs }, 200);
  }
}

export class RotateApiKey extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'Rotate API key',
        content: {
          'application/json': {
            schema: z.object({
              newApiKey: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const newApiKey = await rotateApiKey(c.env, userId);
    return c.json({ newApiKey }, 200);
  }
}

export class ToggleApiKeyEnabled extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              enabled: z.boolean(),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Toggle API key enabled',
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
    const body = await c.req.json();
    await toggleApiKeyEnabled(c.env, userId, body.enabled);
    return c.json({ success: true }, 200);
  }
}
