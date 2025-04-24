import { ChatMessage, Message as MessageType } from "../types/messages";
import { saveMessageApi, sendChatCompletion } from "./chat";
import { toolExecutor } from "./tool-executor";
import { db } from "~/utils/db";
import { env } from "~/utils/env";

interface ChatHandlerOptions {
  apiKey: string;
  currentConversationId: string;
  onError: (error: any) => void;
  onStreamStart: () => void;
  onStreamEnd: () => void;
  onMessageUpdate: (message: MessageType) => void;
}

export class ChatHandler {
  private options: ChatHandlerOptions;
  private abortController: AbortController | null = null;
  private isStreaming = false;

  constructor(options: ChatHandlerOptions) {
    this.options = options;
  }

  async handleSubmit(prompt: string) {
    if (
      !prompt.trim() ||
      !this.options.apiKey ||
      !this.options.currentConversationId
    ) {
      return;
    }

    const currentPrompt = prompt.trim();
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const baseTimestamp = new Date();
    let finalContent = ``;

    const userMessage: MessageType = {
      message_id: userMessageId,
      role: "user",
      content: currentPrompt,
      created_at: baseTimestamp.toISOString(),
      conversation_id: this.options.currentConversationId,
      status: "completed",
    };

    const loadingMessage: MessageType = {
      message_id: assistantMessageId,
      role: "assistant",
      content: "",
      created_at: new Date(baseTimestamp.getTime() + 1).toISOString(),
      conversation_id: this.options.currentConversationId,
      status: "pending",
      isLoading: true,
    };

    this.isStreaming = true;
    this.abortController = new AbortController();
    this.options.onStreamStart();

    await db.saveMessages([userMessage, loadingMessage]);

    try {
      const saveResponse = await saveMessageApi({
        conversation_id: this.options.currentConversationId,
        message: userMessage,
        top_k_related: 3,
      });

      if (!saveResponse.success) {
        throw new Error(saveResponse.error || "Failed to save message");
      }

      const relatedMessages = await db.getRelatedMessagesWithContext(
        saveResponse.data?.top_k_messages || [],
        this.options.currentConversationId
      );
      const recentMessages = await db.getRecentMessages(
        this.options.currentConversationId,
        10
      );

      let newPrompt = ``;
      if (relatedMessages.length > 0) {
        newPrompt += `Related messages:\n`;
        relatedMessages.forEach((msg) => {
          newPrompt += `${msg.role}: ${msg.content}\n`;
        });
      }
      if (recentMessages.length > 0) {
        newPrompt += `Recent messages:\n`;
        recentMessages.forEach((msg) => {
          newPrompt += `${msg.role}: ${msg.content}\n`;
        });
      }
      if (newPrompt.length > 0) {
        newPrompt = `
        Please follow the user's request and if the user's request is related to the memory, use the memory to help you answer the question.
        User Request: ${currentPrompt}\n
        Memory: ${newPrompt}
        `;
      }

      let toolCallCount = 0;
      const MAX_TOOL_CALLS = 10;
      const MAX_CONTENT_LENGTH = 10000; // 限制内容长度

      const processRequest = async (inputMessages: ChatMessage[]) => {
        let accumulatedContent = "";
        while (true) {
          if (!this.isStreaming) break;

          const stream = await sendChatCompletion(
            { messages: inputMessages },
            this.options.apiKey,
            {
              signal: this.abortController?.signal,
            }
          );

          let currentResponse = "";
          for await (const chunk of stream) {
            if (!this.isStreaming) break;

            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              currentResponse += content;
              // 检查内容长度
              if (
                accumulatedContent.length + currentResponse.length >
                MAX_CONTENT_LENGTH
              ) {
                // 询问用户是否继续
                const shouldContinue = await this.askUserToContinue();
                if (!shouldContinue) {
                  this.stopStreaming();
                  break;
                }
                accumulatedContent = "";
                currentResponse = "";
              }

              await this.updateMessage({
                ...loadingMessage,
                content: accumulatedContent + currentResponse,
              });
            }
          }

          const resp = await stream.finalChatCompletion();
          accumulatedContent += currentResponse;
          inputMessages.push(resp.choices[0].message);

          const toolCalls = resp.choices[0].message.tool_calls;
          if (toolCalls) {
            if (toolCallCount >= MAX_TOOL_CALLS) {
              await this.updateMessage({
                ...loadingMessage,
                content: accumulatedContent,
                isLoading: true,
              });
              return accumulatedContent;
            }

            toolCallCount += toolCalls.length;
            for (const toolCall of toolCalls) {
              const toolResult = await toolExecutor.executeToolCall(toolCall);
              const resultStr = JSON.stringify(toolResult, null, 2);
              const toolCallInfo = `Recived request to execute tool call: \n<div style="background-color: #f0f0f0; padding: 8px; border-radius: 8px; margin: 4px 0; font-size: 14px; line-height: 1.6;margin-bottom: 20px;"> >>> Executing tool call: ${toolCall.function.name.replace("TabToolkit_", "")}</div>`;
              accumulatedContent += toolCallInfo;

              await this.updateMessage({
                ...loadingMessage,
                content: accumulatedContent,
                toolCalls: [
                  ...(loadingMessage.toolCalls || []),
                  {
                    id: toolCall.id,
                    type: toolCall.type,
                    function: toolCall.function,
                  },
                ],
              });

              inputMessages.push({
                role: "tool",
                name: toolCall.function.name,
                content: `Function call success: ${resultStr}`,
                ...(env.OPENAI_MODEL === "google/gemini-2.5-pro-preview-03-25"
                  ? { toolCallId: toolCall.id }
                  : {
                      tool_call_id: toolCall.id,
                      tool_calls: [
                        {
                          id: toolCall.id,
                          type: toolCall.type,
                          function: toolCall.function,
                        },
                      ],
                    }),
              });
            }
          } else {
            break;
          }
        }
        return accumulatedContent;
      };

      let finalContent = await processRequest([
        {
          role: "user",
          content: newPrompt,
        },
      ]);

      const aiMessage: MessageType = {
        ...loadingMessage,
        content: finalContent,
        status: "completed",
        isLoading: false,
      };

      await this.updateMessage(aiMessage);
      await saveMessageApi({
        conversation_id: this.options.currentConversationId,
        message: aiMessage,
      });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      if (error.name === "AbortError") {
        console.warn("Stream aborted.");
        await this.updateMessage({
          ...loadingMessage,
          status: "error",
          content: `${finalContent}\nStream aborted. `,
          error: "Stream aborted",
          isLoading: false,
          role: "system",
        });
      } else {
        console.error("Chat Error:", error);
        this.options.onError(error);
        await this.updateMessage({
          ...loadingMessage,
          status: "error",
          content: `${error.message}`,
          error: error.message,
          isLoading: false,
          role: "system",
        });
      }
    } finally {
      this.stopStreaming();
    }
  }

  private async updateMessage(message: MessageType) {
    await db.saveMessage(message);
    this.options.onMessageUpdate(message);
  }

  private async askUserToContinue(): Promise<boolean> {
    // TODO: 实现用户确认对话框
    // 这里可以添加一个对话框组件来询问用户是否继续
    return window.confirm("内容较长，是否继续？");
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
