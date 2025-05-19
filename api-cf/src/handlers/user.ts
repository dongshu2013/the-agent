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
import { TransactionReason, TransactionType } from '../d1/types';

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
            user_id: userInfo.id,
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

export class RedeemCouponCode extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: z.object({
              code: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Redeem coupon code',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              added_credits: z.number(),
              total_credits: z.number(),
            }),
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
      return c.json(
        {
          success: false,
          error: 'Invalid, expired, or unauthorized coupon code',
        },
        400
      );
    }

    const coupon = results[0];
    if (coupon.used_count >= coupon.max_uses) {
      return c.json(
        { success: false, error: 'Coupon code has reached maximum uses' },
        400
      );
    }

    // Start transaction
    const tx = c.env.DB.batch([
      // Update coupon used count
      c.env.DB.prepare(
        'UPDATE coupon_codes SET used_count = used_count + 1 WHERE code = ?'
      ).bind(code),
      // Add credits to user and return new balance
      c.env.DB.prepare(
        'UPDATE users SET balance = balance + ? WHERE id = ? RETURNING balance'
      ).bind(coupon.credits, userId),
      // Add credit history
      c.env.DB.prepare(
        `INSERT INTO credit_history (user_id, tx_credits, tx_type, tx_reason)
         VALUES (?, ?, ?, ?)`
      ).bind(
        userId,
        coupon.credits,
        TransactionType.DEBIT,
        TransactionReason.COUPON_REDEEM
      ),
    ]);

    try {
      const results = await tx;
      const newBalance = results[1].results[0].balance;

      return c.json(
        {
          success: true,
          added_credits: coupon.credits,
          total_credits: newBalance,
        },
        200
      );
    } catch (error) {
      console.error('Error redeeming coupon:', error);
      return c.json({ success: false, error: 'Failed to redeem coupon' }, 500);
    }
  }
}
