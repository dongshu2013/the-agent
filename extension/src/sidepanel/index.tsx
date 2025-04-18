import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import OpenAI from "openai";
import "../../style.css";
import Header from "./components/Header";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import Settings from "./components/Settings";
import ConversationList from "./components/ConversationList";
import {
  MessageType,
  Conversation,
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  getConversations,
} from "../services/chat";
import { Storage } from "@plasmohq/storage";
import { saveMessageApi } from "../services/api";
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
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reference to the messages end
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize or load current conversation
  useEffect(() => {
    const initializeConversation = async () => {
      if (!conversations || conversations.length === 0) {
        const newConv = await createNewConversation();
        setConversations([newConv]);
        setCurrentConversationId(newConv.id);
        setMessages([]);
      } else if (currentConversationId) {
        const currentConv = conversations.find(
          (c) => c.id === currentConversationId
        );
        if (currentConv) {
          setMessages(currentConv.messages);
        } else if (conversations.length > 0) {
          setCurrentConversationId(conversations[0].id);
          setMessages(conversations[0].messages);
        }
      } else if (conversations.length > 0) {
        setCurrentConversationId(conversations[0].id);
        setMessages(conversations[0].messages);
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
      if (key) setApiKey(key);
    });
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
    if (!prompt.trim() || !apiKey || !currentConversationId) return;

    const currentPrompt = prompt.trim();
    let assistantMessageId = crypto.randomUUID();

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
      loadingMessage, // 添加加载中消息
    ]);
    setPrompt("");
    setIsLoading(true);
    setIsStreaming(true);

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    // Instantiate OpenAI client
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: env.API_URL,
      dangerouslyAllowBrowser: true,
    });

    try {
      const messagesForApi = [
        { role: "user" as const, content: currentPrompt },
      ];

      // Call OpenAI compatible API
      const stream = await client.chat.completions.create(
        {
          model: env.OPENAI_MODEL,
          messages: messagesForApi,
          stream: true,
        },
        { signal: abortControllerRef.current?.signal }
      );

      let accumulatedContent = "";
      for await (const chunk of stream) {
        if (abortControllerRef.current === null) {
          console.log("Stream processing aborted externally.");
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
          console.log("Stream finished.");
          break;
        }
      }
      console.log("Stream processing complete.");

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
        const errorContent =
          error.response?.data?.error?.message ||
          error.message ||
          "An unexpected error occurred. Please check the console.";
        setMessages((prev: MessageType[]) => [
          ...prev.filter((m: MessageType) => m.id !== assistantMessageId),
          {
            id: crypto.randomUUID(),
            role: "error",
            content: errorContent,
            timestamp: new Date(),
          },
        ]);
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
        console.log("会话列表已刷新");
      } catch (error) {
        console.error("刷新会话列表失败:", error);
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
      // 显示错误消息
      setMessages((prev) => [
        ...prev.filter((m: MessageType) => m.role !== "error"),
        {
          id: crypto.randomUUID(),
          role: "error",
          content: "Failed to delete conversation. Please try again later.",
          timestamp: new Date(),
        },
      ]);
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
      // 错误处理 - 在UI中显示错误消息
      setMessages([
        {
          id: crypto.randomUUID(),
          role: "error",
          content: "Failed to create new conversation. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      // 操作完成后重置加载状态
      setIsLoading(false);
    }
  };

  // 更新设置API密钥的函数，保存到存储中
  const handleSetApiKey = (key: string) => {
    console.log("Setting API key:", key ? "有值" : "无值");
    setApiKey(key);
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
            <div className="flex flex-col items-center justify-center py-16">
              <h1 className="text-3xl font-semibold text-gray-800 tracking-tight mb-4">
                Welcome to MIZU
              </h1>
              <p className="text-base text-gray-600 text-center mb-8 leading-relaxed max-w-md">
                Start a new conversation to explore the AI's capabilities.
                <br className="hidden sm:block" />
                Ask a question, get help, or brainstorm ideas.
              </p>
              {!apiKey && (
                <p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed">
                  You haven't set up your API key yet. Click the settings icon
                  in the top right corner to add your key for full
                  functionality.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={message.id || index}>
                  <Message message={message} />
                </div>
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

      {showSettings && <Settings apiKey={apiKey} setApiKey={handleSetApiKey} />}
    </div>
  );
};

export default Sidepanel;
