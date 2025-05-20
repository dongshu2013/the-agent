import { Next } from 'hono';
import * as jose from 'jose';

import { GatewayServiceContext, GatewayServiceError } from './types/service';
import { getUserFromApiKey } from './d1/user';
import { FIREBASE_PROJECT_ID } from './utils/common';

async function validateApiKey(c: GatewayServiceContext, apiKey: string, next: Next) {
  const user = await getUserFromApiKey(c.env, apiKey);
  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
}

// Authentication middleware for JWT or API_KEY
export async function jwtOrApiKeyAuthMiddleware(c: GatewayServiceContext, next: Next) {
  // Check for API Key in x-api-key header
  const apiKey = c.req.header('x-api-key');
  if (apiKey) {
    await validateApiKey(c, apiKey, next);
  } else {
    // Check for JWT in Authorization: Bearer header
    const token = getBearer(c);
    if (isUUID(token)) {
      // we need to support api key as bearer token
      // for openai lib compatibility
      await validateApiKey(c, token, next);
    } else {
      const { userId, userEmail } = await verifyJWT(token);
      c.set('userId', userId);
      c.set('userEmail', userEmail);
      await next();
    }
  }
}

const CACHE_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

async function getFirebasePublicKeys(kid: string): Promise<string> {
  const cache = caches.default;
  const cachedResponse = await cache.match(CACHE_URL);

  if (cachedResponse) {
    const cacheAge = Date.now() - new Date(cachedResponse.headers.get('Date') || '').getTime();
    const keys = (await cachedResponse.json()) as Record<string, string>;

    // If cache is less than 1 hour old OR the requested key exists in cache, use cached keys
    if (cacheAge < 3600000 || keys[kid]) {
      return keys[kid];
    }
  }

  // Fetch new keys if cache is old or key not found
  const response = await fetch(CACHE_URL);
  const keys = (await response.json()) as Record<string, string>;

  // Get cache expiration from Cache-Control header
  const cacheControl = response.headers.get('Cache-Control');
  const maxAge = cacheControl ? parseInt(cacheControl.split('max-age=')[1]) : 3600; // Default to 1 hour if no Cache-Control header

  // Create a new response with the keys and cache it
  const cacheResponse = new Response(JSON.stringify(keys), {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}`,
      'Content-Type': 'application/json',
    },
  });

  await cache.put(CACHE_URL, cacheResponse);
  return keys[kid];
}

// JWT verification helper
async function verifyJWT(token: string): Promise<{ userId: string; userEmail: string }> {
  try {
    const decoded = jose.decodeJwt(token);
    if (!decoded.sub || !decoded.email) {
      throw new GatewayServiceError(401, 'Invalid token payload');
    }

    // Get the key ID from the token header
    const { kid } = jose.decodeProtectedHeader(token);
    if (!kid) {
      throw new GatewayServiceError(401, 'No key ID in token header');
    }

    // Get Firebase public keys from cache or fetch new ones
    const publicKey = await getFirebasePublicKeys(kid);
    if (!publicKey) {
      throw new GatewayServiceError(401, 'Public key not found');
    }

    // Import the public key and verify the token
    const publicKeyObj = await jose.importX509(publicKey, 'RS256');
    await jose.jwtVerify(token, publicKeyObj, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });

    return {
      userId: decoded.sub,
      userEmail: decoded.email as string,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new GatewayServiceError(401, 'Invalid token');
  }
}

function getBearer(c: GatewayServiceContext): string {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new GatewayServiceError(401, 'Invalid token');
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new GatewayServiceError(401, 'Invalid token');
  }
  return token;
}

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
