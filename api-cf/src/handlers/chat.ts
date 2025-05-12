import { OpenAPIRoute } from 'chanfana';
import { z } from 'zod';
import { Context } from 'hono';
import { createOpenAIClient } from '../utils/openai';
import { getUserCredits, deductUserCredits } from '../db';
import { ChatCompletionCreateParamSchema } from '../types/chat';

// CORS headers as specified in the memory
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
};

export class ChatCompletions extends OpenAPIRoute {
  schema = {
    request: {
      body: {
        content: {
          'application/json': {
            schema: ChatCompletionCreateParamSchema
          }
        }
      }
    },
    responses: {
      '200': {
        description: 'Chat completion response',
        content: {
          'application/json': {
            schema: z.object({}).passthrough()
          }
        }
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
                code: z.string()
              })
            })
          }
        }
      }
    }
  };

  async handle(c: Context) {
    try {
      const env = c.env;
      const userId = c.get('userId');
      const params = await c.req.json();
      
      // Get user credits
      const credits = await getUserCredits(env, userId);
      
      // Check if user has enough credits (assuming 0.01 credits per request for simplicity)
      const requiredCredits = 0.01;
      if (credits < requiredCredits) {
        return c.json({
          error: {
            message: 'Insufficient credits. Please add more credits to your account.',
            type: 'insufficient_credits',
            param: null,
            code: 'insufficient_credits'
          }
        }, 402, corsHeaders);
      }
      
      // Create OpenAI client
      // Note: In a real implementation, you'd get the API key from a secure source
      // or use a service like OpenRouter
      const openAIKey = env.OPENAI_API_KEY || 'demo-key';
      const client = createOpenAIClient(openAIKey);
      
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
              `data: ${JSON.stringify({ error: { message: 'Stream error', type: 'server_error' } })}\n\n`
            );
            await writer.write(errorMsg);
          } finally {
            writer.close();
            reader.releaseLock();
          }
        })();
        
        // Deduct credits in the background
        // In a real implementation, you'd want to track token usage and charge accordingly
        deductUserCredits(env, userId, requiredCredits, undefined, params.model);
        
        // Return the streaming response with proper headers
        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            ...corsHeaders
          }
        });
      } else {
        // Handle non-streaming response
        const response = await client.createChatCompletion(params);
        const result = await response.json();
        
        // Deduct credits
        await deductUserCredits(env, userId, requiredCredits, undefined, params.model);
        
        // Return the response with CORS headers
        return c.json(result as Record<string, unknown>, 200, corsHeaders);
      }
    } catch (error) {
      console.error('Error in chat completion:', error);
      
      return c.json({
        error: {
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          type: 'server_error',
          param: null,
          code: 'server_error'
        }
      }, 500, corsHeaders);
    }
  }
}

// Handle OPTIONS requests for CORS preflight
export async function handleChatCompletionsOptions(_c: Context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
