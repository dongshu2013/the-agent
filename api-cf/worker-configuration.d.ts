interface Env {
  SUPABASE_KEY: string;
  SUPABASE_URL: string;
  MYTSTA_E5_INDEX: Vectorize;
  EMBEDDING_API_KEY: string;
  AgentContext: DurableObjectNamespace<AgentContext>
}
