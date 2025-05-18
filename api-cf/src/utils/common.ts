export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export const DEFAULT_MODEL = 'deepseek/deepseek-chat';

export const FIREBASE_PROJECT_ID = 'mysta-ai';

export const AMOUNT_BASE = 1000000; // 10^6 = 1USDT

export function getCreditFromAmount(amount: number) {
  return Math.max(1, Math.ceil(amount));
}

// Cost multipliers for different types of operations
export const COST_MULTIPLIERS = {
  input: 1.0, // Base multiplier for input tokens
  output: 1.2, // Higher multiplier for output tokens to account for generation costs
};

// Constants for save message embedding cost calculations
export const API_COST_PRICE = 1; // Cost per million calls
export const EMBEDDING_QUERY_COST_PRICE = 10; // Cost per million tokens, cost 10
export const DATA_COST_PRICE = 0.001; // Cost credits per byte, cost 0.75

export interface ModelPricing {
  inputPrice: number;
  outputPrice: number;
}

// Cost per million tokens for the prompt.
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'deepseek/deepseek-chat': {
    inputPrice: 0.28,
    outputPrice: 1.11,
  },
  'deepseek-chat': {
    inputPrice: 0.28,
    outputPrice: 1.11,
  },
  // Embedding Models
  'intfloat/multilingual-e5-large': {
    inputPrice: 0.02, // Price per million tokens, cost 0.01
    outputPrice: 0, // Embeddings don't have output tokens
  },
};

export const DEEPSEEK_API_URL = 'https://api.deepseek.com';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
export const DEEPINFRA_API_BASE_URL = 'https://api.deepinfra.com/v1/openai';
export const EMBEDDING_MODEL = 'intfloat/multilingual-e5-large';
