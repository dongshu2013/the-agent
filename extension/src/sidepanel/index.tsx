import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import "../style.css";
import Header from "./components/Header";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import Settings from "./components/Settings";
import ConversationList from "./components/ConversationList";
import {
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  getConversations,
} from "../services/conversation";
import { Storage } from "@plasmohq/storage";
import { getApiKey } from "~/services/utils";
import { db } from "~/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { ChatHandler } from "../services/chat-handler";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHandler, setChatHandler] = useState<ChatHandler | null>(null);

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

        const dbConversations = await db.getAllConversations();

        if (
          !currentConversationId ||
          !(await db.getConversation(currentConversationId))
        ) {
          if (dbConversations && dbConversations.length > 0) {
            setCurrentConversationId(dbConversations[0].id);
          } else {
            const newConv = await createNewConversation();
            setCurrentConversationId(newConv.id);
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setApiKeyValidationError(
          "Failed to initialize chat. Please try again."
        );
        setShowSettings(true);
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeApp();
    }
  }, []);

  // 监听API Key变化
  useEffect(() => {
    if (!isInitialized) return;

    const validateAndInitialize = async () => {
      if (!apiKey) {
        setShowSettings(true);
        setShowConversationList(false);
        return;
      }

      try {
        await getConversations();
        setApiKeyValidationError("");
      } catch (error) {
        setApiKeyValidationError("Invalid or disabled API key");
        setShowSettings(true);
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

  useEffect(() => {
    if (apiKey && currentConversationId) {
      setChatHandler(
        new ChatHandler({
          apiKey,
          currentConversationId,
          onError: (error) => {
            if (
              typeof error === "string" &&
              (error.includes("Authentication failed") ||
                error.includes("API key") ||
                error.includes("403") ||
                error.includes("401"))
            ) {
              setShowSettings(true);
            }
          },
          onStreamStart: () => {
            setIsLoading(true);
            setIsStreaming(true);
          },
          onStreamEnd: () => {
            setIsLoading(false);
            setIsStreaming(false);
          },
          onMessageUpdate: async (message) => {
            await db.saveMessage(message);
          },
        })
      );
    }
  }, [apiKey, currentConversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !chatHandler) return;

    const currentPrompt = prompt.trim();
    setPrompt(""); // 立即清空输入框

    await chatHandler.handleSubmit(currentPrompt);
  };

  const handlePauseStream = useCallback(() => {
    if (chatHandler) {
      chatHandler.stopStreaming();
    }
  }, [chatHandler]);

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

      // 设置新的API key后，同步服务器数据
      setIsLoading(true);
      try {
        // 获取服务器会话列表，这会自动清理并同步本地数据
        const serverConversations = await getConversations();

        if (serverConversations.length > 0) {
          // 使用服务器的第一个会话
          setCurrentConversationId(serverConversations[0].id);
        } else {
          // 如果服务器没有会话，创建新会话
          const newConv = await createNewConversation();
          setCurrentConversationId(newConv.id);
        }
      } finally {
        setIsLoading(false);
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
                Welcome to Mysta
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
