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
    // Check for API Key in x-api-key header
    const apiKey = c.req.header('x-api-key');
    if (apiKey) {
      const user = await getUserFromApiKey(c.env, apiKey);
      if (!user) {
        return c.text('Invalid API Key', 401);
      }
      c.set('userId', user.id);
      c.set('userEmail', user.email);
      await next();
      return;
    }

    // Check for JWT in Authorization: Bearer header
    const token = getBearer(c);
    if (!token) {
      return c.text('No authentication provided', 401);
    }

    const { userId, userEmail } = await verifyJWT(token);
    c.set('userId', userId);
    c.set('userEmail', userEmail);
    await next();
  } catch (error) {
    return c.text('Unauthorized', 401);
  }
}

const CACHE_KEY = 'firebase-public-keys';

async function getFirebasePublicKeys(kid: string): Promise<string> {
  const cache = caches.default;
  const cachedResponse = await cache.match(CACHE_KEY);

  if (cachedResponse) {
    const cacheAge =
      Date.now() - new Date(cachedResponse.headers.get('Date') || '').getTime();
    const keys = (await cachedResponse.json()) as Record<string, string>;

    // If cache is less than 1 hour old OR the requested key exists in cache, use cached keys
    if (cacheAge < 3600000 || keys[kid]) {
      return keys[kid];
    }
  }

  // Fetch new keys if cache is old or key not found
  const response = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
  );

  const keys = (await response.json()) as Record<string, string>;

  // Get cache expiration from Cache-Control header
  const cacheControl = response.headers.get('Cache-Control');
  const maxAge = cacheControl
    ? parseInt(cacheControl.split('max-age=')[1])
    : 3600; // Default to 1 hour if no Cache-Control header

  // Create a new response with the keys and cache it
  const cacheResponse = new Response(JSON.stringify(keys), {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}`,
      'Content-Type': 'application/json',
    },
  });

  await cache.put(CACHE_KEY, cacheResponse);
  return keys[kid];
}

// JWT verification helper
async function verifyJWT(
  token: string
): Promise<{ userId: string; userEmail: string }> {
  try {
    const decoded = jose.decodeJwt(token);
    if (!decoded.sub || !decoded.email) {
      throw new Error('Invalid token payload');
    }

    // Get the key ID from the token header
    const { kid } = jose.decodeProtectedHeader(token);
    if (!kid) {
      throw new Error('No key ID in token header');
    }

    // Get Firebase public keys from cache or fetch new ones
    const publicKey = await getFirebasePublicKeys(kid);
    if (!publicKey) {
      throw new Error('Public key not found');
    }

    // Import the public key and verify the token
    const publicKeyObj = await jose.importX509(publicKey, 'RS256');
    await jose.jwtVerify(token, publicKeyObj, {
      issuer: 'https://securetoken.google.com/ashcoin-51786',
      audience: 'ashcoin-51786',
    });

    return {
      userId: decoded.sub,
      userEmail: decoded.email as string,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
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
