import { OpenAPIRoute } from 'chanfana';
import { Context } from 'hono';
import { createOpenAIClient, OpenAIClient } from '../utils/openai';
import { getUserBalance, deductUserCredits } from '../d1/user';
import {
  ChatCompletionCreateParam,
  ChatCompletionCreateParamSchema,
  ChatCompletionResponseSchema,
  ChatMessage,
  TokenUsage,
} from '@the-agent/shared';
import { calculateCredits } from '../utils/creditCalculator';
import { OPENROUTER_API_URL } from '../utils/common';

const DEFAULT_MODEL = 'deepseek/deepseek-chat-v3-0324';

export class ChatCompletions extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: ChatCompletionCreateParamSchema,
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Chat completion response',
        content: {
          'application/json': {
            schema: ChatCompletionResponseSchema,
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const env = c.env;
    const userId = c.get('userId');
    const credits = await getUserBalance(env, userId);
    if (credits <= 0) {
      return c.json(
        {
          error: {
            message: 'Insufficient credits. Please add more credits to your account.',
            type: 'insufficient_credits',
            param: null,
            code: 'insufficient_credits',
          },
        },
        402
      );
    }

    // Create OpenAI client
    const params = await c.req.json();
    params.model = DEFAULT_MODEL;
    const client = createOpenAIClient(env.OPENROUTER_API_KEY, OPENROUTER_API_URL);

    // Handle streaming response
    if (params.stream) {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const process = processChatCompletionStream(env, userId, client, params, writer);
      c.executionCtx.waitUntil(process);
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      const result = await processChatCompletion(env, userId, client, params);
      return c.json(result as Record<string, unknown>, 200);
    }
  }
}

async function processChatCompletionStream(
  env: Env,
  userId: string,
  client: OpenAIClient,
  params: ChatCompletionCreateParam,
  writer: WritableStreamDefaultWriter<Uint8Array>
) {
  let completedContent = '';
  let tokenUsage: TokenUsage | null = null;
  const processBuffer = (buf: string): string => {
    if (!buf.trim()) {
      return '';
    }
    const lines = buf.split('\n');
    const remainder = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.choices?.[0]?.delta?.content) {
            completedContent += data.choices[0].delta.content;
          }
          tokenUsage = data.usage as TokenUsage;
        } catch {}
      }
    }
    return remainder;
  };

  const stream = await client.streamChatCompletion(params);
  const reader = stream.body?.getReader();
  try {
    if (!reader) {
      writer.close();
      return;
    }

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        processBuffer(buffer);
        break;
      }
      await writer.write(value);
      buffer += new TextDecoder().decode(value);
      buffer = processBuffer(buffer);
    }
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Stream was aborted');
    } else {
      console.error('Stream error:', error);
      const errorMsg = new TextEncoder().encode(
        `data: ${JSON.stringify({
          error: { message: 'Stream error', type: 'server_error' },
        })}\n\n`
      );
      await writer.write(errorMsg);
    }
  } finally {
    try {
      if (!tokenUsage) {
        console.warn('Failed to get token usage, will use estimated token usage');
        tokenUsage = estimateTokenUsage(params.messages, completedContent);
      }
      const { cost } = calculateCredits(params.model, tokenUsage);
      await deductUserCredits(env, userId, cost.totalCostWithMultiplier, params.model);
    } catch (error) {
      console.error('Error deducting credits: ', error);
    }

    try {
      await writer.close();
      reader?.releaseLock();
    } catch (error) {
      console.error('Error closing stream: ', error);
    }
  }
}

async function processChatCompletion(
  env: Env,
  userId: string,
  client: OpenAIClient,
  params: ChatCompletionCreateParam
) {
  const response = await client.createChatCompletion(params);
  const result = (await response.json()) as {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  } & Record<string, unknown>;

  if (!result.usage) {
    console.error('Failed to get token usage: ', result);
    return result;
  }

  const { cost } = calculateCredits(params.model, result.usage);
  await deductUserCredits(env, userId, cost.totalCostWithMultiplier, params.model);
  return result;
}

function estimateTokenUsage(messages: ChatMessage[], completedContent: string): TokenUsage {
  const promptText = messages
    .map(m => {
      const content = m.content;
      if (typeof content === 'string') {
        return content;
      }
      return '';
    })
    .join(' ');
  const estimatedPromptTokens = estimateTokens(promptText);
  const estimatedCompletionTokens = estimateTokens(completedContent);
  return {
    prompt_tokens: estimatedPromptTokens,
    completion_tokens: estimatedCompletionTokens,
    total_tokens: estimatedPromptTokens + estimatedCompletionTokens,
  };
}

function estimateTokens(text: string) {
  const cjkRegex =
    /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/;
  const hasCJK = cjkRegex.test(text);
  const charsPerToken = hasCJK ? 2 : 4;
  return Math.max(1, Math.ceil(text.length / charsPerToken));
}
