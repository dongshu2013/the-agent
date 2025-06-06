import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  SUPABASE_URL: z.string(),
  SUPABASE_KEY: z.string(),
  NEO4J_URI: z
    .string()
    .refine(
      uri => uri.startsWith('bolt://') || uri.startsWith('neo4j://'),
      'NEO4J_URI must start with bolt:// or neo4j://'
    ),
  NEO4J_USER: z.string(),
  NEO4J_PASSWORD: z.string(),
  REQUEST_TIMEOUT: z.string().default('30000'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().default('100'),
  MEM0_API_KEY: z.string(),
  MEM0_HOST: z.string(),
  DEEPINFRA_API_KEY: z.string(),
  DEEPINFRA_MODEL: z.string().default('intfloat/multilingual-e5-large'),
  NEO4J_DATABASE: z.string().optional(),
  DEEPINFRA_LLM_MODEL: z.string().default('mistralai/Mistral-7B-Instruct-v0.2'),
  DEEPINFRA_EMBEDDING_MODEL: z.string().default('mistralai/Mistral-7B-Instruct-v0.2'),
});

const env = envSchema.parse(process.env);

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  logLevel: env.LOG_LEVEL,
  mem0: {
    enableGraph: true,
    embedder: {
      provider: 'deepinfra',
      config: {
        apiKey: env.DEEPINFRA_API_KEY,
        model: env.DEEPINFRA_EMBEDDING_MODEL,
      },
    },
    llm: {
      provider: 'deepinfra',
      config: {
        apiKey: env.DEEPINFRA_API_KEY,
        model: env.DEEPINFRA_LLM_MODEL,
      },
    },
    graphStore: {
      provider: 'neo4j',
      config: {
        url: env.NEO4J_URI,
        username: env.NEO4J_USER,
        password: env.NEO4J_PASSWORD,
        database: env.NEO4J_DATABASE,
      },
      llm: {
        provider: 'deepinfra',
        config: {
          apiKey: env.DEEPINFRA_API_KEY,
          model: env.DEEPINFRA_LLM_MODEL,
        },
      },
    },
    vectorStore: {
      provider: 'supabase',
      config: {
        supabaseUrl: env.SUPABASE_URL,
        supabaseKey: env.SUPABASE_KEY,
        tableName: 'memories',
        collectionName: 'memories',
        embeddingModelDims: 768, // DeepInfra's model dimension
      },
    },
    storage: {
      provider: 'supabase',
      config: {
        supabaseUrl: env.SUPABASE_URL,
        supabaseKey: env.SUPABASE_KEY,
      },
    },
  },
} as const;
