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
    const baseTimestamp = new Date();
    let messageIdOffset = 0;

    const generateMessageId = () => baseTimestamp.getTime() + messageIdOffset++;

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: currentPrompt,
      conversation_id: this.options.currentConversationId,
    };

    const loadingMessage: Message = {
      id: generateMessageId(),
      role: "assistant",
      content: "",
      conversation_id: this.options.currentConversationId,
      status: "pending",
      isLoading: true,
      tool_calls: [],
      tool_call_id: "",
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

      const systemMessage: ChatMessage = {
        role: "system",
        content: `
You are "Manny", a chatty digital agent with a secret: you can control browsers.
You pretend to be a friendly chatbot, but you actually have full control of a browser.  
You can click buttons, search the web, type into fields, and complete complex user tasks on the internet.

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
`,
      };

      let toolCallCount = 0;
      const MAX_TOOL_CALLS = 20;

      const currentModel = await db.getSelectModel();

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
              {
                messages: [systemMessage, ...inputMessages],
                currentModel,
              },
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
                return {
                  content: accumulatedContent,
                  tokenUsage: totalTokenUsage,
                };
              }

              toolCallCount += toolCalls.length;

              console.log("🔥 toolCalls:🍷", toolCalls);

              // 添加助手消息到输入消息列表
              const assistantMessage: Message = {
                role: "assistant",
                content: currentResponse,
                id: generateMessageId(),
                conversation_id: this.options.currentConversationId,
                tool_calls: toolCalls,
              };

              await this.updateMessage({
                ...assistantMessage,
                status: "completed",
                isLoading: false,
              });
              await saveMessageApi({
                conversation_id: this.options.currentConversationId,
                message: assistantMessage,
              });

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

                // 创建工具调用消息
                const toolMessageId = generateMessageId();
                const toolMessage: Message = {
                  id: toolMessageId,
                  role: "tool",
                  name: toolCall.function.name,
                  content: `I will ${simplifiedName}.\n`,
                  conversation_id: this.options.currentConversationId,
                  tool_call_id: toolCall.id,
                  tool_calls: [
                    {
                      ...toolCall,
                      result: toolResult.data,
                    },
                  ],
                };

                await this.updateMessage({
                  ...toolMessage,
                  status: "completed",
                  isLoading: false,
                });

                await saveMessageApi({
                  conversation_id: this.options.currentConversationId,
                  message: toolMessage,
                });

                inputMessages.push({
                  role: "tool",
                  name: toolCall.function.name,
                  content:
                    toolCall.function.name === "WebToolkit_screenshot"
                      ? `${toolResult.success ? "success" : "failed"}`
                      : `${toolResult.success ? "success" : "failed"} ${JSON.stringify(toolResult.data)}`,
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
              status: "completed",
              content:
                accumulatedContent +
                `${accumulatedContent ? "\n\n" : ""}Stream aborted.`,
              error: "Stream aborted",
              isLoading: false,
              role: "system",
              tokenUsage: totalTokenUsage,
            });
          } else {
            this.options.onError(error);
            await this.updateMessage({
              ...loadingMessage,
              status: "completed",
              content:
                accumulatedContent +
                `${accumulatedContent ? "\n\n" : ""}Network error, please try again later.`,
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
          content: `Given the chat history:
>>>>> Start of Chat History >>>>>>>>
${contextPrompt}
>>>>>> End of Chat History >>>>>>>>
Now reply to user's message: ${currentPrompt}`,
        },
      ]);

      const aiMessage: Message = {
        ...loadingMessage,
        content: finalContent,
        tokenUsage,
      };
      await this.updateMessage({
        ...aiMessage,
        status: "completed",
        isLoading: false,
      });

      await saveMessageApi({
        conversation_id: this.options.currentConversationId,
        message: aiMessage,
      });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      this.options.onError(error);
      await this.updateMessage({
        ...loadingMessage,
        status: "completed",
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
