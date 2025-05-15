export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export const DEFAULT_MODEL = 'deepseek/deepseek-chat';

export const FIREBASE_PROJECT_ID = 'ashcoin-51786';

// Cost multipliers for different types of operations
export const COST_MULTIPLIERS = {
  input: 1.0, // Base multiplier for input tokens
  output: 1.2, // Higher multiplier for output tokens to account for generation costs
};

export interface ModelPricing {
  inputPrice: number;
  outputPrice: number;
}

// Cost per million tokens for the prompt.
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // Gemini
  'google/gemini-2.0-flash-exp:free': {
    inputPrice: 0,
    outputPrice: 0,
  },
  'google/gemini-2.0-flash-001': {
    inputPrice: 0.1,
    outputPrice: 0.4,
  },
  'google/gemini-2.5-pro-preview-03-25': {
    inputPrice: 1.25,
    outputPrice: 10,
  },

  // DeepSeek
  'deepseek/deepseek-r1-distill-llama-70b': {
    inputPrice: 0.0,
    outputPrice: 0.0,
  },
};
