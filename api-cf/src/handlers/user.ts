import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { getCreditLogs, getUserBalance, getUserInfo, rotateApiKey, toggleApiKeyEnabled } from '../d1/user';

export class GetUser extends OpenAPIRoute {
  schema = {
    responses: {
      '200': {
        description: 'User info',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
              user: z.object({
                api_key: z.string(),
                api_key_enabled: z.boolean(),
                balance: z.number()
              })
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get("userId");
      const userInfo = await getUserInfo(c.env, userId);
      if (!userInfo) {
        return c.json({
          success: false,
          error: {
            message: 'User not found',
            code: 'not_found'
          }
        }, 404);
      }
      return c.json({
        success: true,
        user: {
          api_key: userInfo.api_key,
          api_key_enabled: userInfo.api_key_enabled,
          balance: userInfo.balance
        }
      }, 200);
    } catch (error) {
      console.error('Error getting user info:', error);

      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
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
              success: z.boolean(),
              results: z.object({
                balance: z.number()
              })
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get("userId");
      const userInfo = await getUserBalance(c.env, userId);
      if (!userInfo) {
        return c.json({
          success: false,
          error: {
            message: 'User not found',
            code: 'not_found'
          }
        }, 404);
      }
      return c.json({
        success: true,
        results: {
          balance: userInfo.balance
        }
      }, 200);
    } catch (error) {
      console.error('Error getting user info:', error);

      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
    }
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
              success: z.boolean(),
              results: z.array(z.object({
                id: z.number(),
                user_id: z.string(),
                tx_credits: z.number(),
                tx_type: z.string(),
                model: z.string().optional(),
                created_at: z.string()
              }))
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get("userId");
      const creditLogs = await getCreditLogs(c.env, userId);
      return c.json({
        success: true,
        results: creditLogs
      }, 200);
    } catch (error) {
      console.error('Error getting credit logs:', error);

      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
    }
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
              success: z.boolean(),
              results: z.object({
                apiKey: z.string()
              })
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get("userId");
      const apiKey = await rotateApiKey(c.env, userId);
      return c.json({
        success: true,
        results: { apiKey }
      }, 200);
    } catch (error) {
      console.error('Error getting credit logs:', error);

      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
    }
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
            })
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Toggle API key enabled',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const userId = c.get("userId");
      const body = await c.req.json();
      await toggleApiKeyEnabled(c.env, userId, body.enabled);
      return c.json({
        success: true,
      }, 200);
    } catch (error) {
      console.error('Error getting credit logs:', error);

      return c.json({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          code: 'server_error'
        }
      }, 500);
    }
  }
}