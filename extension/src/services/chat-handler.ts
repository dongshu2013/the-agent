import { env } from "~/utils/env";
import { ChatMessage, Message } from "../types/messages";
import { saveMessageApi, sendChatCompletion } from "./chat";
import { toolExecutor } from "./tool-executor";
import { db } from "~/utils/db";

interface ChatHandlerOptions {
  apiKey: string;
  currentConversationId: string;
  onError: (error: any) => void;
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

    const userMessage: Message = {
      message_id: userMessageId,
      role: "user",
      content: currentPrompt,
      created_at: baseTimestamp.toISOString(),
      conversation_id: this.options.currentConversationId,
      status: "completed",
    };

    const loadingMessage: Message = {
      message_id: assistantMessageId,
      role: "assistant",
      content: "",
      created_at: new Date(baseTimestamp.getTime() + 1).toISOString(),
      conversation_id: this.options.currentConversationId,
      status: "pending",
      isLoading: true,
      ...(env.OPENAI_MODEL === "deepseek-chat"
        ? { tool_calls: [], tool_call_id: "" }
        : { toolCalls: [], toolCallId: "" }),
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
          if (msg.toolCalls) {
            msg.toolCalls.forEach((toolCall) => {
              // html size too loong ,so we not add it to the prompt
              newPrompt += `Tool calls: ${toolCall.function.name}, executed result: ${JSON.stringify(toolCall?.result?.data || "")} \n`;
            });
          }
        });
      }
      if (recentMessages.length > 0) {
        newPrompt += `Recent messages:\n`;
        recentMessages.forEach((msg) => {
          newPrompt += `${msg.role}: ${msg.content}\n`;
          if (msg.toolCalls) {
            msg.toolCalls.forEach((toolCall) => {
              newPrompt += `Tool calls: ${toolCall.function.name}, executed result: ${JSON.stringify(toolCall?.result?.data || "")} \n`;
            });
          }
        });
      }
      if (newPrompt.length > 0) {
        newPrompt = `
       You are an AI agent that can use tools and has memory of prior interactions. if the user request is request don't care about the memory, just do it.
Please do the following:
1. Carefully read the \`user request\`.
2. Then, check the \`memory\` to see if the same request or tool call has already been handled.
3. If the memory shows the tool call has already been completed, **do not repeat it**, unless the user explicitly requests a re-run.
4. Only call tools if it is a **new request** that is not already handled in memory.

---

user request:
${currentPrompt}

---

memory (executed actions and prior responses):
${newPrompt}
        `;
      }

      let toolCallCount = 0;
      const MAX_TOOL_CALLS = 20;

      const processRequest = async (inputMessages: ChatMessage[]) => {
        let accumulatedContent = "";
        try {
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
                console.log("🔥 toolCall:", toolCall.function);
                const toolResult = await toolExecutor.executeToolCall(toolCall);
                console.log("🔥Tool call🌹 result:", toolResult);

                const toolCallInfo = `<div style="border: 1px solid #ccc; border-radius: 6px; padding: 6px 8px; margin: 4px 0; font-size: 12px; line-height: 1.4; margin-bottom: 16px; display: flex; align-items: center;"><svg style="margin-right: 6px;" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/></svg>Executed tool call <span style="display: inline-block; background-color: #f7f7f7; color: #999; border: 1px solid #ccc; padding: 1px 6px; border-radius: 4px; margin-left: 6px; font-size: 11px;">${toolCall.function.name.replace("TabToolkit_", "")}</span></div>`;
                accumulatedContent += toolCallInfo;

                if (!loadingMessage.toolCalls) {
                  loadingMessage.toolCalls = [];
                }
                if (!loadingMessage.tool_calls) {
                  loadingMessage.tool_calls = [];
                }

                if (env.OPENAI_MODEL === "deepseek-chat") {
                  loadingMessage.tool_calls.push({
                    id: toolCall.id,
                    type: toolCall.type,
                    function: toolCall.function,
                    result: toolResult,
                  });
                  inputMessages.push({
                    role: "tool",
                    name: toolCall.function.name,
                    content: `Function call ${toolCall.function.name}: ${toolResult.success} ${JSON.stringify(toolResult.data)}`,
                    tool_call_id: toolCall.id,
                  });
                } else {
                  loadingMessage.toolCalls.push({
                    id: toolCall.id,
                    type: toolCall.type,
                    function: toolCall.function,
                    result: toolResult,
                  });
                  inputMessages.push({
                    role: "tool",
                    name: toolCall.function.name,
                    content: `Function call ${toolCall.function.name}: ${toolResult.success} ${JSON.stringify(toolResult.data)}`,
                    toolCallId: toolCall.id,
                  });
                }
              }
            } else {
              break;
            }
          }
          return accumulatedContent;
        } catch (error: any) {
          console.error("Error in processRequest:", error);
          if (error.name === "AbortError") {
            await this.updateMessage({
              ...loadingMessage,
              status: "error",
              content: accumulatedContent + `\n\nStream aborted. `,
              error: "Stream aborted",
              isLoading: false,
              role: "system",
            });
          } else {
            this.options.onError(error);
            await this.updateMessage({
              ...loadingMessage,
              status: "error",
              content:
                accumulatedContent +
                `\n\nNetwork error, please try again later.`,
              error: error.message,
              isLoading: false,
              role: "system",
            });
          }
          return accumulatedContent;
        }
      };

      let finalContent = await processRequest([
        {
          role: "user",
          content: newPrompt,
        },
      ]);

      const aiMessage: Message = {
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
      this.options.onError(error);
      await this.updateMessage({
        ...loadingMessage,
        status: "error",
        content: `Network error, please try again later.`,
        error: error.message,
        isLoading: false,
        role: "system",
      });
    } finally {
      this.stopStreaming();
    }
  }

  private async updateMessage(message: Message) {
    await db.saveMessage(message);
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
