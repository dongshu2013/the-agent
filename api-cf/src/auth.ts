import { Next } from 'hono';

import { GatewayServiceContext } from './types';
import { getUserFromApiKey } from './db';

// Authentication layer for API_KEY (external users)
export async function apiKeyAuthMiddleware(c: GatewayServiceContext, next: Next) {
  try {
    const token = getBearer(c);
    if (token.startsWith('mizu-')) {
      const userId = await getUserFromApiKey(c.env, token);
      if (!userId) {
        return c.text('Unauthorized', 401);
      }
      c.set('userId', userId.toString());
    } else {
      return c.text('Unauthorized', 401);
    }
    await next();
  } catch (error) {
    return c.text('Unauthorized', 401);
  }
}

function getBearer(c: GatewayServiceContext): string {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid token');
  }
  return authHeader.split(' ')[1];
}
