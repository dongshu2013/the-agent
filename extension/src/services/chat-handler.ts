import { showLoginModal } from '~/utils/global-event';
import {
  genToolCallResult,
  genUserPrompt,
  saveMessageApi,
  sendChatCompletion,
} from '../utils/chat';
import { toolExecutor } from './tool-executor';
import { db } from '~/utils/db';
import { getApiKey } from './cache';
import { WebInteractionResult } from '~/types/tools';
import { ChatMessage, Message, ToolCall } from '@the-agent/shared';
import { MAX_TOOL_CALLS, SYSTEM_MESSAGE } from '~/utils/constants';

interface ChatHandlerOptions {
  apiKey: string;
  currentConversationId: number;
  onError: (error: unknown) => void;
  onStreamStart: () => void;
  onStreamEnd: () => void;
  onMessageUpdate: (message: Message) => void;
}

export class ChatHandler {
  private options: ChatHandlerOptions;
  private abortController: AbortController | null = null;
  private isStreaming = false;

  constructor(options: ChatHandlerOptions) {
    this.options = options;
  }

  async handleSubmit(prompt: string) {
    if (this.isStreaming) {
      this.stopStreaming();
    }
    if (!prompt.trim() || !this.options.apiKey || !this.options.currentConversationId) {
      return;
    }

    const currentPrompt = prompt.trim();
    const baseTimestamp = new Date();
    let messageIdOffset = 0;

    const generateMessageId = () => baseTimestamp.getTime() + messageIdOffset++;

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: currentPrompt,
      conversation_id: this.options.currentConversationId,
    };

    this.isStreaming = true;
    this.abortController = new AbortController();
    this.options.onStreamStart();

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

      let toolCallCount = 0;

      const currentModel = await db.getSelectModel();
      const apiKey = await getApiKey();
      if (!apiKey) {
        console.error('Invalid api key');
        showLoginModal();
        return;
      }

      const processRequest = async (apiKey: string, inputMessages: ChatMessage[]) => {
        let accumulatedContent = '';
        const totalTokenUsage = {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        };

        try {
          while (true) {
            if (!this.isStreaming) break;

            const stream = await sendChatCompletion(
              apiKey,
              {
                messages: [SYSTEM_MESSAGE, ...inputMessages],
                currentModel,
              },
              {
                signal: this.abortController?.signal,
              }
            );

            let currentResponse = '';
            for await (const chunk of stream) {
              if (!this.isStreaming) break;

              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                currentResponse += content;
              }
            }

            const resp = await stream.finalChatCompletion();
            accumulatedContent = currentResponse;

            if (resp.usage) {
              totalTokenUsage.prompt_tokens += resp.usage.prompt_tokens || 0;
              totalTokenUsage.completion_tokens += resp.usage.completion_tokens || 0;
              totalTokenUsage.total_tokens += resp.usage.total_tokens || 0;
            }

            const toolCalls = resp.choices[0].message.tool_calls;
            if (toolCalls) {
              if (toolCallCount >= MAX_TOOL_CALLS) {
                return {
                  content: accumulatedContent,
                  tokenUsage: totalTokenUsage,
                };
              }

              toolCallCount += toolCalls.length;

              const assistantMessage: Message = {
                role: 'assistant',
                content: currentResponse,
                id: generateMessageId(),
                conversation_id: this.options.currentConversationId,
                tool_calls: toolCalls,
              };

              await this.updateMessage(assistantMessage);
              await saveMessageApi({
                message: assistantMessage,
              });

              inputMessages.push({
                role: 'assistant',
                content: currentResponse,
                tool_calls: toolCalls,
              });

              for (const toolCall of toolCalls) {
                const toolResult = await toolExecutor.executeToolCall(toolCall);
                const simplifiedName = toolCall.function.name
                  .replace('TabToolkit_', '')
                  .replace('WebToolkit_', '');

                const toolMessageId = generateMessageId();
                const toolMessage: Message = {
                  id: toolMessageId,
                  role: 'tool',
                  name: toolCall.function.name,
                  content: `I will ${simplifiedName}.\n`,
                  conversation_id: this.options.currentConversationId,
                  tool_call_id: toolCall.id,
                  tool_calls: [
                    {
                      ...toolCall,
                      result: toolResult as WebInteractionResult<unknown>,
                    },
                  ],
                };

                await this.updateMessage(toolMessage);

                await saveMessageApi({
                  message: toolMessage,
                });

                inputMessages.push({
                  role: 'tool',
                  name: toolCall.function.name,
                  content:
                    toolCall.function.name === 'WebToolkit_screenshot'
                      ? `${toolResult.success ? 'success' : 'failed'}`
                      : `${JSON.stringify(toolResult.data)}`,
                  tool_call_id: toolCall.id,
                });
              }
            } else {
              break;
            }
          }
          return { content: accumulatedContent, tokenUsage: totalTokenUsage };
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            await this.updateMessage({
              ...userMessage,
              content: accumulatedContent + `${accumulatedContent ? '\n\n' : ''}Stream aborted.`,
              token_usage: totalTokenUsage,
            });
          } else {
            const message =
              error instanceof Error ? error.message : 'Network error, please try again later.';
            this.options.onError(error);
            await this.updateMessage({
              id: generateMessageId(),
              role: 'error',
              content: message,
              conversation_id: this.options.currentConversationId,
            });
          }
          return { content: accumulatedContent, tokenUsage: totalTokenUsage };
        }
      };

      const { content: finalContent, tokenUsage } = await processRequest(apiKey, [
        {
          role: 'user',
          content: genUserPrompt(contextPrompt, currentPrompt),
        },
      ]);

      const aiMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: finalContent,
        conversation_id: this.options.currentConversationId,
        token_usage: tokenUsage,
      };
      await this.updateMessage(aiMessage);

      await saveMessageApi({
        message: aiMessage,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Network error, please try again later.';
      this.options.onError(error);
      await this.updateMessage({
        id: generateMessageId(),
        role: 'error',
        content: message,
        conversation_id: this.options.currentConversationId,
      });
    } finally {
      this.stopStreaming();
    }
  }

  private async updateMessage(message: Message) {
    this.options.onMessageUpdate(message);
  }

  stopStreaming() {
    this.isStreaming = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.options.onStreamEnd();
  }
}
