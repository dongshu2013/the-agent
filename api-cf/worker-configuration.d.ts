interface Env {
  // variables
  LLM_API_KEY: string;
  LLM_API_URL: string;
  DEFAULT_MODEL: string;
  EMBEDDING_API_KEY: string;
  STRIPE_PRIVATE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  MYSTA_PUBLIC_DOMAIN: string;
  JWT_PUB_KEY: string;
  // bindings
  MYSTA_TG_INDEX: Vectorize;
  MYTSTA_E5_INDEX: Vectorize;
  AgentContext: DurableObjectNamespace<AgentContext>;
  UDB: D1Database;
}
