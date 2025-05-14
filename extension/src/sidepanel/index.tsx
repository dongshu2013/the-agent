import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import "../style.css";
import Header from "./components/Header";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import ConversationList from "./components/ConversationList";
import {
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  getConversations,
} from "../services/conversation";
import { getApiKey } from "~/services/utils";
import { db } from "~/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { ChatHandler } from "../services/chat-handler";
import { env } from "~/utils/env";
import { PROVIDER_MODELS } from "~/utils/openaiModels";

const Sidepanel = () => {
  // 状态管理
  const [apiKey, setApiKey] = useStorage("apiKey");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [currentConversationId, setCurrentConversationId] = useStorage<
    string | null
  >("currentConversationId", null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHandler, setChatHandler] = useState<ChatHandler | null>(null);
  const didRedirect = useRef(false);

  // 数据查询
  const messages =
    useLiveQuery(
      () =>
        currentConversationId
          ? db.getMessagesByConversation(currentConversationId)
          : [],
      [currentConversationId]
    ) ?? [];

  const conversations = useLiveQuery(() => db.getAllConversations(), []) ?? [];

  // 工具函数
  const redirectToLogin = useCallback(() => {
    if (!didRedirect.current) {
      window.open(`${env.WEB_URL}`, "_blank");
      didRedirect.current = true;
    }
  }, []);

  const handleApiError = useCallback(
    (error: any) => {
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
    },
    [currentConversationId]
  );

  const getApiKeyFromStorage = async () => {
    return new Promise<string | null>((resolve) => {
      chrome.storage.local.get(["apiKey"], (result) => {
        resolve(result.apiKey ?? null);
      });
    });
  };

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized) return;

      try {
        setIsLoading(true);

        // 1. 获取并验证 API Key
        let storedApiKey = await getApiKey();

        if (!storedApiKey) {
          const apiKeyFromStorage = await getApiKeyFromStorage();
          console.log("apiKeyFromStorage🍷", apiKeyFromStorage);

          if (apiKeyFromStorage) {
            setApiKey(apiKeyFromStorage);
            storedApiKey = apiKeyFromStorage;
          }
        }

        if (!storedApiKey) {
          redirectToLogin();
          return;
        }

        // 2. 验证 API Key
        const verifyResponse = await fetch(`${env.BACKEND_URL}/v1/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedApiKey}`,
            "Content-Type": "application/json",
          },
        });

        console.log("verifyResponse🍷", verifyResponse);

        if (!verifyResponse.ok) {
          if (verifyResponse.status === 401 || verifyResponse.status === 403) {
            redirectToLogin();
          }
          return;
        }

        const verifyData = await verifyResponse.json();
        if (verifyData.success && verifyData.user) {
          setApiKey(storedApiKey);

          // 构造 UserInfo 对象
          const now = new Date().toISOString();
          const userInfo = {
            id: verifyData.user.id,
            username:
              verifyData.user.displayName || verifyData.user.email || "unknown",
            email: verifyData.user.email,
            api_key_enabled: true,
            api_key: storedApiKey,
            credits: verifyData.user.credits || "0",
            created_at: now,
            updated_at: now,
            selectedModelId: "system",
            photo_url: verifyData.user.photoURL,
          };

          // 保存到 indexdb
          await db.saveOrUpdateUser(userInfo);

          // 3. 初始化模型数据
          const userId = verifyData.user.id;
          const allModels = PROVIDER_MODELS.flatMap((provider) =>
            provider.models.map((model) => ({
              ...model,
              userId,
              apiKey: model.id === "system" ? env.LLM_API_KEY || "" : "",
              apiUrl:
                model.id === "system" ? env.LLM_API_URL || "" : model.apiUrl,
              name: model.id === "system" ? env.OPENAI_MODEL || "" : model.name,
              type: model.id === "system" ? "SYSTEM" : provider.type,
            }))
          );
          await db.models.bulkPut(allModels);

          // 4. 初始化会话
          const dbConversations = await db.getAllConversations();
          if (
            !currentConversationId ||
            !(await db.getConversation(currentConversationId))
          ) {
            if (dbConversations?.length > 0) {
              setCurrentConversationId(dbConversations[0].id);
            } else {
              const newConv = await createNewConversation();
              setCurrentConversationId(newConv.id);
            }
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
        redirectToLogin();
        handleApiError(error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [isInitialized, currentConversationId, redirectToLogin, handleApiError]);

  // 消息处理
  useEffect(() => {
    const handleMessages = (request: any) => {
      if (request.name === "selected-text" && request.text) {
        setPrompt(request.text);
      }
      if (request.name === "focus-input") {
        const inputElement = document.querySelector("textarea");
        inputElement?.focus();
      }
      if (request.name === "api-key-missing") {
        redirectToLogin();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessages);
    return () => chrome.runtime.onMessage.removeListener(handleMessages);
  }, [redirectToLogin]);

  // 聊天处理器初始化
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
              redirectToLogin();
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
  }, [apiKey, currentConversationId, redirectToLogin]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 事件处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !chatHandler) return;

    const currentPrompt = prompt.trim();
    setPrompt("");
    await chatHandler.handleSubmit(currentPrompt);
  };

  const handlePauseStream = useCallback(() => {
    chatHandler?.stopStreaming();
  }, [chatHandler]);

  const toggleConversationList = async (value?: boolean) => {
    const willShow = value !== undefined ? value : !showConversationList;

    if (willShow) {
      try {
        setIsLoading(true);
        if (!conversations || conversations.length === 0) {
          await getConversations();
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }

    setShowConversationList(willShow);
  };

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

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      await deleteConv(id);
      if (id === currentConversationId) {
        const remaining = conversations?.filter((c) => c.id !== id);
        if (remaining?.length > 0) {
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
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewConversation = async () => {
    if (isLoading) return;
    if (!apiKey) {
      redirectToLogin();
      return;
    }

    setIsLoading(true);
    try {
      const newConv = await createNewConversation();
      setCurrentConversationId(newConv.id);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    chrome.storage.local.remove("apiKey");
    setApiKey(null);
    redirectToLogin();
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
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderBottom: "1px solid #f0f0f0",
          zIndex: 10,
        }}
      >
        <Header
          createNewConversation={handleCreateNewConversation}
          setShowConversationList={() => toggleConversationList()}
          onLogout={handleLogout}
        />
      </div>

      {/* Messages Area */}
      <div
        style={{
          position: "absolute",
          top: "44px",
          bottom: "90px",
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
                  You haven't set up your API key yet. Please login to your web
                  account to get started.
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

      {/* Input Area */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
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

      {/* Conversation List */}
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
    </div>
  );
};

export default Sidepanel;
