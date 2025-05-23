interface Env {
  // variables
  OPENROUTER_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  DEEPINFRA_API_KEY: string;
  STRIPE_PUBLIC_KEY: string;
  STRIPE_PRIVATE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  MYSTA_PUBLIC_DOMAIN: string;
  // bindings
  MYSTA_TG_INDEX: Vectorize;
  MYTSTA_E5_INDEX: Vectorize;
  AgentContext: DurableObjectNamespace<AgentContext>;
  DB: D1Database;
}
