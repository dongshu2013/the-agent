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
    if (this.isStreaming) {
      this.stopStreaming();
    }
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

      let contextPrompt = "";
      if (relatedMessages.length > 0) {
        contextPrompt += "Related messages:\n";
        relatedMessages.forEach((msg) => {
          contextPrompt += `${msg.role}: ${msg.content}\n`;
          if (msg.toolCalls) {
            msg.toolCalls.forEach((toolCall) => {
              if (toolCall.function.name !== "WebToolkit_getPageText") {
                contextPrompt += `Tool calls: ${toolCall.function.name}, executed result: ${JSON.stringify(toolCall?.result?.data || "")} \n`;
              }
            });
          }
        });
      }
      if (recentMessages.length > 0) {
        contextPrompt += "Recent messages:\n";
        recentMessages.forEach((msg) => {
          contextPrompt += `${msg.role}: ${msg.content}\n`;
          if (msg.toolCalls) {
            msg.toolCalls.forEach((toolCall) => {
              if (toolCall.function.name !== "WebToolkit_getPageText") {
                contextPrompt += `Tool calls: ${toolCall.function.name}, executed result: ${JSON.stringify(toolCall?.result?.data || "")} \n`;
              }
            });
          }
        });
      }

      console.log("🔥 currentPrompt:", currentPrompt);

      const systemMessage: ChatMessage = {
        role: "system",
        content: `
You are an AI assistant that helps users interact with web pages. You have these tools available:

WebToolkit:
- clickElement: Click buttons, links or any clickable elements
- inputElement: Type text into input fields
- listElements: Find and list elements on the page
- refreshPage: Reload the current page

TabToolkit:
- openTab: Open URL in new tab

WebToolkit:
- clickElement: Click buttons, links or any clickable elements
- inputElement: Type text into input fields
- listElements: Find and list elements on the page
- refreshPage: Reload the current page

TabToolkit:
- openTab: Open URL in new tab
- switchToTab: Switch between tabs

Instructions:
1. Before each action:
   "I will [action]"

2. After each action:
   "Result: [success/fail] - [brief explanation]"

3. If an action fails:
   - Explain why it failed
   - What you'll try next
   - Or suggest alternatives

4. End with:
   "Task status: [completed/failed] - [brief summary]"

Keep responses concise and focused on the current task.

---

Context:
${contextPrompt}
`,
      };

      let toolCallCount = 0;
      const MAX_TOOL_CALLS = 20;

      const processRequest = async (inputMessages: ChatMessage[]) => {
        let accumulatedContent = "";
        let totalTokenUsage = {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        };

        try {
          while (true) {
            if (!this.isStreaming) break;

            const stream = await sendChatCompletion(
              { messages: [systemMessage, ...inputMessages] },
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
              }
            }

            const resp = await stream.finalChatCompletion();
            accumulatedContent = currentResponse;

            if (resp.usage) {
              totalTokenUsage.promptTokens += resp.usage.prompt_tokens || 0;
              totalTokenUsage.completionTokens +=
                resp.usage.completion_tokens || 0;
              totalTokenUsage.totalTokens += resp.usage.total_tokens || 0;
            }

            const toolCalls = resp.choices[0].message.tool_calls;
            if (toolCalls) {
              if (toolCallCount >= MAX_TOOL_CALLS) {
                await this.updateMessage({
                  ...loadingMessage,
                  content: accumulatedContent,
                  isLoading: true,
                });
                return {
                  content: accumulatedContent,
                  tokenUsage: totalTokenUsage,
                };
              }

              toolCallCount += toolCalls.length;

              // 添加助手消息到输入消息列表
              inputMessages.push({
                role: "assistant",
                content: currentResponse,
                tool_calls: toolCalls,
              });

              // 处理每个工具调用
              for (const toolCall of toolCalls) {
                const toolResult = await toolExecutor.executeToolCall(toolCall);
                const simplifiedName = toolCall.function.name
                  .replace("TabToolkit_", "")
                  .replace("WebToolkit_", "");

                // 创建工具调用消息，时间戳递增
                const toolMessageId = crypto.randomUUID();
                const toolMessage: Message = {
                  message_id: toolMessageId,
                  role: "tool",
                  name: toolCall.function.name,
                  content: `I will  ${simplifiedName}.\n`,
                  created_at: new Date(
                    baseTimestamp.getTime() + toolCallCount * 1000
                  ).toISOString(),
                  conversation_id: this.options.currentConversationId,
                  status: "completed",
                  ...(env.OPENAI_MODEL === "deepseek-chat"
                    ? {
                        tool_call_id: toolCall.id,
                        tool_calls: [
                          {
                            id: toolCall.id,
                            type: toolCall.type,
                            function: toolCall.function,
                            result: toolResult,
                          },
                        ],
                      }
                    : {
                        toolCallId: toolCall.id,
                        toolCalls: [
                          {
                            id: toolCall.id,
                            type: toolCall.type,
                            function: toolCall.function,
                            result: toolResult,
                          },
                        ],
                      }),
                };

                await this.updateMessage(toolMessage);
                await saveMessageApi({
                  conversation_id: this.options.currentConversationId,
                  message: toolMessage,
                });

                // 添加工具响应到输入消息列表
                inputMessages.push({
                  role: "tool",
                  name: toolCall.function.name,
                  content: `${toolResult.success ? "success" : "failed"} ${JSON.stringify(toolResult.data)}`,
                  tool_call_id: toolCall.id,
                });
              }
            } else {
              break;
            }
          }
          return { content: accumulatedContent, tokenUsage: totalTokenUsage };
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
              tokenUsage: totalTokenUsage,
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
              tokenUsage: totalTokenUsage,
            });
          }
          return { content: accumulatedContent, tokenUsage: totalTokenUsage };
        }
      };

      const { content: finalContent, tokenUsage } = await processRequest([
        {
          role: "user",
          content: currentPrompt,
        },
      ]);

      // 修改最终 AI 消息的时间戳，确保显示在最后
      const aiMessage: Message = {
        ...loadingMessage,
        content: finalContent,
        status: "completed",
        isLoading: false,
        tokenUsage,
        created_at: new Date(
          baseTimestamp.getTime() + (toolCallCount + 1) * 1000
        ).toISOString(),
      };

      // 在最后添加 token 使用统计
      const tokenSummary = `\n\n---\nToken usage statistics:
- Prompt tokens: ${tokenUsage.promptTokens}
- Completion tokens: ${tokenUsage.completionTokens}
- Total tokens: ${tokenUsage.totalTokens}`;

      aiMessage.content += tokenSummary;

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
