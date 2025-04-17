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
  Message as MessageType,
  Conversation,
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  clearCurrentConversation,
} from "../services/chat";
import { Storage } from "@plasmohq/storage";

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
    if (!prompt.trim() || !apiKey) {
      if (!apiKey) {
        setMessages((prev) => [
          ...prev.filter((m: MessageType) => m.type !== "error"),
          {
            id: crypto.randomUUID(),
            type: "error" as const,
            content: "API Key is not set. Please configure it in settings.",
            timestamp: new Date(),
          },
        ]);
      }
      return;
    }

    const currentPrompt = prompt.trim();
    let assistantMessageId = crypto.randomUUID();

    // Create user message
    const userMessage: MessageType = {
      id: crypto.randomUUID(),
      type: "user",
      content: currentPrompt,
      timestamp: new Date(),
    };

    // Add user message to the list
    setMessages((prev: MessageType[]) => [
      ...prev.filter((m) => m.type !== "error"),
      userMessage,
    ]);
    setPrompt("");
    setIsLoading(true);
    setIsStreaming(true);

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    // Instantiate OpenAI client
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "http://localhost:8000/v1",
      dangerouslyAllowBrowser: true,
    });

    try {
      const messagesForApi = [
        { role: "user" as const, content: currentPrompt },
      ];

      const assistantMessage: MessageType = {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev: MessageType[]) => [...prev, assistantMessage]);

      // Call OpenAI compatible API
      const stream = await client.chat.completions.create(
        {
          model: process.env.OPENAI_MODEL || "deepseek-chat",
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
                ? { ...msg, content: accumulatedContent }
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
            type: "error",
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

  const toggleConversationList = () => {
    setShowConversationList((prev) => !prev);
    if (!showConversationList) {
      setShowSettings(false);
    }
  };

  // Select conversation
  const handleSelectConversation = async (id: string) => {
    if (id === "new") {
      // If "new" is passed, create a new conversation
      await handleCreateNewConversation();
      return;
    }

    const conversation = await selectConv(id);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(id);
      toggleConversationList();
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    await deleteConv(id);

    // If delete current conversation, select another conversation
    if (id === currentConversationId) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        await handleSelectConversation(remaining[0].id);
      } else {
        const newConv = await createNewConversation();
        setConversations([newConv]);
        setCurrentConversationId(newConv.id);
        setMessages([]);
      }
    }
  };

  // Create new conversation
  const handleCreateNewConversation = async () => {
    const newConv = await createNewConversation();
    setConversations((prev) => {
      const prevList = prev || [];
      return [newConv, ...prevList];
    });
    setCurrentConversationId(newConv.id);
    setMessages([]);
    toggleConversationList();
  };

  // 更新设置API密钥的函数，保存到存储中
  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    const storage = new Storage();
    storage.set("openai_api_key", key);
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
        <div className="fixed z-50 bg-black/20">
          <div className="absolute left-0 h-full w-[300px] shadow-xl rounded-r-lg overflow-hidden border-r border-gray-200">
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversationId}
              selectConversation={handleSelectConversation}
              deleteConversation={handleDeleteConversation}
              setShowConversationList={toggleConversationList}
            />
          </div>
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setShowConversationList(false)}
          />
        </div>
      )}

      {showSettings && <Settings apiKey={apiKey} setApiKey={handleSetApiKey} />}
    </div>
  );
};

export default Sidepanel;
