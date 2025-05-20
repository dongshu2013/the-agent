import { z } from 'zod';

// Common types
export const MessageRoleSchema = z.enum(['system', 'user', 'assistant', 'tooling']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const MessageContentSchema = z.array(
  z.object({
    type: z.enum(['text', 'image_url']),
    text: z.string().optional(),
    image_url: z.object({ url: z.string() }).optional(),
  })
);
export type MessageContent = z.infer<typeof MessageContentSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: MessageContentSchema,
  created_at: z.string(),
  conversation_id: z.string(),
  tool_calls: z.any().optional(),
  tool_call_id: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

// API Request/Response types
export const CreateConversationRequestSchema = z.object({
  id: z.number().optional(),
});
export type CreateConversationRequest = z.infer<typeof CreateConversationRequestSchema>;

export const CreateConversationResponseSchema = z.object({
  success: z.boolean(),
  id: z.number(),
});
export type CreateConversationResponse = z.infer<typeof CreateConversationResponseSchema>;

export const DeleteConversationRequestSchema = z.object({
  id: z.number(),
});
export type DeleteConversationRequest = z.infer<typeof DeleteConversationRequestSchema>;

export const DeleteConversationResponseSchema = z.object({
  success: z.boolean(),
});
export type DeleteConversationResponse = z.infer<typeof DeleteConversationResponseSchema>;

export const ListConversationsResponseSchema = z.object({
  success: z.boolean(),
  conversations: z.array(
    z.object({
      id: z.number(),
      messages: z.array(MessageSchema),
    })
  ),
});
export type ListConversationsResponse = z.infer<typeof ListConversationsResponseSchema>;

export const ChatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: MessageRoleSchema,
      content: z.string(),
    })
  ),
  stream: z.boolean().optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
});
export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;

export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: MessageRoleSchema,
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;

// User types
export const OrderStatusSchema = z.enum(['pending', 'completed', 'cancelled', 'failed', 'finalized']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const TransactionTypeSchema = z.enum(['credit', 'debit']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionReasonSchema = z.enum(['new_user', 'order_pay', 'system_add', 'completion', 'coupon_code']);
export type TransactionReason = z.infer<typeof TransactionReasonSchema>;

export const CreditLogSchema = z.object({
  id: z.number(),
  tx_credits: z.number(),
  tx_type: z.string(),
  tx_reason: z.string().optional(),
  model: z.string().optional(),
  created_at: z.string(),
});
export type CreditLog = z.infer<typeof CreditLogSchema>;

export const GetUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  api_key: z.string(),
  api_key_enabled: z.boolean(),
  balance: z.number(),
});
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

export const TelegramStatsSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalDialogs: z.number(),
    totalMessages: z.number(),
    lastSyncTime: z.string().optional(),
  }),
});
export type TelegramStats = z.infer<typeof TelegramStatsSchema>;

// Stripe types
export const StripeCheckoutResponseSchema = z.object({
  order_id: z.string(),
  session_id: z.string(),
  public_key: z.string(),
});
export type StripeCheckoutResponse = z.infer<typeof StripeCheckoutResponseSchema>;

// API request/response types
export const ToggleApiKeyRequestSchema = z.object({
  enabled: z.boolean(),
});
export type ToggleApiKeyRequest = z.infer<typeof ToggleApiKeyRequestSchema>;

export const RotateApiKeyResponseSchema = z.object({
  newApiKey: z.string(),
});
export type RotateApiKeyResponse = z.infer<typeof RotateApiKeyResponseSchema>;

export const GetCreditHistoryResponseSchema = z.object({
  history: z.array(CreditLogSchema),
});
export type GetCreditHistoryResponse = z.infer<typeof GetCreditHistoryResponseSchema>;

export const RedeemCouponResponseSchema = z.object({
  success: z.boolean(),
  credits: z.number().optional(),
  error: z.string().optional(),
});
export type RedeemCouponResponse = z.infer<typeof RedeemCouponResponseSchema>;
