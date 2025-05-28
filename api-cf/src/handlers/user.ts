import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import {
  createUser,
  getCreditLogs,
  getCreditDaily,
  getUserBalance,
  getUserInfo,
  rotateApiKey,
  toggleApiKeyEnabled,
} from '../d1/user';
import {
  TransactionReasonSchema,
  TransactionTypeSchema,
  GetUserResponseSchema,
  RotateApiKeyResponseSchema,
  ToggleApiKeyRequestSchema,
  GetCreditHistoryResponseSchema,
  RedeemCouponResponseSchema,
  ToggleApiKeyResponseSchema,
  RedeemCouponRequestSchema,
  GetUserBalanceResponseSchema,
  GetCreditDailyResponseSchema,
} from '@the-agent/shared';
import { GatewayServiceError } from '../types/service';

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

// deprecated
export class GetCreditLogs extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'Credit logs',
        content: {
          'application/json': {
            schema: GetCreditHistoryResponseSchema,
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
      offset: query.offset ? parseInt(query.offset, 10) : undefined,
    };

    const { history, total } = await getCreditLogs(c.env, userId, options);
    return c.json({ history, total }, 200);
  }
}

export class GetCreditDaily extends OpenAPIRoute {
  schema = {
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

    // Extract query parameters
    const options = {
      startDate: query.startDate,
      endDate: query.endDate,
      model: query.model,
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

    // Get coupon code info with user_whitelist check
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM coupon_codes 
       WHERE code = ? 
       AND is_active = 1 
       AND (expired_at IS NULL OR expired_at > datetime('now'))
       AND (user_whitelist IS NULL OR user_whitelist LIKE ?)`
    )
      .bind(code, `%${userEmail}%`)
      .all();

    if (!results || results.length === 0) {
      throw new GatewayServiceError(400, 'Invalid, expired, or unauthorized coupon code');
    }

    const coupon = results[0];
    if (coupon.used_count >= coupon.max_uses) {
      throw new GatewayServiceError(400, 'Coupon code has reached maximum uses');
    }

    // Start transaction
    const tx = c.env.DB.batch([
      // Update coupon used count
      c.env.DB.prepare('UPDATE coupon_codes SET used_count = used_count + 1 WHERE code = ?').bind(
        code
      ),
      // Add credits to user
      c.env.DB.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(
        coupon.credits,
        userId
      ),
      // Add credit history
      c.env.DB.prepare(
        `INSERT INTO credit_history (user_id, tx_credits, tx_type, tx_reason)
         VALUES (?, ?, ?, ?)`
      ).bind(
        userId,
        coupon.credits,
        TransactionTypeSchema.enum.debit,
        TransactionReasonSchema.enum.coupon_code
      ),
    ]);
    await tx;

    const newBalance = await getUserBalance(c.env, userId);
    return c.json(
      {
        added_credits: coupon.credits,
        total_credits: newBalance,
      },
      200
    );
  }
}
