import { z } from "zod";

// Tool call related types
export const ToolCallFunctionSchema = z.object({
  name: z.string(),
  arguments: z.string(),
});

export const ToolCallSchema = z.object({
  function: ToolCallFunctionSchema,
  id: z.string(),
  type: z.string().optional(),
  result: z.string().optional(),
});

export type ToolCallFunction = z.infer<typeof ToolCallFunctionSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;

// Chat message types
export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string().optional(),
  toolCalls: z.array(ToolCallSchema).optional(),
  toolCallId: z.string().optional(),
  tool_call_id: z.string().optional(),
  tool_calls: z.array(ToolCallSchema).optional(),
  name: z.string().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatMessageWithIdSchema = ChatMessageSchema.extend({
  message_id: z.number(),
  created_at: z.string(),
});

export type ChatMessageWithId = z.infer<typeof ChatMessageWithIdSchema>;

// Chat completion parameters
export const ChatCompletionCreateParamSchema = z.object({
  messages: z.array(ChatMessageSchema),
  model: z.string(),
  frequency_penalty: z.number().optional(),
  logit_bias: z.record(z.number()).optional(),
  max_tokens: z.number().optional(),
  n: z.number().optional(),
  presence_penalty: z.number().optional(),
  response_format: z.record(z.string()).optional(),
  seed: z.number().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  stream: z.boolean().default(false),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
  tools: z.array(z.record(z.any())).optional(),
  tool_choice: z.union([z.string(), z.record(z.any())]).optional(),
  user: z.string().optional(),
});

export type ChatCompletionCreateParam = z.infer<
  typeof ChatCompletionCreateParamSchema
>;

// Request types for other endpoints
export const SaveMessageRequestSchema = z.object({
  conversation_id: z.number(),
  message: ChatMessageWithIdSchema,
  top_k_related: z.number().default(0),
});

export type SaveMessageRequest = z.infer<typeof SaveMessageRequestSchema>;

export const MessageSearchRequestSchema = z.object({
  message: z.string(),
  conversation_id: z.string(),
  k: z.number().default(3),
});

export type MessageSearchRequest = z.infer<typeof MessageSearchRequestSchema>;

export const SimilaritySearchRequestSchema = z.object({
  query: z.string(),
  limit: z.number().default(5),
  conversation_id: z.string().optional(),
});

export type SimilaritySearchRequest = z.infer<
  typeof SimilaritySearchRequestSchema
>;

// Response types
export const ConversationResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  status: z.string(),
});

export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
