/**
 * 聊天服务 - 处理消息和聊天功能
 */

import OpenAI from 'openai';
import { env } from './env';
import { getApiKey } from '../services/cache';
import { ChatRequest } from '../types/api';
import { getToolDescriptions } from '../tools/tool-descriptions';
import { showLoginModal } from '~/utils/global-event';
import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream.mjs';
import { Message, SaveMessageResponse, ToolCall } from '@the-agent/shared';
import { APIClient, APIError } from '@the-agent/shared';

export const sendChatCompletion = async (
  apiKey: string,
  request: ChatRequest,
  options: { stream?: boolean; signal?: AbortSignal } = {}
): Promise<ChatCompletionStream> => {
  try {
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: env.BACKEND_URL + '/v1',
      dangerouslyAllowBrowser: true,
    });

    // get tool descriptions
    const tools = getToolDescriptions().map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));

    return client.beta.chat.completions.stream(
      {
        model:
          request.currentModel?.id === 'system'
            ? env.DEFAULT_MODEL
            : request.currentModel?.name || '',
        messages: request.messages as OpenAI.Chat.ChatCompletionMessageParam[],
        tools: tools,
        tool_choice: 'auto',
      },
      {
        signal: options.signal,
      }
    );
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'Failed to send chat request');
  }
};

/**
 * Save message to backend
 */
export const saveMessageApi = async ({
  message,
  top_k_related = 3,
}: {
  message: Message;
  top_k_related?: number;
}): Promise<SaveMessageResponse> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new APIError('Unauthorized', 401);
    }

    const client = new APIClient({
      baseUrl: env.BACKEND_URL,
      apiKey,
    });
    const response = await client.saveMessage({
      message,
      top_k_related,
      threshold: 0.7, // Default threshold
    });

    return response;
  } catch (error) {
    if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
      showLoginModal();
    }
    throw error;
  }
};

export const genUserPrompt = (contextPrompt: string, currentPrompt: string) => {
  return `
Given the chat history:
>>>>> Start of Chat History >>>>>>>>
${contextPrompt}
>>>>>> End of Chat History >>>>>>>>
Now reply to user's message: ${currentPrompt}`;
};

export const genToolCallResult = (toolCall: ToolCall): string => {
  return (
    `Tool calls: ${toolCall.function.name}, ` +
    `executed result: ${JSON.stringify(toolCall?.result?.data || '')} \n`
  );
};
