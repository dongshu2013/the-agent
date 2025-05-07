import { MODEL_PRICING } from '../constants/models';

/**
 * 计算 AI 使用的信用额度
 * @param tokenUsage TokenUsage
 * @param model 模型名称
 * @returns 信用额度数值（number类型）
 */
export function calculateAIUsageCredits(
  tokenUsage: TokenUsage,
  model: string
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];

  // 获取 token 使用量
  const { promptTokens, completionTokens } = tokenUsage;

  // 使用标准 JavaScript 数值计算
  const inputCost = (promptTokens / 1_000_000) * pricing.inputPrice;
  const outputCost = (completionTokens / 1_000_000) * pricing.outputPrice;

  // 返回计算结果，保留小数点后6位以确保精度
  return Number((inputCost + outputCost).toFixed(6));
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
