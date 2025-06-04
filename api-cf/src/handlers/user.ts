import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import {
  createUser,
  getCreditDaily,
  getUserBalance,
  getUserInfo,
  rotateApiKey,
  toggleApiKeyEnabled,
  redeemCouponCode,
} from '../d1/user';
import {
  GetUserResponseSchema,
  RotateApiKeyResponseSchema,
  ToggleApiKeyRequestSchema,
  RedeemCouponResponseSchema,
  ToggleApiKeyResponseSchema,
  RedeemCouponRequestSchema,
  GetUserBalanceResponseSchema,
  GetCreditDailyResponseSchema,
  GetCreditDailyRequestSchema,
  ClearUserResponseSchema,
} from '@the-agent/shared';

export class GetUser extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'User info',
        content: {
          'application/json': {
            schema: GetUserResponseSchema,
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
          id: user.id,
          email: user.email,
          api_key: user.api_key,
          api_key_enabled: user.api_key_enabled,
          balance: user.balance,
        },
        200
      );
    } else {
      return c.json(
        {
          id: userInfo.id,
          email: userInfo.email,
          api_key: userInfo.api_key,
          api_key_enabled: userInfo.api_key_enabled,
          balance: userInfo.balance,
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
            schema: GetUserBalanceResponseSchema,
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

export class GetCreditDaily extends OpenAPIRoute {
  schema = {
    request: {
      query: GetCreditDailyRequestSchema,
    },
    responses: {
      '200': {
        description: 'Daily credit usage',
        content: {
          'application/json': {
            schema: GetCreditDailyResponseSchema,
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const query = c.req.query();

    const options = {
      startDate: query.startDate,
      endDate: query.endDate,
    };

    const data = await getCreditDaily(c.env, userId, options);
    return c.json({ data }, 200);
  }
}

export class RotateApiKey extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'Rotate API key',
        content: {
          'application/json': {
            schema: RotateApiKeyResponseSchema,
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
            schema: ToggleApiKeyRequestSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Toggle API key enabled',
        content: {
          'application/json': {
            schema: ToggleApiKeyResponseSchema,
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const body = await c.req.json();
    await toggleApiKeyEnabled(c.env, userId, body.enabled);
    return c.json({ enabled: body.enabled }, 200);
  }
}

export class RedeemCouponCode extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: RedeemCouponRequestSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Redeem coupon code',
        content: {
          'application/json': {
            schema: RedeemCouponResponseSchema,
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    const { code } = await c.req.json();

    const result = await redeemCouponCode(c.env, userId, userEmail, code);

    return c.json(
      {
        added_credits: result.added_credits,
        total_credits: result.total_credits,
      },
      200
    );
  }
}

export class ClearUser extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'User cleared successfully',
        content: {
          'application/json': {
            schema: ClearUserResponseSchema,
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
    await stub.reset();
    return c.json({ success: true }, 200);
  }
}
