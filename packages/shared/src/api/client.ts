import { z } from 'zod';
import {
  type CreateConversationRequest,
  type CreateConversationResponse,
  type DeleteConversationRequest,
  type DeleteConversationResponse,
  type ListConversationsResponse,
  CreateConversationResponseSchema,
  DeleteConversationResponseSchema,
  ListConversationsResponseSchema,
} from '../types/api';

export interface APIClientConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class APIClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: APIClientConfig) {
    this.baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      this.headers['x-api-key'] = config.apiKey;
    }
    if (config.authToken) {
      this.headers['Authorization'] = `Bearer ${config.authToken}`;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodType<T>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new APIError(
        errorData?.error?.message || 'API request failed',
        response.status,
        errorData
      );
    }

    const data = await response.json();
    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new APIError(
          'Invalid response data',
          500,
          result.error
        );
      }
      return result.data;
    }
    return data as T;
  }

  // Conversation endpoints
  async createConversation(data: CreateConversationRequest): Promise<CreateConversationResponse> {
    return this.request(
      '/v1/conversation/create',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      CreateConversationResponseSchema
    );
  }

  async deleteConversation(data: DeleteConversationRequest): Promise<DeleteConversationResponse> {
    return this.request(
      '/v1/conversation/delete',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      DeleteConversationResponseSchema
    );
  }

  async listConversations(): Promise<ListConversationsResponse> {
    return this.request(
      '/v1/conversation/list',
      {
        method: 'GET',
      },
      ListConversationsResponseSchema
    );
  }
}
