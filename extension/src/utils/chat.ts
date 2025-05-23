import OpenAI from 'openai';
import { env } from './env';
import { getApiKey } from '../services/cache';
import { ChatRequest } from '../types/api';
import { getToolDescriptions } from '../tools/tool-descriptions';
import { showLoginModal } from '~/utils/global-event';
import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream.mjs';
import { Message, SaveMessageResponse, ToolCall } from '@the-agent/shared';
import { APIClient, APIError } from '@the-agent/shared';
import { DEFAULT_MODEL } from './constants';
import { Conversation } from '~/types/conversations';

export const sendChatCompletion = async (
  request: ChatRequest,
  options: { stream?: boolean; signal?: AbortSignal } = {}
): Promise<ChatCompletionStream> => {
  try {
    const client = new OpenAI({
      apiKey: request.model?.apiKey,
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
        model: request.model?.id === 'system' ? DEFAULT_MODEL : request.model?.name || '',
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

export const saveMessageApi = async ({
  message,
  top_k_related = 3,
}: {
  message: Message;
  top_k_related?: number;
}): Promise<SaveMessageResponse> => {
  try {
    const apiKey = await getApiKey();
    if (!apiKey?.enabled) {
      throw new APIError('Unauthorized', 401);
    }

    const client = new APIClient({
      baseUrl: env.BACKEND_URL,
      apiKey: apiKey.key,
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

export const sortConversations = (conversations: Conversation[]) => {
  const getTimestamp = (conversation: Conversation) => {
    if (conversation.last_selected_at) {
      return conversation.last_selected_at;
    }
    const messages = conversation.messages || [];
    if (messages.length > 0) {
      return messages[messages.length - 1].id;
    }
    return conversation.id;
  };
  return conversations.sort((a, b) => {
    const aTimestamp = getTimestamp(a);
    const bTimestamp = getTimestamp(b);
    return bTimestamp - aTimestamp;
  });
};
