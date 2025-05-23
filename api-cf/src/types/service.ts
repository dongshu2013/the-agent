import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export class GatewayServiceError extends Error {
  code: ContentfulStatusCode;

  constructor(code: ContentfulStatusCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'GatewayServiceError';
  }
}

export type GatewayServiceContext = Context<{
  Bindings: Env;
  Variables: {
    userId: string;
    userEmail: string;
    userKey: string;
  };
}>;
