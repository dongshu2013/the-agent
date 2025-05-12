import { Hono } from "hono";
import { cors } from "hono/cors";
import { fromHono } from "chanfana";

import { apiKeyAuthMiddleware } from "./auth";
import { GatewayServiceError } from "./types";

import { SaveMessage, handleSaveMessageOptions } from "./handlers/message";
import {
  CreateConversation,
  DeleteConversation,
  ListConversations,
  handleCreateConversationOptions,
  handleDeleteConversationOptions,
  handleListConversationsOptions,
} from "./handlers/conversation";
import { ChatCompletions } from "./handlers/chat";
import {
  GetTelegramDialogs,
  GetTelegramMessages,
  SearchTelegramMessages,
  SyncTelegramChat,
  SyncTelegramMessages,
  handleGetTelegramDialogsOptions,
  handleGetTelegramMessagesOptions,
  handleSearchTelegramMessagesOptions,
  handleSyncTelegramChatOptions,
  handleSyncTelegramMessagesOptions,
} from "./handlers/telegram";
import { AgentContext } from "./do/AgentContext";
import { TgContext } from "./do/TgContext";
import { corsHeaders } from "./utils/common";

const app = new Hono<{Bindings: Env}>();

// CORS middleware
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    exposeHeaders: ["*"],
    maxAge: 86400, // 24 hours
  })
);

// Add unauthenticated routes
app.get("/", (c) => c.text(""));
app.get("/health", (c) =>
  c.json({ status: "OK", version: "0.0.1" }, 200, corsHeaders)
);

// OPTIONS handlers for CORS preflight requests
app.options("/v1/conversation/create", handleCreateConversationOptions);
app.options("/v1/conversation/delete", handleDeleteConversationOptions);
app.options("/v1/conversation/list", handleListConversationsOptions);
app.options("/v1/message/save", handleSaveMessageOptions);
app.options("/v1/tg/get_dialogs", handleGetTelegramDialogsOptions);
app.options("/v1/tg/get_messages", handleGetTelegramMessagesOptions);
app.options("/v1/tg/search_messages", handleSearchTelegramMessagesOptions);
app.options("/v1/tg/sync_chat", handleSyncTelegramChatOptions);
app.options("/v1/tg/sync_messages", handleSyncTelegramMessagesOptions);

// Authenticated routes
app.use("/v1/conversation/create", apiKeyAuthMiddleware);
app.use("/v1/conversation/delete", apiKeyAuthMiddleware);
app.use("/v1/conversation/list", apiKeyAuthMiddleware);
app.use("/v1/message/save", apiKeyAuthMiddleware);
app.use("/v1/tg/get_dialogs", apiKeyAuthMiddleware);
app.use("/v1/tg/get_messages", apiKeyAuthMiddleware);
app.use("/v1/tg/search_messages", apiKeyAuthMiddleware);
app.use("/v1/tg/sync_chat", apiKeyAuthMiddleware);
app.use("/v1/tg/sync_messages", apiKeyAuthMiddleware);

app.onError(async (err, c) => {
  if (err instanceof GatewayServiceError) {
    return c.text(err.message, err.code);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
});

const openapi = fromHono(app, {
  schema: {
    info: {
      title: "Mizu Node Gateway",
      version: "0.0.1",
      description: "API Gateway for Mizu AI Agent",
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
});

openapi.registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
});

// agent core endpoints
openapi.post("/v1/conversation/create", CreateConversation);
openapi.post("/v1/conversation/delete", DeleteConversation);
openapi.get("/v1/conversation/list", ListConversations);
openapi.post("/v1/message/save", SaveMessage);

// telegram routes
openapi.get("/v1/tg/get_dialogs", GetTelegramDialogs);
openapi.get("/v1/tg/get_messages", GetTelegramMessages);
openapi.get("/v1/tg/search_messages", SearchTelegramMessages);
openapi.post("/v1/tg/sync_chat", SyncTelegramChat);
openapi.post("/v1/tg/sync_messages", SyncTelegramMessages);

// Register chat completion route
openapi.post("/v1/chat/completions", ChatCompletions);

// OpenAPI documentation endpoints
app.get("/docs/openapi.json", (c) => {
  // Access the OpenAPI schema through the registry
  // @ts-ignore - Workaround for TypeScript error
  const schema = openapi.schema || openapi.getGeneratedSchema?.() || {};
  return c.json(schema);
});

app.get("/docs", (c) => {
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
