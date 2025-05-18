import { GatewayServiceError } from '../types/service';
import {
  MODEL_PRICING,
  COST_MULTIPLIERS,
  DATA_COST_PRICE,
  API_COST_PRICE,
  EMBEDDING_QUERY_COST_PRICE,
} from './common';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface Cost {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  totalCostWithMultiplier: number;
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
  const inputCost = tokenUsage.promptTokens * pricing.inputPrice;
  const outputCost = tokenUsage.completionTokens * pricing.outputPrice;
  const totalCost = inputCost + outputCost;
  const cost: Cost = {
    inputCost,
    outputCost,
    totalCost,
    totalCostWithMultiplier: totalCost * COST_MULTIPLIERS.inference,
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
 * @param model The model name
 * @param totalTokens Total number of tokens
 * @param dataSize Data size in bytes
 */
export function calculateEmbeddingCredits(
  model: string,
  totalTokens: number,
  dataSize: number,
  topK: number
): Cost {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new GatewayServiceError(401, `${model} not found in model pricing`);
  }
  // Cost per million calls
  const apiCost = API_COST_PRICE;

  // Calculate Embedding cost
  const embeddingQueryCost = EMBEDDING_QUERY_COST_PRICE * topK;
  const embeddingTokenCost = totalTokens * pricing.inputPrice;
  const embeddingCost = embeddingQueryCost + embeddingTokenCost;

  // Calculate data size-based cost
  const storageCost = dataSize * DATA_COST_PRICE;

  const totalCost = apiCost + embeddingCost + storageCost;

  return {
    inputCost: embeddingCost,
    outputCost: 0, // Embeddings don't have output costs
    totalCost: totalCost,
    totalCostWithMultiplier: totalCost * COST_MULTIPLIERS.embedding,
  };
}
