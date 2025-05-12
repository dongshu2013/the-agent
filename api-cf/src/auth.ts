import { Next } from 'hono';

import { GatewayServiceContext } from './types/service';
import { getUserFromApiKey } from './d1/user';

// Authentication layer for API_KEY (external users)
export async function apiKeyAuthMiddleware(
  c: GatewayServiceContext,
  next: Next
) {
  try {
    const token = getBearer(c);
    // TODO For Test
    if (token === 'mizu-test-api-key-1') {
      c.set('userId', 'test-userid-1');
      c.set('userEmail', 'mysta-test-user@gmail.com');
      await next();
      return;
    }
    if (token.startsWith('mizu-')) {
      const user = await getUserFromApiKey(c.env, token);
      if (!user || !user.id || !user.email) {
        return c.text('Unauthorized', 401);
      }
      c.set('userId', user.id);
      c.set('userEmail', user.email);
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
