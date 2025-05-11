import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { fromHono } from 'chanfana';
import { apiKeyAuthMiddleware } from './auth';

import { GatewayServiceError } from './types';
import { CreateConversation } from './handlers';

const app = new Hono<{ Bindings: {
  SUPABASE_KEY: string;
  SUPABASE_URL: string;
} }>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Add unauthenticated routes
app.get('/', c => c.text(''));
app.get('/health', c => c.json({ status: 'OK' }));

// Authenticated routes
app.use('/v1/conversation/create', apiKeyAuthMiddleware);
// app.use('/v1/conversation/delete', apiKeyAuthMiddleware);
// app.use('/v1/conversation/list', apiKeyAuthMiddleware);

// app.use('/v1/messsage/save', apiKeyAuthMiddleware);
// app.use('/v1/messsage/search', apiKeyAuthMiddleware);

// app.use('/v1/chat/completions', apiKeyAuthMiddleware);

app.onError(async (err, c) => {
  if (err instanceof GatewayServiceError) {
    return c.text(err.message, err.code);
  }
  console.error(err);
  return c.text('Internal Server Error', 500);
});

const openapi = fromHono(app, {
  schema: {
    info: {
      title: 'Mizu Node Gateway',
      version: '0.0.1',
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
});

openapi.registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
});

openapi.post('/v1/conversation/create', CreateConversation);
// openapi.post('/v1/conversation/delete', DeleteConversation);
// openapi.get('/v1/conversation/list', ListConversations);

// openapi.post('/v1/message/save', SaveMessage);
// openapi.get('/v1/message/search', SearchMessage);

// openapi.post('/v1/chat/completions', ChatCompletions);

export default app;
