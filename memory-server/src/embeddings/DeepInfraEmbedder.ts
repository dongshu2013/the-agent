import { Embedder } from 'mem0ai/oss';

interface DeepInfraResponse {
  embedding?: number[];
  embeddings?: number[][];
}

type DeepInfraResult = DeepInfraResponse | DeepInfraResponse[];

export class DeepInfraEmbedder implements Embedder {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; model?: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'intfloat/multilingual-e5-large';
    this.baseUrl = config.baseUrl || 'https://api.deepinfra.com/v1/inference';
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/${this.model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: [text] }),
    });

    if (!response.ok) {
      throw new Error(`DeepInfra API error: ${response.statusText}`);
    }

    const result = (await response.json()) as DeepInfraResult;
    if (Array.isArray(result)) {
      return result[0].embedding!;
    } else if ('embeddings' in result) {
      return result.embeddings![0];
    } else {
      throw new Error(`Unexpected DeepInfra response: ${JSON.stringify(result)}`);
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/${this.model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: texts }),
    });

    if (!response.ok) {
      throw new Error(`DeepInfra API error: ${response.statusText}`);
    }

    const result = (await response.json()) as DeepInfraResult;
    if (Array.isArray(result)) {
      return result.map(item => item.embedding!);
    } else if ('embeddings' in result) {
      return result.embeddings!;
    } else {
      throw new Error(`Unexpected DeepInfra response: ${JSON.stringify(result)}`);
    }
  }
}
