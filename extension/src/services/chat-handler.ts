import {
  genToolCallResult,
  genUserPrompt,
  saveMessageApi,
  sendChatCompletion,
} from '../utils/chat';
import { toolExecutor } from './tool-executor';
import { db } from '~/utils/db';
import { ChatMessage, Message, ToolCall } from '@the-agent/shared';
import { MAX_TOOL_CALLS, SYSTEM_MESSAGE } from '~/utils/constants';
import { ApiKey, ChatStatus, Model } from '~/types';

interface ChatHandlerOptions {
  apiKey: ApiKey | null;
  currentConversationId: number;
  onStatusChange: (status: ChatStatus) => void;
  onError: (error: unknown) => void;
  onMessageUpdate: (message: Message) => void;
}

export class ChatHandler {
  private options: ChatHandlerOptions;
  private abortController: AbortController | null = null;

  constructor(options: ChatHandlerOptions) {
    this.options = options;
  }

  async handleSubmit(prompt: string) {
    if (!prompt || !this.options.apiKey?.enabled || !this.options.currentConversationId) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      conversation_id: this.options.currentConversationId,
    };

    this.abortController = new AbortController();
    this.options.onStatusChange('waiting');

    await db.saveMessages([userMessage]);

    try {
      const saveResponse = await saveMessageApi({
        message: userMessage,
        top_k_related: 3,
      });

      const relatedMessages = await db.getRelatedMessagesWithContext(
        saveResponse.top_k_message_ids || [],
        this.options.currentConversationId
      );
      const recentMessages = await db.getRecentMessages(this.options.currentConversationId, 10);

      let contextPrompt = '';
      if (relatedMessages.length > 0) {
        contextPrompt += 'Related messages:\n';
        relatedMessages.forEach(msg => {
          contextPrompt += `${msg.role}: ${msg.content}\n`;
          if (msg.tool_calls) {
            msg.tool_calls.forEach((toolCall: ToolCall) => {
              if (toolCall.function.name !== 'WebToolkit_getPageText') {
                contextPrompt += genToolCallResult(toolCall);
              }
            });
          }
        });
      }
      if (recentMessages.length > 0) {
        contextPrompt += 'Recent messages:\n';
        recentMessages.forEach(msg => {
          contextPrompt += `${msg.role}: ${msg.content}\n`;
          if (msg.tool_calls) {
            msg.tool_calls.forEach((toolCall: ToolCall) => {
              if (toolCall.function.name !== 'WebToolkit_getPageText') {
                contextPrompt += genToolCallResult(toolCall);
              }
            });
          }
        });
      }

      const model = await db.getSelectModel();
      const uMessageToSent: ChatMessage = {
        role: 'user',
        content: genUserPrompt(contextPrompt, prompt),
      };
      await this.processRequest(model, [uMessageToSent]);
    } catch (error: unknown) {
      this.options.onError(error);
    } finally {
      this.abort();
    }
  }

  private async processRequest(model: Model, inputMessages: ChatMessage[]) {
    let toolCallCount = 0;
    while (this.abortController?.signal.aborted === false) {
      this.options.onStatusChange('waiting');
      const stream = await sendChatCompletion(
        {
          messages: [SYSTEM_MESSAGE, ...inputMessages],
          model,
        },
        {
          signal: this.abortController?.signal,
        }
      );

      const message: Message = {
        id: Date.now(),
        conversation_id: this.options.currentConversationId,
        role: 'assistant',
        content: '',
        reasoning: '',
      };
      for await (const chunk of stream) {
        if (this.abortController?.signal.aborted) {
          break;
        }
        const delta = chunk.choices[0]?.delta as { reasoning?: string; content?: string };
        if (delta) {
          this.options.onStatusChange('streaming');
          message.reasoning += delta.reasoning || '';
          message.content += delta.content || '';
          if (delta.content || delta.reasoning) {
            await this.updateMessage(message);
          }
        }
      }
      this.options.onStatusChange('waiting');

      const resp = await stream.finalChatCompletion();
      message.token_usage = resp.usage;
      message.tool_calls = resp.choices[0].message.tool_calls;
      toolCallCount += message.tool_calls?.length || 0;
      if (toolCallCount >= MAX_TOOL_CALLS) {
        message.content +=
          '\n\n' + 'We are hitting the limit of tool calls. Let me know if you want to continue.';
      }
      await this.updateMessage(message);
      await saveMessageApi({ message });
      inputMessages.push(message);

      if (!message.tool_calls || toolCallCount >= MAX_TOOL_CALLS) {
        break;
      }

      for (const toolCall of message.tool_calls) {
        if (this.abortController?.signal.aborted) {
          break;
        }
        const toolMessage: Message = {
          id: Date.now(),
          conversation_id: this.options.currentConversationId,
          role: 'tool',
          name: toolCall.function.name,
          tool_call_id: toolCall.id,
          tool_calls: [toolCall],
        };
        this.options.onStatusChange('calling_tool');
        await this.updateMessage(toolMessage);

        const toolResult = await toolExecutor.executeToolCall(toolCall);
        toolCall.result = toolResult;
        toolMessage.content = JSON.stringify(toolResult);
        await this.updateMessage(toolMessage);
        this.options.onStatusChange('waiting');
        await saveMessageApi({ message: toolMessage });
        inputMessages.push(toolMessage);
      }
    }
  }

  private async updateMessage(message: Message) {
    this.options.onMessageUpdate(message);
  }

  abort() {
    if (this.abortController && !this.abortController.signal.aborted) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.options.onStatusChange('idle');
  }
}
