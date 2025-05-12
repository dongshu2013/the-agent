import { Next } from 'hono';
import * as jose from 'jose';

import { GatewayServiceContext } from './types/service';
import { getUserFromApiKey } from './d1/user';

// Authentication middleware for JWT or API_KEY
export async function jwtOrApiKeyAuthMiddleware(
  c: GatewayServiceContext,
  next: Next
) {
  try {
    const token = getBearer(c);
    if (token.startsWith('mizu-')) {
      const user = await getUserFromApiKey(c.env, token);
      if (!user) {
        return c.text('Unauthorized', 401);
      }
      c.set('userId', user.id);
      c.set('userEmail', user.email);
      await next();
    } else {
      const { userId, userEmail } = await verifyJWT(token, c.env.JWT_PUB_KEY);
      c.set('userId', userId);
      c.set('userEmail', userEmail);
      await next();
    }
  } catch (error) {
    return c.text('Unauthorized', 401);
  }
}

// JWT verification helper
async function verifyJWT(
  token: string,
  publicKey: string
): Promise<{ userId: string; userEmail: string }> {
  try {
    const publicKeyObj = await jose.importSPKI(publicKey, 'EdDSA');
    const { payload } = await jose.jwtVerify(token, publicKeyObj);
    const subject = (payload as jose.JWTPayload).sub as string;
    const parsedSubject = JSON.parse(subject);
    return { userId: parsedSubject.userId, userEmail: parsedSubject.userEmail };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

function getBearer(c: GatewayServiceContext): string {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid token');
  }
  return authHeader.split(' ')[1];
}
