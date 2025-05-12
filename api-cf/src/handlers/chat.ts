import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { createOpenAIClient } from '../utils/openai';
import { getUserBalance, deductUserCredits } from '../d1/user';
import { ChatCompletionCreateParamSchema } from '../types/chat';
import { DEFAULT_MODEL } from '../utils/common';

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
    try {
      const env = c.env;
      const userId = c.get('userId');
      const params = await c.req.json();

      // Get user credits
      const credits = await getUserBalance(env, userId);

      // Check if user has enough credits (assuming 0.01 credits per request for simplicity)
      const requiredCredits = 0.01;
      if (credits < requiredCredits) {
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
      // Note: In a real implementation, you'd get the API key from a secure source
      // or use a service like OpenRouter
      const llmApiKey = env.LLM_API_KEY;
      const llmApiUrl = env.LLM_API_URL;
      const client = createOpenAIClient(llmApiKey, llmApiUrl);

      params.model = DEFAULT_MODEL;

      // Handle streaming response
      if (params.stream) {
        const stream = await client.streamChatCompletion(params);

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

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                // Send the [DONE] marker
                const doneMsg = new TextEncoder().encode('data: [DONE]\n\n');
                await writer.write(doneMsg);
                break;
              }

              // Forward the chunk
              await writer.write(value);
            }
          } catch (error) {
            // Handle error
            const errorMsg = new TextEncoder().encode(
              `data: ${JSON.stringify({
                error: { message: 'Stream error', type: 'server_error' },
              })}\n\n`
            );
            await writer.write(errorMsg);
          } finally {
            writer.close();
            reader.releaseLock();
          }
        })();

        // Deduct credits in the background
        // In a real implementation, you'd want to track token usage and charge accordingly
        deductUserCredits(env, userId, requiredCredits, params.model);

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
        const result = await response.json();

        // Deduct credits
        await deductUserCredits(env, userId, requiredCredits, params.model);

        // Return the response
        return c.json(result as Record<string, unknown>, 200);
      }
    } catch (error) {
      console.error('Error in chat completion:', error);

      return c.json(
        {
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'An unknown error occurred',
            type: 'server_error',
            param: null,
            code: 'server_error',
          },
        },
        500
      );
    }
  }
}

// Handle OPTIONS requests for CORS preflight
export async function handleChatCompletionsOptions(_c: Context) {
  return new Response(null, {
    status: 204,
  });
}
