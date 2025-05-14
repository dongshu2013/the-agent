import OpenAI from 'openai';

const EMBEDDING_API_BASE_URL = 'https://api.deepinfra.com/v1/openai';
const EMBEDDING_MODEL = 'intfloat/multilingual-e5-large';

export function createEmbeddingClient(env: Env): OpenAI {
  const openai = new OpenAI({
    apiKey: env.EMBEDDING_API_KEY,
    baseURL: EMBEDDING_API_BASE_URL,
  });
  return openai;
}

export async function generateEmbedding(
  openai: OpenAI,
  texts: string[]
): Promise<number[] | null> {
  try {
    const response = await openai.embeddings.create({
      input: texts.join('\n'),
      model: EMBEDDING_MODEL,
      encoding_format: 'float',
    });
    const embedding = response.data[0].embedding;
    return embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    // Continue execution even if embedding fails
    return null;
  }
}
