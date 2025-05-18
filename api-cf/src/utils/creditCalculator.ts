import { GatewayServiceError } from '../types/service';
import {
  MODEL_PRICING,
  COST_MULTIPLIERS,
  DATA_COST_PRICE,
  API_COST_PRICE,
  EMBEDDING_QUERY_COST_PRICE,
  CALCULATE_BASE,
} from './common';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface Cost {
  inputCost: number;
  outputCost: number;
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
 * @param model The model name
 * @param totalTokens Total number of tokens
 * @param dataSize Data size in bytes
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
  // Cost per million calls
  const apiCost = API_COST_PRICE / CALCULATE_BASE;

  // Calculate Emb cost
  const embeddingQueryCost = EMBEDDING_QUERY_COST_PRICE / CALCULATE_BASE;
  const embeddingTokenCost =
    (totalTokens * pricing.inputPrice) / CALCULATE_BASE;
  const embeddingCost = embeddingQueryCost + embeddingTokenCost;

  // Convert bytes to GB and calculate data size-based cost
  const sizeInGB = dataSize / (1024 * 1024 * 1024);
  const storageCost = sizeInGB * DATA_COST_PRICE;

  const totalCost = apiCost + embeddingCost + storageCost;

  console.log('---calculateEmbeddingCredits', {
    model,
    totalTokens,
    dataSize,
    apiCost,
    embeddingCost,
    storageCost,
    totalCost,
  });

  return {
    inputCost: embeddingCost,
    outputCost: 0, // Embeddings don't have output costs
    totalCost: totalCost,
  };
}
