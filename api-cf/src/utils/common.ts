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
  inference: 3, // Base multiplier for ai tokens
  embedding: 5,
};

// Constants for save message embedding cost calculations
export const API_COST_PRICE = 1; // credit cost per call
export const EMBEDDING_QUERY_COST_PRICE = 10.24; // credit cost per embedding query
export const DATA_COST_PRICE = 0.001; // credit cost per byte

export interface ModelPricing {
  inputPrice: number;
  outputPrice: number;
}

// credit cost per token for the prompt.
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
    inputPrice: 0.02,
    outputPrice: 0,
  },
};

export const DEEPSEEK_API_URL = 'https://api.deepseek.com';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
export const DEEPINFRA_API_BASE_URL = 'https://api.deepinfra.com/v1/openai';
export const EMBEDDING_MODEL = 'intfloat/multilingual-e5-large';
