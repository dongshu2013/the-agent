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
import { getApiKey, setApiKey } from "~/services/cache";
import { db, resetDB } from "~/utils/db";
import { useLiveQuery } from "dexie-react-hooks";
import { ChatHandler } from "../services/chat-handler";
import { env } from "~/utils/env";
import LoginModal from "./components/LoginModal";
import { showLoginModal } from "~/utils/global-event";

const Sidepanel = () => {
  // 状态管理
  const [apiKey, setApiKeyState] = useStorage("apiKey");
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
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [pendingApiKey, setPendingApiKey] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dbInstance, setDbInstance] = useState(db);

  // 用于生成有序消息ID
  let messageIdOffset = 0;
  const generateMessageId = () => Date.now() + messageIdOffset++;

  // 数据查询
  const messages =
    useLiveQuery(
      () =>
        currentConversationId
          ? dbInstance.getMessagesByConversation(currentConversationId)
          : [],
      [currentConversationId, dbInstance]
    ) ?? [];

  console.log("........", currentUserId);
  const conversations =
    useLiveQuery(
      () =>
        currentUserId ? dbInstance.getAllConversations(currentUserId) : [],
      [dbInstance, currentUserId]
    ) ?? [];

  const redirectToLogin = useCallback(() => {
    if (!didRedirect.current) {
      window.open(`${env.WEB_URL}`, "_blank");
      didRedirect.current = true;
    }
  }, []);

  const handleApiError = useCallback(
    (error: any) => {
      db.saveMessage({
        id: generateMessageId(),
        status: "error",
        content:
          typeof error === "string"
            ? error
            : "An error occurred. Please try again.",
        conversation_id: currentConversationId || "",
        role: "system",
      });
    },
    [currentConversationId]
  );

  // 监听登录弹窗事件
  useEffect(() => {
    const handler = () => {
      console.log("SHOW_LOGIN_MODAL event triggered");
      setLoginModalOpen(true);
    };
    window.addEventListener("SHOW_LOGIN_MODAL", handler);
    return () => window.removeEventListener("SHOW_LOGIN_MODAL", handler);
  }, []);

  useEffect(() => {
    const listener = async (changes: any, area: string) => {
      if (area === "local" && changes.apiKey) {
        console.log("Sidepanel: apiKey changed", changes.apiKey);
        const newApiKey = changes.apiKey.newValue;
        if (!newApiKey) return;

        // 获取新 userId
        const res = await fetch(`${env.BACKEND_URL}/v1/user`, {
          method: "GET",
          headers: {
            "x-api-key": newApiKey,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const newUserId = data?.user?.user_id;

        const user = await db.getCurrentUser();
        const oldUserId = user?.id;

        console.log(
          "oldUserId: 🐦 🚀",
          oldUserId,
          "newUserId: 🐦 🚀",
          newUserId
        );

        // 只有当新旧用户ID不同时才显示切换提示
        if (oldUserId && newUserId && oldUserId !== newUserId) {
          setPendingApiKey(newApiKey);
          setPendingUserId(newUserId);
          setCurrentUserId(oldUserId);
          setShowSwitch(true);
          setLoginModalOpen(true);
        } else {
          // 如果是首次登录或相同用户，直接更新
          setApiKeyState(newApiKey);
          await initializeUserAndData(newApiKey);
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleSwitchAccount = useCallback(async () => {
    if (!pendingApiKey) return;
    const newDb = await resetDB(); // 清空并重建 db
    setDbInstance(newDb);
    await setApiKey(pendingApiKey);
    setApiKeyState(pendingApiKey);
    setLoginModalOpen(false);
    setShowSwitch(false);
    setCurrentConversationId(null);
    await initializeUserAndData(pendingApiKey);
  }, [pendingApiKey]);

  const initializeUserAndData = useCallback(
    async (apiKeyToUse: string) => {
      try {
        setIsLoading(true);
        const verifyResponse = await fetch(`${env.BACKEND_URL}/v1/user`, {
          method: "GET",
          headers: {
            "x-api-key": apiKeyToUse,
            "Content-Type": "application/json",
          },
        });

        if (!verifyResponse.ok) {
          setLoginModalOpen(true);
          return;
        }

        const verifyData = await verifyResponse.json();
        if (verifyData.success && verifyData.user) {
          await db.initModels(verifyData.user.user_id);

          const now = new Date().toISOString();
          const userInfo = {
            id: verifyData.user.user_id,
            username:
              verifyData.user.displayName || verifyData.user.email || "unknown",
            email: verifyData.user.email,
            api_key_enabled: true,
            api_key: apiKeyToUse,
            credits: verifyData.user.credits || "0",
            created_at: now,
            updated_at: now,
            selectedModelId: "system",
            photo_url: verifyData.user.photoURL,
          };

          await db.saveOrUpdateUser(userInfo);
          setCurrentUserId(verifyData.user.user_id);

          const dbConversations = await db.getAllConversations(
            verifyData.user.user_id
          );
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
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId]
  );

  // 首次加载
  useEffect(() => {
    const initializeApp = async () => {
      if (isInitialized) return;
      let storedApiKey = await getApiKey();
      if (!storedApiKey) {
        setLoginModalOpen(true);
        return;
      }
      await initializeUserAndData(storedApiKey);
      setIsInitialized(true);
    };
    initializeApp();
    // eslint-disable-next-line
  }, [isInitialized]);

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

  // 监听 chrome.storage.local 变化
  useEffect(() => {
    const listener = (changes: any, area: string) => {
      if (area === "local" && changes.apiKey) {
        setApiKeyState(changes.apiKey.newValue);
        // 如果是从 Web 端同步的 API key，自动刷新页面
        if (changes.apiKey.newValue) {
          window.location.reload();
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // 初始化时检查登录状态
  useEffect(() => {
    const checkLogin = async () => {
      const key = await getApiKey();
      if (!key) {
        showLoginModal();
      }
    };
    checkLogin();
  }, []);

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
                  key={message.id || index}
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

      <LoginModal
        open={loginModalOpen}
        showSwitch={showSwitch}
        pendingUserId={pendingUserId}
        currentUserId={currentUserId}
        onContinue={handleSwitchAccount}
        onClose={() => {
          setLoginModalOpen(false);
          setShowSwitch(false);
        }}
      />
    </div>
  );
};

export default Sidepanel;
