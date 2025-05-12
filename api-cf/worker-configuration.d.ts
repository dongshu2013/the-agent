interface Env {
  SUPABASE_KEY: string;
  SUPABASE_URL: string;
  LLM_API_KEY: string;
  LLM_API_URL: string;
  DEFAULT_MODEL: string;
  EMBEDDING_API_KEY: string;
  MYSTA_TG_INDEX: Vectorize;
  MYTSTA_E5_INDEX: Vectorize;
  AgentContext: DurableObjectNamespace<AgentContext>;
  UDB: D1Database;
}
