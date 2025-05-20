import { z } from "zod";
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
  type GetCreditHistoryResponse,
  type RedeemCouponResponse,
  type StripeCheckoutResponse,
  type TelegramStats,
  GetUserResponseSchema,
  RotateApiKeyResponseSchema,
  GetCreditHistoryResponseSchema,
  RedeemCouponResponseSchema,
  StripeCheckoutResponseSchema,
  TelegramStatsSchema,
  TransactionType,
  TransactionReason,
} from "../types/api";

export interface APIClientConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
}

export class APIError extends Error {
  constructor(message: string, public status: number, public data?: unknown) {
    super(message);
    this.name = "APIError";
  }
}

export class APIClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: APIClientConfig) {
    this.baseUrl = config.baseUrl.endsWith("/")
      ? config.baseUrl.slice(0, -1)
      : config.baseUrl;
    this.headers = {
      "Content-Type": "application/json",
    };

    if (config.apiKey) {
      this.headers["x-api-key"] = config.apiKey;
    }
    if (config.authToken) {
      this.headers["Authorization"] = `Bearer ${config.authToken}`;
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
        errorData?.error?.message || "API request failed",
        response.status,
        errorData
      );
    }

    const data = await response.json();
    console.log("---data", data);
    if (schema) {
      const result = schema.safeParse(data);
      console.log("---result", result);
      if (!result.success) {
        throw new APIError("Invalid response data", 500, result.error);
      }
      return result.data;
    }
    return data as T;
  }

  // Conversation endpoints
  async createConversation(
    data: CreateConversationRequest
  ): Promise<CreateConversationResponse> {
    return this.request(
      "/v1/conversation/create",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      CreateConversationResponseSchema
    );
  }

  async deleteConversation(
    data: DeleteConversationRequest
  ): Promise<DeleteConversationResponse> {
    return this.request(
      "/v1/conversation/delete",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      DeleteConversationResponseSchema
    );
  }

  async listConversations(): Promise<ListConversationsResponse> {
    return this.request(
      "/v1/conversation/list",
      {
        method: "GET",
      },
      ListConversationsResponseSchema
    );
  }

  // User endpoints
  async getUser(): Promise<GetUserResponse> {
    return this.request("/v1/user", { method: "GET" }, GetUserResponseSchema);
  }

  async toggleApiKey(data: ToggleApiKeyRequest): Promise<void> {
    await this.request("/v1/user/toggle_api_key_enabled", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async rotateApiKey(): Promise<RotateApiKeyResponse> {
    return this.request(
      "/v1/user/rotate_api_key",
      { method: "POST" },
      RotateApiKeyResponseSchema
    );
  }

  async getCreditHistory(params?: {
    startDate?: string;
    endDate?: string;
    model?: string;
    txType?: TransactionType;
    txReason?: TransactionReason;
  }): Promise<GetCreditHistoryResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.model) queryParams.append("model", params.model);
    if (params?.txType) queryParams.append("transType", params.txType);
    if (params?.txReason) queryParams.append("transReason", params.txReason);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `/v1/user/credit_history?${queryString}`
      : "/v1/user/credit_history";

    return this.request(
      endpoint,
      { method: "GET" },
      GetCreditHistoryResponseSchema
    );
  }

  async redeemCoupon(code: string): Promise<RedeemCouponResponse> {
    return this.request(
      "/v1/user/redeem_coupon_code",
      {
        method: "POST",
        body: JSON.stringify({ code }),
      },
      RedeemCouponResponseSchema
    );
  }

  // Stripe endpoints
  async createCheckout(amount: number): Promise<StripeCheckoutResponse> {
    return this.request(
      "/v1/stripe/checkout",
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
      StripeCheckoutResponseSchema
    );
  }

  // Telegram endpoints
  async getTelegramStats(): Promise<TelegramStats> {
    return this.request("/v1/tg/stats", { method: "GET" }, TelegramStatsSchema);
  }
}
