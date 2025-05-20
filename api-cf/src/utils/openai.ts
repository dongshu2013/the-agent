import { ChatCompletionCreateParam } from '../types/chat';

// OpenAI API client for chat completions
export class OpenAIClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  // Helper to filter out null and undefined values
  private filterUndefined(obj: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== null && v !== undefined)
    );
  }

  // Create a chat completion
  async createChatCompletion(params: ChatCompletionCreateParam): Promise<Response> {
    const url = `${this.baseURL}/chat/completions`;

    // Filter out undefined values
    const filteredParams = this.filterUndefined(params);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(filteredParams),
    });

    return response;
  }

  // Stream a chat completion
  async streamChatCompletion(params: ChatCompletionCreateParam): Promise<Response> {
    // Ensure stream is set to true
    const streamParams = { ...params, stream: true };

    return this.createChatCompletion(streamParams);
  }

  // Get final token usage for a streaming completion
  async getFinalTokenUsage(params: ChatCompletionCreateParam): Promise<{
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }> {
    // Make a non-streaming request to get the final token usage
    const nonStreamParams = { ...params, stream: false };
    const response = await this.createChatCompletion(nonStreamParams);
    const result = (await response.json()) as {
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
      };
    };
    return result;
  }
}

// Factory function to create an OpenAI client
export function createOpenAIClient(apiKey: string, baseURL: string): OpenAIClient {
  return new OpenAIClient(apiKey, baseURL);
}
