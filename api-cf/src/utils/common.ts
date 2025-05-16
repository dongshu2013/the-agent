export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export const DEFAULT_MODEL = 'deepseek/deepseek-chat';

export const FIREBASE_PROJECT_ID = 'ashcoin-51786';

export const AMOUNT_BASE = 1000000; // 10^6 = 1USDT

export function getCreditFromAmount(amount: number) {
  return amount * AMOUNT_BASE;
}

// Cost multipliers for different types of operations
export const COST_MULTIPLIERS = {
  input: 1.0, // Base multiplier for input tokens
  output: 1.2, // Higher multiplier for output tokens to account for generation costs
};

// Constants for save message embedding cost calculations
export const TOKEN_COST_MULTIPLIER = 0.01; // Cost per token
export const DATA_SIZE_COST_MULTIPLIER = 0.002; // Cost per byte

export interface ModelPricing {
  inputPrice: number;
  outputPrice: number;
}

// Cost per million tokens for the prompt.
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Gemini
  // 'google/gemini-2.0-flash-exp:free': {
  //   inputPrice: 0,
  //   outputPrice: 0,
  // },
  // 'google/gemini-2.0-flash-001': {
  //   inputPrice: 0.1,
  //   outputPrice: 0.4,
  // },
  // 'google/gemini-2.5-pro-preview-03-25': {
  //   inputPrice: 1.25,
  //   outputPrice: 10,
  // },

  // DeepSeek
  // 'deepseek/deepseek-r1-distill-llama-70b': {
  //   inputPrice: 0.0,
  //   outputPrice: 0.0,
  // },
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
    inputPrice: 1, // Price per million tokens
    outputPrice: 0, // Embeddings don't have output tokens
  },
};

export const DEEPSEEK_API_URL = 'https://api.deepseek.com';
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
export const DEEPINFRA_API_BASE_URL = 'https://api.deepinfra.com/v1/openai';
export const EMBEDDING_MODEL = 'intfloat/multilingual-e5-large';
