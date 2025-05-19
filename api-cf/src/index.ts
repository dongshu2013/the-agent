import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fromHono } from 'chanfana';

import { jwtOrApiKeyAuthMiddleware } from './auth';
import { GatewayServiceError } from './types/service';

import { SaveMessage } from './handlers/message';
import {
  CreateConversation,
  DeleteConversation,
  ListConversations,
} from './handlers/conversation';
import { ChatCompletions } from './handlers/chat';
import {
  GetMyChat,
  GetTelegramDialogs,
  GetTelegramMessages,
  GetTelegramStats,
  SearchTelegramMessages,
  SyncTelegramChat,
  SyncTelegramMessages,
} from './handlers/telegram';
import { AgentContext } from './do/AgentContext';
import { TgContext } from './do/TgContext';
import { corsHeaders } from './utils/common';
import { StripeCheckout, StripeWebhook } from './handlers/stripe';
import {
  GetCreditLogs,
  GetUser,
  GetUserBalance,
  RotateApiKey,
  ToggleApiKeyEnabled,
  RedeemCouponCode,
} from './handlers/user';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposeHeaders: ['*'],
    maxAge: 86400, // 24 hours
  })
);

// Add unauthenticated routes
app.get('/', (c) => c.text(''));
app.get('/health', (c) =>
  c.json({ status: 'OK', version: '0.0.1' }, 200, corsHeaders)
);

// Authenticated routes
app.use('/v1/conversation/create', jwtOrApiKeyAuthMiddleware);
app.use('/v1/conversation/delete', jwtOrApiKeyAuthMiddleware);
app.use('/v1/conversation/list', jwtOrApiKeyAuthMiddleware);

app.use('/v1/chat/completions', jwtOrApiKeyAuthMiddleware);
app.use('/v1/message/save', jwtOrApiKeyAuthMiddleware);

app.use('/v1/tg/stats', jwtOrApiKeyAuthMiddleware);
app.use('/v1/tg/get_my_chat', jwtOrApiKeyAuthMiddleware);
app.use('/v1/tg/get_dialogs', jwtOrApiKeyAuthMiddleware);
app.use('/v1/tg/get_messages', jwtOrApiKeyAuthMiddleware);
app.use('/v1/tg/search_messages', jwtOrApiKeyAuthMiddleware);
app.use('/v1/tg/sync_chat', jwtOrApiKeyAuthMiddleware);
app.use('/v1/tg/sync_messages', jwtOrApiKeyAuthMiddleware);

app.use('/v1/stripe/checkout', jwtOrApiKeyAuthMiddleware);

app.use('/v1/user/balance', jwtOrApiKeyAuthMiddleware);
app.use('/v1/user/credit_history', jwtOrApiKeyAuthMiddleware);
app.use('/v1/user', jwtOrApiKeyAuthMiddleware);
app.use('/v1/user/rotate_api_key', jwtOrApiKeyAuthMiddleware);
app.use('/v1/user/toggle_api_key_enabled', jwtOrApiKeyAuthMiddleware);
app.use('/v1/user/redeem_coupon_code', jwtOrApiKeyAuthMiddleware);

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
      description: 'API Gateway for Mizu AI Agent',
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

// agent core endpoints
openapi.post('/v1/conversation/create', CreateConversation);
openapi.post('/v1/conversation/delete', DeleteConversation);
openapi.get('/v1/conversation/list', ListConversations);
openapi.post('/v1/message/save', SaveMessage);

// Register chat completion route
openapi.post('/v1/chat/completions', ChatCompletions);

// telegram routes
openapi.get('/v1/tg/stats', GetTelegramStats);
openapi.get('/v1/tg/get_my_chat', GetMyChat);
openapi.get('/v1/tg/get_dialogs', GetTelegramDialogs);
openapi.get('/v1/tg/get_messages', GetTelegramMessages);
openapi.get('/v1/tg/search_messages', SearchTelegramMessages);
openapi.post('/v1/tg/sync_chat', SyncTelegramChat);
openapi.post('/v1/tg/sync_messages', SyncTelegramMessages);

openapi.post('/v1/stripe/checkout', StripeCheckout);
openapi.post('/v1/stripe/webhook', StripeWebhook);

openapi.post('/v1/user/rotate_api_key', RotateApiKey);
openapi.post('/v1/user/toggle_api_key_enabled', ToggleApiKeyEnabled);
openapi.post('/v1/user/redeem_coupon_code', RedeemCouponCode);

openapi.get('/v1/user/balance', GetUserBalance);
openapi.get('/v1/user/credit_history', GetCreditLogs);
openapi.get('/v1/user', GetUser);

// OpenAPI documentation endpoints
app.get('/docs/openapi.json', (c) => {
  const schema =
    (openapi as any).schema || (openapi as any).getGeneratedSchema?.() || {};
  return c.json(schema);
});

app.get('/docs', (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mizu API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.json',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>
  `;
  return c.html(html);
});

export default app;

// Export the Durable Object classes for Cloudflare Workers
export { AgentContext, TgContext };
