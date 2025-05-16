import { GatewayServiceError } from '../types/service';
import {
  MODEL_PRICING,
  COST_MULTIPLIERS,
  TOKEN_COST_MULTIPLIER,
  DATA_SIZE_COST_MULTIPLIER,
} from './common';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface Cost {
  inputCost: number;
  outputCost: number;
  dataSizeCost?: number;
  totalCost: number;
}

export interface CreditCalculationResult {
  cost: Cost;
  tokenUsage: TokenUsage;
}

/**
 * Calculates the credit cost based on token usage and model pricing
 */
export function calculateCredits(
  model: string,
  tokenUsage: TokenUsage
): CreditCalculationResult {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new GatewayServiceError(401, `${model} not found in model pricing`);
  }

  // Calculate costs with multipliers (per 1M tokens)
  const inputCost =
    (tokenUsage.promptTokens * pricing.inputPrice * COST_MULTIPLIERS.input) /
    1000000;
  const outputCost =
    (tokenUsage.completionTokens *
      pricing.outputPrice *
      COST_MULTIPLIERS.output) /
    1000000;

  const cost: Cost = {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };

  return {
    cost,
    tokenUsage,
  };
}

/**
 * Creates a token usage tracker for streaming responses
 */
export function createStreamingTokenTracker() {
  let promptTokens = 0;
  let completionTokens = 0;

  return {
    setPromptTokens: (tokens: number) => {
      promptTokens = tokens;
    },
    setCompletionTokens: (tokens: number) => {
      completionTokens = tokens;
    },
    addCompletionTokens: (tokens: number) => {
      completionTokens += tokens;
    },
    getTokenUsage: (): TokenUsage => ({
      promptTokens,
      completionTokens,
    }),
  };
}

/**
 * Calculates the credit cost for embeddings based on token usage and data size
 */
export function calculateEmbeddingCredits(
  model: string,
  totalTokens: number,
  dataSize: number
): Cost {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new GatewayServiceError(401, `${model} not found in model pricing`);
  }

  // Calculate token-based cost
  const tokenBasedCost =
    (totalTokens * pricing.inputPrice * TOKEN_COST_MULTIPLIER) / 1000000;

  // Calculate data size-based cost
  const dataSizeCost = dataSize * DATA_SIZE_COST_MULTIPLIER;

  const totalCost = tokenBasedCost + dataSizeCost;

  return {
    inputCost: tokenBasedCost,
    outputCost: 0, // Embeddings don't have output costs
    dataSizeCost: dataSizeCost,
    totalCost: totalCost,
  };
}
