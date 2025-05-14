import { z } from 'zod';

// Tool call related types
const ToolCallFunctionSchema = z.object({
  name: z.string(),
  arguments: z.string(),
});

export const ToolCallSchema = z.object({
  function: ToolCallFunctionSchema,
  id: z.string(),
  type: z.string().optional(),
  result: z.string().optional(),
});

// Chat message types
export const ChatMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  tool_call_id: z.string().optional(),
  tool_calls: z.array(ToolCallSchema).optional(),
  name: z.string().optional(),
});

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
