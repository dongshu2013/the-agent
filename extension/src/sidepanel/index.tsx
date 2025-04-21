import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import "../../style.css";
import Header from "./components/Header";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import Settings from "./components/Settings";
import ConversationList from "./components/ConversationList";
import { Conversation } from "../types/conversations";
import { Message as MessageType } from "../types/messages";
import { saveMessageApi, sendChatCompletion } from "../services/chat";
import {
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  getConversations,
} from "../services/conversation";
import { Storage } from "@plasmohq/storage";
import { indexedDB } from "../utils/db";
import { getApiKey } from "~/services/utils";
import { toolExecutor } from "../services/tool-executor";
import { ToolCallResult } from "../types/api";

const Sidepanel = () => {
  const [apiKey, setApiKey] = useStorage("apiKey");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyValidationError, setApiKeyValidationError] =
    useState<string>("");
  const [conversations, setConversations] = useStorage<Conversation[]>(
    "conversations",
    []
  );
  const [currentConversationId, setCurrentConversationId] = useStorage<
    string | null
  >("currentConversationId", null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reference to the messages end
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setMessages((prev: any) => [
      ...prev.filter((m: MessageType) => m.status !== "error"),
      {
        id: crypto.randomUUID(),
        status: "error",
        content:
          typeof error === "string"
            ? error
            : "An error occurred. Please try again.",
        timestamp: new Date(),
      },
    ]);
  };

  // 初始化检查API Key和会话
  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized) return;

      try {
        const storedApiKey = await getApiKey();

        // 如果没有 API key，显示设置页面
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
            setConversations(loadedConversations);
            const firstConversation = loadedConversations[0];
            setCurrentConversationId(firstConversation.id);

            // 加载当前会话的消息并按时间排序
            const currentMessages = await indexedDB.getMessagesByConversation(
              firstConversation.id
            );
            const sortedMessages = currentMessages.sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
            setMessages(sortedMessages || []);
          } else {
            // 如果没有会话，创建新会话
            const newConv = await createNewConversation();
            setConversations([newConv]);
            setCurrentConversationId(newConv.id);
            setMessages([]);
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
      setIsStreaming(false); // 只重置流状态
      // 移除 setIsLoading(false) 因为我们不需要重置加载状态
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
    let toolCallStarted = false;
    let isToolCallComplete = false;

    const userMessage: MessageType = {
      message_id: userMessageId,
      role: "user",
      content: currentPrompt,
      created_at: new Date().toISOString(),
      conversation_id: currentConversationId,
      status: "completed",
    };

    const loadingMessage: MessageType = {
      message_id: assistantMessageId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      conversation_id: currentConversationId,
      status: "pending",
      isLoading: true,
    };

    setPrompt("");
    setIsLoading(true);
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    await indexedDB.saveMessage(userMessage);

    try {
      const saveResponse = await saveMessageApi({
        conversation_id: currentConversationId,
        message: userMessage,
        top_k_related: 3,
      });

      if (!saveResponse.success) {
        throw new Error(saveResponse.error || "Failed to save message");
      }

      const relatedMessages = await indexedDB.getRelatedMessagesWithContext(
        saveResponse.data?.top_k_messages || [],
        currentConversationId
      );
      const recentMessages = await indexedDB.getRecentMessages(
        currentConversationId,
        10
      );

      let memoryMessages = ``;
      if (relatedMessages.length > 0) {
        memoryMessages += `Related messages:\n`;
        relatedMessages.forEach((msg) => {
          memoryMessages += `${msg.role}: ${msg.content}\n`;
        });
      }
      if (recentMessages.length > 0) {
        memoryMessages += `Recent messages:\n`;
        recentMessages.forEach((msg) => {
          memoryMessages += `${msg.role}: ${msg.content}\n`;
        });
      }
      if (userMessage) {
        memoryMessages += `User message:\n`;
        memoryMessages += `${userMessage.role}: ${userMessage.content}\n`;
      }

      const response = await sendChatCompletion(
        {
          messages: [
            {
              role: "user",
              content: memoryMessages,
            },
          ],
        },
        apiKey,
        {
          stream: true,
          signal: abortControllerRef.current?.signal,
        }
      );

      if (!response.success)
        throw new Error(response.error || "AI response failed");

      const stream = response.data;
      let accumulatedContent = "";

      for await (const chunk of stream) {
        if (abortControllerRef.current === null) break;

        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          accumulatedContent += content;

          setMessages((msg: MessageType[]) =>
            msg.map((msg: MessageType) =>
              msg.message_id === assistantMessageId
                ? { ...msg, content: accumulatedContent, isLoading: false }
                : msg
            )
          );
        }
        if (chunk.choices[0]?.finish_reason === "stop") {
          break;
        }

        // 处理工具调用
        try {
          const hasToolCall = chunk.choices[0]?.delta?.tool_calls;

          if (hasToolCall && !toolCallStarted) {
            toolCallStarted = true;
            console.log("Tool call started"); // 添加日志
            setMessages((prev) =>
              prev.map((msg) =>
                msg.message_id === assistantMessageId
                  ? { ...msg, status: "pending", isLoading: true }
                  : msg
              )
            );
          }

          toolExecutor.processStreamingToolCalls(chunk);
          if (toolExecutor.isToolCallComplete(chunk)) {
            console.log("Tool call completed"); // 添加日志
            isToolCallComplete = true;
            break;
          }
        } catch (error) {
          console.error("Tool execution error:", error);
        }

        if (chunk.choices[0]?.finish_reason === "stop") {
          console.log("Stream finished with stop reason"); // 添加日志
          break;
        }
      }

      // 处理工具调用结果
      if (isToolCallComplete) {
        try {
          const results = await toolExecutor.processCompletedToolCalls();
          if (results) {
            console.log("Tool results:", results); // 添加日志
            accumulatedContent += "\n\n" + results;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.message_id === assistantMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              )
            );
          }
        } catch (error) {
          console.error("Failed to process tool results:", error);
        }
      }

      // 最终写入 AI message
      const aiMessage: MessageType = {
        message_id: assistantMessageId,
        role: "assistant",
        content: accumulatedContent,
        created_at: new Date().toISOString(),
        conversation_id: currentConversationId,
        status: "completed",
        isLoading: false,
      };

      console.log("Final AI message:", aiMessage); // 添加日志

      await indexedDB.saveMessage(aiMessage);
      await saveMessageApi({
        conversation_id: currentConversationId,
        message: aiMessage,
      });
      setMessages((prev) => {
        console.log("Previous messages:", prev); // 添加日志
        return prev.map((msg) =>
          msg.message_id === assistantMessageId
            ? {
                ...msg,
                content: accumulatedContent,
                status: "completed",
                isLoading: false,
              }
            : msg
        );
      });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error); // 添加日志
      if (error.name === "AbortError") {
        console.warn("Stream aborted.");
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === assistantMessageId
              ? { ...msg, status: "error", error: "Stream aborted" }
              : msg
          )
        );
      } else {
        console.error("Chat Error:", error);
        handleApiError(error.message || "Unexpected error");

        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === assistantMessageId
              ? { ...msg, status: "error", error: error.message }
              : msg
          )
        );
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
        // 如果已经打开过会话列表，优先从缓存获取
        if (conversations && conversations.length > 0) {
          console.log("Using cached conversations");
          setConversations(conversations);
        } else {
          // 如果缓存中没有，则从接口获取
          console.log("No cached conversations, fetching from API");
          const refreshedConversations = await getConversations();
          setConversations(refreshedConversations);
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
    if (isLoading) return; // 防止重复操作

    if (id === "new") {
      // 如果"new"被传递，创建一个新的会话
      await handleCreateNewConversation();
      return;
    }

    // 简单防重复处理
    setIsLoading(true);

    try {
      const conversation = await selectConv(id);
      if (conversation) {
        // 从 IndexedDB 获取消息并按时间排序
        const messages = await indexedDB.getMessagesByConversation(id);
        const sortedMessages = messages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedMessages);
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
      console.log("Conversation deleted successfully");

      // 从缓存中删除会话
      setConversations((prev) => (prev ? prev.filter((c) => c.id !== id) : []));

      // If delete current conversation, select another conversation
      if (id === currentConversationId) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          const conversation = await selectConv(remaining[0].id);
          if (conversation) {
            setMessages(conversation.messages || []);
            setCurrentConversationId(remaining[0].id);
          }
        } else {
          const newConv = await createNewConversation();
          setConversations([newConv]);
          setCurrentConversationId(newConv.id);
          setMessages([]);
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
    // 防止重复创建，如果正在加载状态，直接返回
    if (isLoading) return;

    console.log(
      "Creating new conversation, API key:",
      apiKey ? "Available" : "Not available"
    );

    // 如果没有API Key
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);

    try {
      // 创建新会话 - 现在会调用后端API
      const newConv = await createNewConversation();
      console.log("New conversation created successfully:", newConv.id);

      // 更新会话列表
      setConversations((prev) => {
        const prevList = prev || [];
        // 检查是否已经存在该会话，避免重复添加
        if (prevList.some((conv) => conv.id === newConv.id)) {
          return prevList;
        }
        return [newConv, ...prevList];
      });

      // 设置为当前会话
      setCurrentConversationId(newConv.id);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
      handleApiError(error);
    } finally {
      // 操作完成后重置加载状态
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
          setConversations([newConv]);
          setCurrentConversationId(newConv.id);
          setMessages([]);
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
            <div className="space-y-6">
              <div className="messages-container">
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
