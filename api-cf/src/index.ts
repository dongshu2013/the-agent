import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { fromHono } from 'chanfana';
import { apiKeyAuthMiddleware } from './auth';

import { GatewayServiceError } from './types';
import {
  CreateConversation,
  DeleteConversation,
  ListConversations,
  SaveMessage,
  ChatCompletions,
  GetTelegramDialogs,
  GetTelegramMessages,
  SearchTelegramMessages,
  handleCreateConversationOptions,
  handleDeleteConversationOptions,
  handleListConversationsOptions,
  handleSaveMessageOptions,
  handleChatCompletionsOptions,
  handleGetTelegramDialogsOptions,
  handleGetTelegramMessagesOptions,
  handleSearchTelegramMessagesOptions,
  CreateConversationV2,
  DeleteConversationV2,
  ListConversationsV2,
  SaveMessageV2
} from './handlers';
import { AgentContext } from './do/AgentContext';

// CORS headers as specified in the memory
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

const app = new Hono<{
  Bindings: {
    MYTSTA_E5_INDEX: Vectorize;
    SUPABASE_KEY: string;
    SUPABASE_URL: string;
    OPENAI_API_KEY: string;
    EMBEDDING_API_KEY: string;
    AgentContext: DurableObjectNamespace<AgentContext>
  }
}>();

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposeHeaders: ['*'],
    maxAge: 86400, // 24 hours
  }),
);

// Add unauthenticated routes
app.get('/', c => c.text(''));
app.get('/health', c => c.json({ status: 'OK', version: '0.0.1' }, 200, corsHeaders));

// OPTIONS handlers for CORS preflight requests
app.options('/v1/conversation/create', handleCreateConversationOptions);
app.options('/v1/conversation/delete', handleDeleteConversationOptions);
app.options('/v1/conversation/list', handleListConversationsOptions);
app.options('/v1/message/save', handleSaveMessageOptions);
app.options('/v1/chat/completions', handleChatCompletionsOptions);
app.options('/v1/tg/get_dialogs', handleGetTelegramDialogsOptions);
app.options('/v1/tg/get_messages', handleGetTelegramMessagesOptions);
app.options('/v1/tg/search_messages', handleSearchTelegramMessagesOptions);

app.options('/v2/conversation/create', handleCreateConversationOptions);
app.options('/v2/conversation/delete', handleDeleteConversationOptions);
app.options('/v2/conversation/list', handleListConversationsOptions);
app.options('/v2/message/save', handleSaveMessageOptions);

// Authenticated routes
app.use('/v1/conversation/create', apiKeyAuthMiddleware);
app.use('/v1/conversation/delete', apiKeyAuthMiddleware);
app.use('/v1/conversation/list', apiKeyAuthMiddleware);
app.use('/v1/message/save', apiKeyAuthMiddleware);
app.use('/v1/chat/completions', apiKeyAuthMiddleware);
app.use('/v1/tg/get_dialogs', apiKeyAuthMiddleware);
app.use('/v1/tg/get_messages', apiKeyAuthMiddleware);
app.use('/v1/tg/search_messages', apiKeyAuthMiddleware);

app.use('/v2/conversation/create', apiKeyAuthMiddleware);
app.use('/v2/conversation/delete', apiKeyAuthMiddleware);
app.use('/v2/conversation/list', apiKeyAuthMiddleware);
app.use('/v2/message/save', apiKeyAuthMiddleware);

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
      description: 'API Gateway for Mizu AI Agent'
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


//v2 endpoints
openapi.post('/v2/conversation/create', CreateConversationV2);
openapi.post('/v2/conversation/delete', DeleteConversationV2);
openapi.get('/v2/conversation/list', ListConversationsV2);
openapi.post('/v2/message/save', SaveMessageV2);

// Register conversation routes
openapi.post('/v1/conversation/create', CreateConversation);
openapi.post('/v1/conversation/delete', DeleteConversation);
openapi.get('/v1/conversation/list', ListConversations);

// Register message routes
openapi.post('/v1/message/save', SaveMessage);

// Register chat completion route
openapi.post('/v1/chat/completions', ChatCompletions);

// Register telegram routes
openapi.get('/v1/tg/get_dialogs', GetTelegramDialogs);
openapi.get('/v1/tg/get_messages', GetTelegramMessages);
openapi.get('/v1/tg/search_messages', SearchTelegramMessages);

// OpenAPI documentation endpoints
app.get('/docs/openapi.json', (c) => {
  // Access the OpenAPI schema through the registry
  // @ts-ignore - Workaround for TypeScript error
  const schema = openapi.schema || openapi.getGeneratedSchema?.() || {};
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
