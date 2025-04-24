import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import "../style.css";
import Header from "./components/Header";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import Settings from "./components/Settings";
import ConversationList from "./components/ConversationList";
import { ChatMessage, Message as MessageType } from "../types/messages";
import { saveMessageApi, sendChatCompletion } from "../services/chat";
import {
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  getConversations,
} from "../services/conversation";
import { Storage } from "@plasmohq/storage";
import { getApiKey } from "~/services/utils";
import { ToolCall, toolExecutor } from "../services/tool-executor";
import { env } from "~/utils/env";
import { db } from "~/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Conversation } from "~/types/conversations";

const Sidepanel = () => {
  const [apiKey, setApiKey] = useStorage("apiKey");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyValidationError, setApiKeyValidationError] =
    useState<string>("");
  const [currentConversationId, setCurrentConversationId] = useStorage<
    string | null
  >("currentConversationId", null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 使用 useLiveQuery 获取消息和会话列表
  const messages =
    useLiveQuery(
      () =>
        currentConversationId
          ? db.getMessagesByConversation(currentConversationId)
          : [],
      [currentConversationId]
    ) ?? [];

  const conversations = useLiveQuery(() => db.getAllConversations(), []) ?? [];

  // Auto-scroll to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 处理API错误
  const handleApiError = (error: any) => {
    if (
      typeof error === "string" &&
      (error.includes("Authentication failed") ||
        error.includes("API key") ||
        error.includes("403") ||
        error.includes("401"))
    ) {
      setShowSettings(true);
    }

    // 显示错误消息
    db.saveMessage({
      message_id: crypto.randomUUID(),
      status: "error",
      content:
        typeof error === "string"
          ? error
          : "An error occurred. Please try again.",
      created_at: new Date().toISOString(),
      conversation_id: currentConversationId || "",
      role: "system",
    });
  };

  // 初始化检查API Key和会话
  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized) return;

      try {
        const storedApiKey = await getApiKey();

        if (!storedApiKey) {
          setShowSettings(true);
          setIsInitialized(true);
          return;
        }

        setApiKey(storedApiKey);
        setIsLoading(true);

        try {
          const loadedConversations = await getConversations();
          if (loadedConversations && loadedConversations.length > 0) {
            const firstConversation = loadedConversations[0];
            setCurrentConversationId(firstConversation.id);
          } else {
            // 如果没有会话，创建新会话
            const newConv = await createNewConversation();
            setCurrentConversationId(newConv.id);
          }
        } catch (error) {
          console.error("Failed to load conversations:", error);
          setApiKeyValidationError(
            "Failed to initialize chat. Please try again."
          );
          setShowSettings(true);
          handleApiError(error);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [apiKey, isInitialized]);

  // 监听API Key变化
  useEffect(() => {
    const validateAndInitialize = async () => {
      if (isInitialized && !apiKey) {
        setShowSettings(true);
        setShowConversationList(false);
        return;
      }

      if (isInitialized && apiKey) {
        try {
          // 使用获取会话列表来验证API Key
          await getConversations();
          // 清除错误状态
          setApiKeyValidationError("");
        } catch (error) {
          setApiKeyValidationError("Invalid or disabled API key");
          setShowSettings(true);
        }
      }
    };

    validateAndInitialize();
  }, [apiKey, isInitialized]);

  useEffect(() => {
    const handleMessages = (request: any) => {
      // Handle selected text from context menu
      if (request.name === "selected-text" && request.text) {
        setPrompt(request.text);
      }

      // Handle focus input request
      if (request.name === "focus-input") {
        const inputElement = document.querySelector("textarea");
        if (inputElement) {
          inputElement.focus();
        }
      }

      // 处理API Key缺失消息 - 显示设置页面而不是Alert
      if (request.name === "api-key-missing") {
        setShowSettings(true);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessages);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  // 修改暂停处理函数
  const handlePauseStream = useCallback(() => {
    console.log("Pause clicked");
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !apiKey || !currentConversationId) {
      if (!apiKey) setShowSettings(true);
      return;
    }

    const currentPrompt = prompt.trim();
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const userTimestamp = new Date().toISOString();
    const assistantTimestamp = new Date(
      new Date().getTime() + 100
    ).toISOString(); // 只比用户消息晚100ms

    const userMessage: MessageType = {
      message_id: userMessageId,
      role: "user",
      content: currentPrompt,
      created_at: userTimestamp,
      conversation_id: currentConversationId,
      status: "completed",
    };

    const loadingMessage: MessageType = {
      message_id: assistantMessageId,
      role: "assistant",
      content: "",
      created_at: assistantTimestamp,
      conversation_id: currentConversationId,
      status: "pending",
      isLoading: true,
    };

    setPrompt("");
    setIsLoading(true);
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    await db.saveMessages([userMessage, loadingMessage]);

    try {
      const saveResponse = await saveMessageApi({
        conversation_id: currentConversationId,
        message: userMessage,
        top_k_related: 3,
      });

      if (!saveResponse.success) {
        throw new Error(saveResponse.error || "Failed to save message");
      }

      const relatedMessages = await db.getRelatedMessagesWithContext(
        saveResponse.data?.top_k_messages || [],
        currentConversationId
      );
      const recentMessages = await db.getRecentMessages(
        currentConversationId,
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
        Please follow the user's request and use the memory to help you answer the question.
        User Request: ${currentPrompt}\n
        Memory: ${newPrompt}
        `;
      }

      let toolCallCount = 0;
      const MAX_TOOL_CALLS = 5;

      const processRequest = async (inputMessages: ChatMessage[]) => {
        let accumulatedContent = "";
        while (true) {
          console.log("Processing request with messages:", inputMessages);
          const stream = await sendChatCompletion(
            { messages: inputMessages },
            apiKey,
            {
              signal: abortControllerRef.current?.signal,
            }
          );

          let currentResponse = "";
          for await (const chunk of stream) {
            if (abortControllerRef.current === null) {
              break;
            }

            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              currentResponse += content;
              await db.saveMessage({
                ...loadingMessage,
                content: currentResponse,
              });
            }
          }

          const resp = await stream.finalChatCompletion();
          accumulatedContent += currentResponse;
          inputMessages.push(resp.choices[0].message);

          const toolCalls = resp.choices[0].message.tool_calls;
          if (toolCalls) {
            if (toolCallCount >= MAX_TOOL_CALLS) {
              await db.saveMessage({
                ...loadingMessage,
                content: accumulatedContent,
              });
              return accumulatedContent;
            }

            toolCallCount += toolCalls.length;
            await Promise.all(
              toolCalls.map(async (toolCall: ToolCall) => {
                const toolResult = await toolExecutor.executeToolCall(toolCall);
                accumulatedContent += `Recived request tool call:\n <div style="background-color: #f0f0f0; padding: 8px; border-radius: 8px; margin: 4px 0; font-size: 14px; line-height: 1.6;"> >>> Executing tool call: ${toolCall.function.name.replace("TabToolkit_", "")}</div> \n`;
                inputMessages.push({
                  role: "tool",
                  name: toolCall.function.name,
                  content: toolResult,
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
                await db.saveMessage({
                  ...loadingMessage,
                  content: accumulatedContent,
                });
              })
            );
          } else {
            break;
          }
        }
        return accumulatedContent;
      };

      // start processing response
      const finalContent = await processRequest([
        {
          role: "user",
          content: newPrompt,
        },
      ]);

      // save final AI message
      const aiMessage: MessageType = {
        ...loadingMessage,
        content: finalContent,
        status: "completed",
        isLoading: false,
        created_at: new Date().toISOString(),
      };

      await db.saveMessage(aiMessage);
      await saveMessageApi({
        conversation_id: currentConversationId,
        message: aiMessage,
      });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      if (error.name === "AbortError") {
        console.warn("Stream aborted.");
        await db.saveMessage({
          ...loadingMessage,
          status: "error",
          content: "Stream aborted",
          error: "Stream aborted",
          isLoading: false,
          role: "system",
          created_at: new Date().toISOString(),
        });
      } else {
        console.error("Chat Error:", error);
        if (
          typeof error === "string" &&
          (error.includes("Authentication failed") ||
            error.includes("API key") ||
            error.includes("403") ||
            error.includes("401"))
        ) {
          setShowSettings(true);
        }

        await db.saveMessage({
          ...loadingMessage,
          status: "error",
          content: "Network error",
          error: error.message,
          isLoading: false,
          role: "system",
          created_at: new Date().toISOString(),
        });
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // UI toggle handlers
  const toggleSettings = (value: boolean) => {
    if (!value && !apiKey) {
      return;
    }
    setShowSettings(value);
    if (value) {
      setShowConversationList(false);
    }
  };

  const toggleConversationList = async (value?: boolean) => {
    const willShow = value !== undefined ? value : !showConversationList;

    if (willShow) {
      try {
        setIsLoading(true);
        // 使用 useLiveQuery 的数据，不需要额外的状态管理
        if (!conversations || conversations.length === 0) {
          // 如果还没有数据，从接口获取初始数据
          console.log("No conversations data, fetching from API");
          await getConversations();
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }

    setShowConversationList(willShow);
    if (willShow) {
      setShowSettings(false);
    }
  };

  // Select conversation
  const handleSelectConversation = async (id: string) => {
    if (isLoading) return;

    if (id === "new") {
      await handleCreateNewConversation();
      return;
    }

    setIsLoading(true);

    try {
      const conversation = await selectConv(id);
      if (conversation) {
        setCurrentConversationId(id);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    console.log("Deleting conversation:", id);

    // 防止重复操作
    if (isLoading) return;
    setIsLoading(true);

    try {
      await deleteConv(id);
      // If delete current conversation, select another conversation
      if (id === currentConversationId) {
        const remaining = conversations?.filter((c) => c.id !== id);
        if (remaining && remaining.length > 0) {
          const conversation = await selectConv(remaining[0].id);
          if (conversation) {
            setCurrentConversationId(remaining[0].id);
          }
        } else {
          const newConv = await createNewConversation();
          setCurrentConversationId(newConv.id);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new conversation
  const handleCreateNewConversation = async () => {
    if (isLoading) return;
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);

    try {
      const newConv = await createNewConversation();
      setCurrentConversationId(newConv.id);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetApiKey = async (key: string) => {
    try {
      const storage = new Storage({
        area: "local",
      });
      await storage.set("apiKey", key);
      setApiKey(key);

      if (!currentConversationId) {
        setIsLoading(true);
        try {
          const newConv = await createNewConversation();
          setCurrentConversationId(newConv.id);
        } finally {
          setIsLoading(false);
        }
      }

      setShowSettings(false);
    } catch (e) {
      handleApiError(e);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 固定的头部组件 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          zIndex: 10,
        }}
      >
        <Header
          setShowSettings={toggleSettings}
          createNewConversation={handleCreateNewConversation}
          setShowConversationList={toggleConversationList}
          showSettings={showSettings}
        />
      </div>

      {/* 可滚动的消息区域 */}
      <div
        style={{
          position: "absolute",
          top: "50px",
          bottom: "82px",
          left: 0,
          right: 0,
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div className="max-w-3xl mx-auto p-4">
          {messages.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 0",
              }}
            >
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "16px",
                  letterSpacing: "-0.025em",
                }}
              >
                Welcome to MIZU
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  color: "#4b5563",
                  textAlign: "center",
                  marginBottom: "32px",
                  lineHeight: "1.6",
                  maxWidth: "450px",
                }}
              >
                Start a new conversation to explore the AI's capabilities.
                <br />
                Ask a question, get help, or brainstorm ideas.
              </p>
              {!apiKey && (
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    textAlign: "center",
                    maxWidth: "400px",
                    lineHeight: "1.5",
                  }}
                >
                  You haven't set up your API key yet. Click the settings icon
                  in the top right corner to add your key for full
                  functionality.
                </p>
              )}
            </div>
          ) : (
            <div style={{ paddingBottom: "32px" }}>
              {messages.map((message, index) => (
                <Message
                  key={message.message_id || index}
                  message={message}
                  isLatestResponse={
                    index === messages.length - 1 &&
                    message.role === "assistant"
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* 固定的底部输入区域 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTop: "1px solid #e5e7eb",
          zIndex: 10,
        }}
      >
        <InputArea
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onPauseStream={handlePauseStream}
        />
      </div>

      {/* 浮动面板 */}
      {showConversationList && (
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          selectConversation={handleSelectConversation}
          deleteConversation={handleDeleteConversation}
          setShowConversationList={(show: boolean) =>
            toggleConversationList(show)
          }
        />
      )}

      {showSettings && (
        <Settings
          setApiKey={handleSetApiKey}
          onClose={() => toggleSettings(false)}
          initialValidationError={apiKeyValidationError}
        />
      )}
    </div>
  );
};

export default Sidepanel;
