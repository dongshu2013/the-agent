import { ChatMessageSchema } from '@the-agent/shared';
import { z } from 'zod';

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
