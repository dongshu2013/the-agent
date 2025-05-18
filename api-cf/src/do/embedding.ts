import OpenAI from 'openai';
import { calculateEmbeddingCredits } from '../utils/creditCalculator';
import { DEEPINFRA_API_BASE_URL, EMBEDDING_MODEL } from '../utils/common';

export function createEmbeddingClient(env: Env): OpenAI {
  const openai = new OpenAI({
    apiKey: env.DEEPINFRA_API_KEY,
    baseURL: DEEPINFRA_API_BASE_URL,
  });
  return openai;
}

export async function generateEmbedding(
  openai: OpenAI,
  texts: string[],
  topK = 3
): Promise<{ embedding: number[]; totalCost: number } | null> {
  try {
    const inputText = texts.join('\n');
    const response = await openai.embeddings.create({
      input: inputText,
      model: EMBEDDING_MODEL,
      encoding_format: 'float',
    });

    // Calculate data size in bytes
    const dataSize = new TextEncoder().encode(inputText).length;

    // Calculate credits based on token usage and data size
    const cost = calculateEmbeddingCredits(
      EMBEDDING_MODEL,
      response.usage.total_tokens,
      dataSize,
      topK
    );

    const embedding = response.data[0].embedding;
    return { embedding, totalCost: cost.totalCost };
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Continue execution even if embedding fails
    return null;
  }
}
