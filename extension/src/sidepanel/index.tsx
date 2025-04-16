import React, { useState, useEffect, useRef } from "react";
import { useStorage } from "@plasmohq/storage/hook";
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
  getCurrentConversation,
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
    storage.get("openai_api_key").then((key) => {
      if (key) setApiKey(key);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userPrompt = prompt.trim();
    const userMessage: MessageType = {
      id: crypto.randomUUID(),
      type: "user",
      content: userPrompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      // build chat message request, format match the backend expectation
      const chatRequest = {
        model: "openai/gpt-3.5-turbo", // 与后端的DEFAULT_MODEL保持一致
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant named MIZU Agent. Answer questions succinctly and professionally.",
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 1000,
        // 后端已配置为使用MOCK模式
      };

      console.log("发送请求到后端:", JSON.stringify(chatRequest, null, 2));

      // 直接调用API服务
      const BACKEND_URL = "http://localhost:8000"; // 直接硬编码以排除配置问题
      const API_ENDPOINT = "/v1/chat/completions";

      // 添加授权头
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      // 使用fetch直接发送请求
      const response = await fetch(`${BACKEND_URL}${API_ENDPOINT}`, {
        method: "POST",
        headers,
        mode: "cors", // 显式指定CORS模式
        credentials: "omit", // 不发送身份验证信息（简化跨域）
        body: JSON.stringify(chatRequest),
      });

      console.log("API响应状态:", response.status);

      let assistantContent = "No response received";
      let isError = false; // Flag to indicate error

      if (response.ok) {
        try {
          const data = await response.json();
          console.log("API成功响应:", data);

          // 根据响应内容类型决定如何处理
          if (
            data.choices &&
            Array.isArray(data.choices) &&
            data.choices.length > 0
          ) {
            // 标准 OpenAI/OpenRouter 格式
            const choice = data.choices[0];
            if (choice.message && choice.message.content) {
              assistantContent = choice.message.content;
            } else if (choice.text) {
              assistantContent = choice.text;
            }
          } else if (data.message || data.content || data.text) {
            // 其他常见格式
            assistantContent = data.message || data.content || data.text;
          } else {
            // 未能识别的格式，用友好的错误信息替代
            console.error("未知响应格式:", data);
            assistantContent =
              "收到了未知格式的响应。这可能是服务端配置问题，请联系管理员。";
            isError = true;
          }

          // 如果是模拟模式，添加提示
          if (
            data.model &&
            (data.model === "mock-model" || data.model.includes("mock"))
          ) {
            assistantContent +=
              "\n\n[注：当前使用模拟模式，连接真实AI服务时将提供更好的回复]";
          }
        } catch (error) {
          const parseError = error as Error;
          console.error("解析响应失败:", parseError);
          assistantContent = `解析响应时出错，请联系管理员。${parseError.message}`;
          isError = true;
        }
      } else {
        // 处理API错误（例如4xx、5xx）
        isError = true;
        assistantContent = `连接服务失败，请稍后再试。`;

        try {
          const errorText = await response.text();
          console.error(`API错误 (${response.status}):`, errorText);

          try {
            // 尝试解析为JSON
            const errorData = JSON.parse(errorText);
            const errorMessage =
              errorData.error?.message ||
              errorData.message ||
              errorData.detail ||
              response.statusText;

            // 检查是否为地区限制错误
            if (errorMessage.includes("location is not supported")) {
              assistantContent =
                "抱歉，您所在的地区不支持使用此API服务。请联系管理员查看可用的替代方案。";
            } else if (
              errorMessage.includes("quota exceeded") ||
              errorMessage.includes("rate limit")
            ) {
              assistantContent =
                "抱歉，API使用配额已超限。请稍后再试或联系管理员升级配额。";
            } else {
              assistantContent = `服务暂时不可用: ${errorMessage.substring(0, 100)}`;
            }
          } catch {
            // 非JSON格式错误，提供简洁的错误信息
            assistantContent = `服务暂时不可用，请稍后再试。`;
          }
        } catch (e) {
          console.error("读取错误响应失败:", e);
          assistantContent = `连接服务失败，请检查网络连接。`;
        }
      }

      // 添加助手回复到UI
      const assistantMessage: MessageType = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        isError: isError, // Add error flag to message type if needed for styling
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update current conversation
      const conversation = await getCurrentConversation();
      if (conversation) {
        const updatedMessages = [
          ...conversation.messages,
          userMessage,
          assistantMessage,
        ];
        const updatedConversations = conversations.map((c) =>
          c.id === conversation.id
            ? {
                ...c,
                messages: updatedMessages,
                title:
                  c.title === "New Chat" && updatedMessages.length <= 3
                    ? userPrompt.substring(0, 30) +
                      (userPrompt.length > 30 ? "..." : "")
                    : c.title,
                updatedAt: new Date(),
              }
            : c
        );

        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error("调用API错误 (Fetch Exception):", error);
      setIsLoading(false); // Ensure loading state is reset

      // 添加网络或fetch调用本身的错误消息
      const errorMessage: MessageType = {
        id: crypto.randomUUID(),
        type: "assistant",
        content:
          "Sorry, I couldn't connect to the service. Please check your network or the server status.",
        timestamp: new Date(),
        isError: true, // Mark as error
      };

      setMessages((prev) => [...prev, errorMessage]);
      // No finally block needed here anymore as it's handled within try/catch
      return; // Exit handleSubmit after handling fetch error
    }
    // Moved setIsLoading(false) inside the try block success path and catch block
    setIsLoading(false);
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

  // Clear current conversation
  const handleClearConversation = async () => {
    await clearCurrentConversation();
    setMessages([]);
    toggleSettings(false);
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
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      {/* 浮动面板 */}
      {showConversationList && (
        <div className="fixed inset-0 z-50 bg-black/20">
          <div className="absolute inset-y-0 left-0 w-[260px] bg-white shadow-xl">
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversationId}
              selectConversation={handleSelectConversation}
              deleteConversation={handleDeleteConversation}
              createNewConversation={handleCreateNewConversation}
              setShowConversationList={toggleConversationList}
            />
          </div>
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setShowConversationList(false)}
          />
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/20">
          <div className="absolute inset-y-0 right-0 w-[320px] bg-white shadow-xl">
            <Settings
              apiKey={apiKey}
              setApiKey={handleSetApiKey}
              setShowSettings={setShowSettings}
              clearConversation={handleClearConversation}
            />
          </div>
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setShowSettings(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Sidepanel;
