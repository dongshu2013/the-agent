import { APIClient } from '@the-agent/shared';

export function createApiClient(token: string): APIClient {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  return new APIClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    authToken: token,
  });
}
