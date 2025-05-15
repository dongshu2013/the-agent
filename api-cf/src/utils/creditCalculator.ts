import { MODEL_PRICING, COST_MULTIPLIERS } from './common';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface Cost {
  totalCost: number;
  inputCost: number;
  outputCost: number;
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
    throw new Error(`Model ${model} not found in pricing`);
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
