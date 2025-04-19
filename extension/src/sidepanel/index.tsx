import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import "../../style.css";
import Header from "./components/Header";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import Settings from "./components/Settings";
import ConversationList from "./components/ConversationList";
import { Message as MessageType, Conversation } from "../types";
import { sendChatRequest, saveMessageApi } from "../services/chat";
import {
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  getConversations,
} from "../services/conversation";
import { Storage } from "@plasmohq/storage";
import { generateMemory } from "../services/memory";
import { env } from "../utils/env";

const Sidepanel = () => {
  const [apiKey, setApiKey] = useStorage("apiKey");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [conversations, setConversations] = useStorage<Conversation[]>(
    "conversations",
    []
  );
  const [currentConversationId, setCurrentConversationId] = useStorage<
    string | null
  >("currentConversationId", null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  const [apiKeyRedirectUrl, setApiKeyRedirectUrl] = useState(
    `${env.SERVER_URL}/profile`
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reference to the messages end
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 处理API错误
  const handleApiError = (error: any) => {
    console.error("API Error in UI:", error);

    // 检查错误信息中是否包含身份验证失败
    if (
      typeof error === "string" &&
      (error.includes("Authentication failed") ||
        error.includes("API key") ||
        error.includes("403") ||
        error.includes("401"))
    ) {
      // 显示API Key提示
      setShowApiKeyAlert(true);
    }

    // 显示错误消息
    setMessages((prev) => [
      ...prev.filter((m: MessageType) => m.role !== "error"),
      {
        id: crypto.randomUUID(),
        role: "error",
        content:
          typeof error === "string"
            ? error
            : "An error occurred. Please try again.",
        timestamp: new Date(),
      },
    ]);
  };

  // Initialize or load current conversation
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // 如果没有对话列表，先获取对话列表
        if (!conversations || conversations.length === 0) {
          const loadedConversations = await getConversations();

          // 如果服务器上也没有对话，才创建新对话
          if (!loadedConversations || loadedConversations.length === 0) {
            const newConv = await createNewConversation();
            setConversations([newConv]);
            setCurrentConversationId(newConv.id);
            setMessages([]);
          } else {
            // 如果服务器上有对话，使用第一个对话
            setConversations(loadedConversations);
            setCurrentConversationId(loadedConversations[0].id);
            setMessages(loadedConversations[0].messages || []);
          }
        } else if (currentConversationId) {
          // 如果有当前对话ID，找到对应的对话
          const currentConv = conversations.find(
            (c) => c.id === currentConversationId
          );
          if (currentConv) {
            setMessages(currentConv.messages || []);
          } else if (conversations.length > 0) {
            // 如果找不到当前对话，使用第一个对话
            setCurrentConversationId(conversations[0].id);
            setMessages(conversations[0].messages || []);
          }
        } else if (conversations.length > 0) {
          // 如果没有当前对话ID但有对话列表，使用第一个对话
          setCurrentConversationId(conversations[0].id);
          setMessages(conversations[0].messages || []);
        }
      } catch (error) {
        // 处理初始化会话时的错误
        handleApiError(error);
      }
    };

    initializeConversation();
  }, [currentConversationId, conversations]);

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

      // 处理API Key缺失消息
      if (request.name === "api-key-missing") {
        setShowApiKeyAlert(true);
        if (request.redirectUrl) {
          setApiKeyRedirectUrl(request.redirectUrl);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessages);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  useEffect(() => {
    // init storage and get api key
    const storage = new Storage();
    storage.get("apiKey").then((key) => {
      if (key) {
        setApiKey(key);
      } else {
        // 如果没有API Key，显示提示
        setShowApiKeyAlert(true);
      }
    });
  }, []);

  // 打开登录页面获取API Key
  const handleGetApiKey = () => {
    window.open(apiKeyRedirectUrl, "_blank");
  };

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
      if (!apiKey) {
        setShowApiKeyAlert(true);
      }
      return;
    }

    const currentPrompt = prompt.trim();
    let assistantMessageId = crypto.randomUUID();

    try {
      // Create user message
      const userMessage: MessageType = {
        role: "user",
        content: currentPrompt,
        timestamp: new Date(),
      };

      // Save user message to backend first
      const saveUserMessageResponse = await saveMessageApi(
        currentConversationId,
        userMessage
      );
      if (!saveUserMessageResponse.success) {
        throw new Error(
          saveUserMessageResponse.error || "Failed to save user message"
        );
      }

      // Update user message with ID from backend
      userMessage.id = saveUserMessageResponse.data?.id;

      // Create loading message
      const loadingMessage: MessageType = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      // Add user message to the list
      setMessages((prev: MessageType[]) => [
        ...prev.filter((m) => m.role !== "error"),
        userMessage,
        loadingMessage,
      ]);
      setPrompt("");
      setIsLoading(true);
      setIsStreaming(true);

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      // 1. Generate memory context
      const memory = await generateMemory(
        currentConversationId,
        currentPrompt,
        {
          strategy: 2,
          systemPrompt: env.SYSTEM_PROMPT,
        }
      );

      // 2. Send chat request with memory context
      const response = await sendChatRequest(
        {
          messages: memory,
        },
        apiKey,
        {
          stream: true,
          signal: abortControllerRef.current?.signal,
        }
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to get response from AI");
      }

      const stream = response.data;
      let accumulatedContent = "";

      for await (const chunk of stream) {
        if (abortControllerRef.current === null) {
          break;
        }
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          accumulatedContent += content;
          setMessages((prev: MessageType[]) =>
            prev.map((msg: MessageType) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedContent, isLoading: false }
                : msg
            )
          );
        }
        if (chunk.choices[0]?.finish_reason === "stop") {
          break;
        }
      }

      // Save AI message
      if (accumulatedContent) {
        const aiMessageResponse = await saveMessageApi(currentConversationId, {
          role: "assistant",
          content: accumulatedContent,
          timestamp: new Date(),
        });

        if (!aiMessageResponse.success) {
          throw new Error("Failed to save AI message");
        }

        // Update the loading message with the final content and ID
        setMessages((prev: MessageType[]) =>
          prev.map((msg: MessageType) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  id: aiMessageResponse.data?.id,
                  content: accumulatedContent,
                  isLoading: false,
                }
              : msg
          )
        );
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Stream aborted by user.");
      } else {
        console.error("API Call Error:", error);
        handleApiError(
          error.response?.data?.error?.message ||
            error.message ||
            "An unexpected error occurred. Please check the console."
        );
        setMessages((prev: MessageType[]) =>
          prev.filter((m: MessageType) => m.id !== assistantMessageId)
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
    setShowSettings(value);
    if (value) {
      setShowConversationList(false);
    }
  };

  const toggleConversationList = async (value?: boolean) => {
    // 根据参数或当前状态确定新状态
    const willShow = value !== undefined ? value : !showConversationList;

    if (willShow) {
      try {
        setIsLoading(true);
        // 刷新会话列表
        const refreshedConversations = await getConversations();
        setConversations(refreshedConversations);
        console.log("Conversations refreshed");
      } catch (error) {
        console.error("Failed to refresh conversations:", error);
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }

    // 切换显示状态
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
        setMessages(conversation.messages);
        setCurrentConversationId(id);
        // 不再自动关闭会话列表
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
            setMessages(conversation.messages);
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
      setShowApiKeyAlert(true);
      return;
    }

    // 简单的防重复点击处理
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

  // 更新设置API密钥的函数，保存到存储中
  const handleSetApiKey = (key: string) => {
    console.log("Setting API key:", key ? "有值" : "无值");
    setApiKey(key);
    setShowApiKeyAlert(false); // 隐藏API Key提示
    const storage = new Storage();

    // 存储到 apiKey 键
    storage.set("apiKey", key).then(() => {
      console.log("API key saved to storage");
    });

    // 同时存储到 localStorage 以便API请求使用
    try {
      localStorage.setItem("apiKey", key);
    } catch (e) {
      console.warn("Failed to save API key to localStorage:", e);
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
      {/* API Key缺失提示 */}
      {showApiKeyAlert && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff9db",
            padding: "16px",
            textAlign: "center",
            zIndex: 50,
            borderBottom: "1px solid #ffd43b",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              color: "#664d03",
              marginBottom: "8px",
              fontWeight: 600,
            }}
          >
            You need to login to get API Key to use the full functionality
          </div>
          <button
            onClick={handleGetApiKey}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Go to get API Key
          </button>
          <button
            onClick={() => setShowApiKeyAlert(false)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "8px 12px",
              marginLeft: "8px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            Not now
          </button>
        </div>
      )}

      {/* 固定的头部组件 */}
      <div
        style={{
          position: "absolute",
          top: showApiKeyAlert ? "86px" : 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          zIndex: 10,
          transition: "top 0.3s ease",
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
          top: showApiKeyAlert ? "136px" : "50px",
          bottom: "82px",
          left: 0,
          right: 0,
          overflowY: "auto",
          overflowX: "hidden",
          backgroundColor: "#FFFFFF",
          transition: "top 0.3s ease",
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
          apiKey={apiKey}
          setApiKey={handleSetApiKey}
          onClose={() => toggleSettings(false)}
        />
      )}
    </div>
  );
};

export default Sidepanel;
