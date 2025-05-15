import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { createOpenAIClient } from '../utils/openai';
import { getUserBalance, deductUserCredits } from '../d1/user';
import { ChatCompletionCreateParamSchema } from '../types/chat';
import {
  calculateCredits,
  createStreamingTokenTracker,
} from '../utils/creditCalculator';

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
            schema: z.object({}).passthrough(),
          },
        },
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: z.object({
              error: z.object({
                message: z.string(),
                type: z.string(),
                param: z.string().nullable(),
                code: z.string(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: Context) {
    const env = c.env;
    const userId = c.get('userId');
    const params = await c.req.json();

    // Get user credits
    const credits = await getUserBalance(env, userId);

    // Set minimum required credits (we'll do proper calculation after the response)
    const MIN_REQUIRED_CREDITS = 0.01;
    if (credits < MIN_REQUIRED_CREDITS) {
      return c.json(
        {
          error: {
            message:
              'Insufficient credits. Please add more credits to your account.',
            type: 'insufficient_credits',
            param: null,
            code: 'insufficient_credits',
          },
        },
        402
      );
    }

    // Create OpenAI client
    const llmApiKey = env.LLM_API_KEY;
    const llmApiUrl = env.LLM_API_URL;
    const client = createOpenAIClient(llmApiKey, llmApiUrl);

    // Handle streaming response
    if (params.stream) {
      const stream = await client.streamChatCompletion(params);
      const tokenTracker = createStreamingTokenTracker();

      // Create a TransformStream to handle the streaming response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Process the stream
      (async () => {
        const reader = stream.body?.getReader();
        if (!reader) {
          writer.close();
          return;
        }

        let lastChunk = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              // Before sending [DONE], try to parse the last chunk for token usage
              try {
                const lastData = JSON.parse(lastChunk.slice(6));
                if (lastData.usage) {
                  tokenTracker.setPromptTokens(
                    lastData.usage.prompt_tokens || 0
                  );
                  tokenTracker.setCompletionTokens(
                    lastData.usage.completion_tokens || 0
                  );
                }
              } catch (e) {
                // Ignore parse errors for the last chunk
              }

              // Send the [DONE] marker
              const doneMsg = new TextEncoder().encode('data: [DONE]\n\n');
              await writer.write(doneMsg);
              break;
            }

            // Parse the chunk and track token usage
            const text = new TextDecoder().decode(value);
            lastChunk = ''; // Reset last chunk
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                lastChunk = line; // Store the last data line
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.usage) {
                    tokenTracker.setPromptTokens(data.usage.prompt_tokens || 0);
                    tokenTracker.setCompletionTokens(
                      data.usage.completion_tokens || 0
                    );
                  }
                } catch (e) {
                  // Ignore parse errors for non-JSON lines
                }
              }
            }

            // Forward the chunk
            await writer.write(value);
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorMsg = new TextEncoder().encode(
            `data: ${JSON.stringify({
              error: { message: 'Stream error', type: 'server_error' },
            })}\n\n`
          );
          await writer.write(errorMsg);
        } finally {
          // Get final token usage from the last response
          const finalResponse = await client.getFinalTokenUsage(params);
          if (finalResponse && finalResponse.usage) {
            tokenTracker.setPromptTokens(
              finalResponse.usage.prompt_tokens || 0
            );
            tokenTracker.setCompletionTokens(
              finalResponse.usage.completion_tokens || 0
            );
          }

          // Calculate and deduct credits based on actual token usage
          const tokenUsage = tokenTracker.getTokenUsage();
          const { cost, tokenUsage: usage } = calculateCredits(
            params.model,
            tokenUsage
          );
          console.log(`Credit usage for ${userId}:`, {
            model: params.model,
            tokenUsage: usage,
            cost,
          });

          await deductUserCredits(env, userId, cost.totalCost, params.model);
          writer.close();
          reader.releaseLock();
        }
      })();

      // Return the streaming response with proper headers
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } else {
      // Handle non-streaming response
      const response = await client.createChatCompletion(params);
      const result = (await response.json()) as {
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
        };
      } & Record<string, unknown>;

      // Calculate credits based on token usage from the response
      const tokenUsage = {
        promptTokens: result.usage?.prompt_tokens || 0,
        completionTokens: result.usage?.completion_tokens || 0,
      };

      const { cost, tokenUsage: usage } = calculateCredits(
        params.model,
        tokenUsage
      );
      console.log(`Credit usage for ${userId}:`, {
        model: params.model,
        tokenUsage: usage,
        cost,
      });

      // Deduct credits
      await deductUserCredits(env, userId, cost.totalCost, params.model);

      // Return the response
      return c.json(result as Record<string, unknown>, 200);
    }
  }
}

// Handle OPTIONS requests for CORS preflight
export async function handleChatCompletionsOptions(_c: Context) {
  return new Response(null, {
    status: 204,
  });
}
