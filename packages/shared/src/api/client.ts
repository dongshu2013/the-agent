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
  type GetUserResponse,
  type ToggleApiKeyRequest,
  type RotateApiKeyResponse,
  type GetCreditDailyResponse,
  type RedeemCouponResponse,
  type StripeCheckoutResponse,
  type TelegramStats,
  GetUserResponseSchema,
  RotateApiKeyResponseSchema,
  GetCreditDailyResponseSchema,
  RedeemCouponResponseSchema,
  StripeCheckoutResponseSchema,
  TelegramStatsSchema,
  TransactionType,
  TransactionReason,
  type SaveMessageRequest,
  type SaveMessageResponse,
  SaveMessageResponseSchema,
  ListConversationsRequest,
  GetCreditDailyRequest,
  ClearUserResponse,
  ClearUserResponseSchema,
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
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          errorData = 'Invalid JSON response';
        }
      } else {
        try {
          errorData = await response.text();
        } catch {
          errorData = 'Could not read error response';
        }
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
        throw new APIError('Invalid response data', 500, result.error);
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

  async listConversations(params?: ListConversationsRequest): Promise<ListConversationsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startFrom) queryParams.append('startFrom', params.startFrom.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/v1/conversation/list?${queryString}` : '/v1/conversation/list';

    return this.request(
      endpoint,
      {
        method: 'GET',
      },
      ListConversationsResponseSchema
    );
  }

  // User endpoints
  async getUser(): Promise<GetUserResponse> {
    return this.request('/v1/user', { method: 'GET' }, GetUserResponseSchema);
  }

  async toggleApiKey(data: ToggleApiKeyRequest): Promise<void> {
    await this.request('/v1/user/toggle_api_key_enabled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rotateApiKey(): Promise<RotateApiKeyResponse> {
    return this.request('/v1/user/rotate_api_key', { method: 'POST' }, RotateApiKeyResponseSchema);
  }

  async getCreditDaily(params?: GetCreditDailyRequest): Promise<GetCreditDailyResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/v1/user/credit_daily?${queryString}` : '/v1/user/credit_daily';

    return this.request(endpoint, { method: 'GET' }, GetCreditDailyResponseSchema);
  }

  async redeemCoupon(code: string): Promise<RedeemCouponResponse> {
    return this.request(
      '/v1/user/redeem_coupon_code',
      {
        method: 'POST',
        body: JSON.stringify({ code }),
      },
      RedeemCouponResponseSchema
    );
  }

  async clearUser(): Promise<ClearUserResponse> {
    return this.request('/v1/user/clear', { method: 'POST' }, ClearUserResponseSchema);
  }

  // Stripe endpoints
  async createCheckout(amount: number): Promise<StripeCheckoutResponse> {
    return this.request(
      '/v1/stripe/checkout',
      {
        method: 'POST',
        body: JSON.stringify({ amount }),
      },
      StripeCheckoutResponseSchema
    );
  }

  // Telegram endpoints
  async getTelegramStats(): Promise<TelegramStats> {
    return this.request('/v1/tg/stats', { method: 'GET' }, TelegramStatsSchema);
  }

  // Message endpoints
  async saveMessage(data: SaveMessageRequest): Promise<SaveMessageResponse> {
    return this.request(
      '/v1/message/save',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      SaveMessageResponseSchema
    );
  }
}
