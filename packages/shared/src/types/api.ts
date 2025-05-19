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
