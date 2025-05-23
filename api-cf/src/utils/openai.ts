import { ChatCompletionCreateParam } from '@the-agent/shared';

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
}

// Factory function to create an OpenAI client
export function createOpenAIClient(apiKey: string, baseURL: string): OpenAIClient {
  return new OpenAIClient(apiKey, baseURL);
}
