interface Env {
  SUPABASE_KEY: string;
  SUPABASE_URL: string;
  LLM_API_KEY: string;
  LLM_API_URL: string;
  DEFAULT_MODEL: string;
  MYTSTA_E5_INDEX: Vectorize;
  EMBEDDING_API_KEY: string;
  AgentContext: DurableObjectNamespace<AgentContext>;
  UDB: D1Database;
}
