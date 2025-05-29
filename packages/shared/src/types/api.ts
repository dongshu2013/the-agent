import { z } from 'zod';

// Common types
export const MessageRoleSchema = z.enum(['system', 'user', 'assistant', 'tool', 'error']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const ToolCallResultSchema = z.object({
  success: z.boolean(),
  data: z.any().nullable().optional(),
  error: z.string().nullable().optional(),
});
export type ToolCallResult = z.infer<typeof ToolCallResultSchema>;

export const ToolCallSchema = z.object({
  id: z.string(),
  type: z.string(),
  function: z.object({
    name: z.string(),
    arguments: z.string(),
  }),
  result: ToolCallResultSchema.nullable().optional(),
});
export type ToolCall = z.infer<typeof ToolCallSchema>;

export const TokenUsageSchema = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});
export type TokenUsage = z.infer<typeof TokenUsageSchema>;

export const ChatMessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().nullable().optional(),
  reasoning: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  tool_calls: z.array(ToolCallSchema).nullable().optional(),
  tool_call_id: z.string().nullable().optional(),
  token_usage: TokenUsageSchema.nullable().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const MessageSchema = ChatMessageSchema.extend({
  id: z.number(),
  conversation_id: z.number(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.number(),
  messages: z.array(MessageSchema).nullable().optional(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

// conversation handlers
export const CreateConversationRequestSchema = z.object({
  id: z.number(),
});
export type CreateConversationRequest = z.infer<typeof CreateConversationRequestSchema>;

export const CreateConversationResponseSchema = z.object({
  id: z.number(),
});
export type CreateConversationResponse = z.infer<typeof CreateConversationResponseSchema>;

export const DeleteConversationRequestSchema = z.object({
  id: z.number(),
});
export type DeleteConversationRequest = z.infer<typeof DeleteConversationRequestSchema>;

export const DeleteConversationResponseSchema = z.object({
  deleted: z.boolean(),
});
export type DeleteConversationResponse = z.infer<typeof DeleteConversationResponseSchema>;

export const ListConversationsRequestSchema = z.object({
  startFrom: z.number().default(0),
});
export type ListConversationsRequest = z.infer<typeof ListConversationsRequestSchema>;

export const ListConversationsResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
});
export type ListConversationsResponse = z.infer<typeof ListConversationsResponseSchema>;

// message handlers
export const SaveMessageRequestSchema = z.object({
  message: MessageSchema,
  top_k_related: z.number().default(0),
  threshold: z.number().default(0.7),
});
export type SaveMessageRequest = z.infer<typeof SaveMessageRequestSchema>;

export const SaveMessageResponseSchema = z.object({
  top_k_message_ids: z.array(z.number()),
});
export type SaveMessageResponse = z.infer<typeof SaveMessageResponseSchema>;

// Chat completion parameters
export const ChatCompletionCreateParamSchema = z.object({
  messages: z.array(ChatMessageSchema),
  model: z.string(),
  frequency_penalty: z.number().nullable().optional(),
  logit_bias: z.record(z.number()).nullable().optional(),
  max_tokens: z.number().nullable().optional(),
  n: z.number().nullable().optional(),
  presence_penalty: z.number().nullable().optional(),
  response_format: z.record(z.string()).nullable().optional(),
  seed: z.number().nullable().optional(),
  stop: z
    .union([z.string(), z.array(z.string())])
    .nullable()
    .optional(),
  stream: z.boolean().default(false),
  temperature: z.number().nullable().optional(),
  top_p: z.number().nullable().optional(),
  tools: z.array(z.record(z.any())).nullable().optional(),
  tool_choice: z
    .union([z.string(), z.record(z.any())])
    .nullable()
    .optional(),
  user: z.string().nullable().optional(),
});

export type ChatCompletionCreateParam = z.infer<typeof ChatCompletionCreateParamSchema>;

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

// payment handlers
export const OrderStatusSchema = z.enum([
  'pending',
  'completed',
  'cancelled',
  'failed',
  'finalized',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const TransactionTypeSchema = z.enum(['credit', 'debit']);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionReasonSchema = z.enum([
  'new_user',
  'order_pay',
  'system_add',
  'completion',
  'coupon_code',
]);
export type TransactionReason = z.infer<typeof TransactionReasonSchema>;

export const CreditLogSchema = z.object({
  id: z.number(),
  tx_credits: z.number(),
  tx_type: z.string(),
  tx_reason: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  created_at: z.string(),
});
export type CreditLog = z.infer<typeof CreditLogSchema>;

export const GetUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  api_key: z.string(),
  api_key_enabled: z.boolean(),
  balance: z.number(),
});
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;

// telegram handlers

export const TelegramStatsSchema = z.object({
  total_dialogs: z.number(),
  total_messages: z.number(),
  last_sync_time: z.string().optional(),
});
export type TelegramStats = z.infer<typeof TelegramStatsSchema>;

// user handlers
export const GetUserBalanceResponseSchema = z.object({
  amount: z.number(),
});
export type GetUserBalanceResponse = z.infer<typeof GetUserBalanceResponseSchema>;

export const ToggleApiKeyRequestSchema = z.object({
  enabled: z.boolean(),
});
export type ToggleApiKeyRequest = z.infer<typeof ToggleApiKeyRequestSchema>;

export const ToggleApiKeyResponseSchema = z.object({
  enabled: z.boolean(),
});
export type ToggleApiKeyResponse = z.infer<typeof ToggleApiKeyResponseSchema>;

export const RotateApiKeyResponseSchema = z.object({
  newApiKey: z.string(),
});
export type RotateApiKeyResponse = z.infer<typeof RotateApiKeyResponseSchema>;

export const GetCreditDailyRequestSchema = z.object({
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});
export type GetCreditDailyRequest = z.infer<typeof GetCreditDailyRequestSchema>;

export const CreditDailyItemSchema = z.object({
  date: z.string(),
  credits: z.number(),
});
export type CreditDailyItem = z.infer<typeof CreditDailyItemSchema>;

export const GetCreditDailyResponseSchema = z.object({
  data: z.array(CreditDailyItemSchema),
});
export type GetCreditDailyResponse = z.infer<typeof GetCreditDailyResponseSchema>;

export const RedeemCouponRequestSchema = z.object({
  code: z.string(),
});
export type RedeemCouponRequest = z.infer<typeof RedeemCouponRequestSchema>;

export const RedeemCouponResponseSchema = z.object({
  added_credits: z.number(),
  total_credits: z.number(),
});
export type RedeemCouponResponse = z.infer<typeof RedeemCouponResponseSchema>;

// stripe handlers

export const StripeCheckoutRequestSchema = z.object({
  amount: z.number(),
});
export type StripeCheckoutRequest = z.infer<typeof StripeCheckoutRequestSchema>;

export const StripeCheckoutResponseSchema = z.object({
  order_id: z.number(),
  session_id: z.string(),
  public_key: z.string(),
});
export type StripeCheckoutResponse = z.infer<typeof StripeCheckoutResponseSchema>;
