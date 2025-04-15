import React, { useState, useEffect, useRef } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import "../../style.css";

// 导入组件
import Header from "./components/Header";
import Message from "./components/Message";
import InputArea from "./components/InputArea";
import Settings from "./components/Settings";
import ConversationList from "./components/ConversationList";

// 导入服务
import {
  Message as MessageType,
  Conversation,
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  clearCurrentConversation,
  getCurrentConversation,
} from "../services/chat";

// 新的 TabUI 组件
const TabUI = ({
  currentConversation,
  createNewConversation,
  darkMode,
  closeTab,
}) => {
  return (
    <div
      className={`flex border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <div
        className={`flex items-center px-4 py-2 ${darkMode ? "text-gray-300" : "text-gray-800"}`}
      >
        <button
          className={`flex items-center gap-1.5 rounded-t-md px-4 py-2 ${
            darkMode
              ? "bg-[#24283b] text-gray-300"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <span className="text-sm font-medium truncate max-w-[100px]">
            {currentConversation?.title || "New Chat"}
          </span>
        </button>
      </div>
      <div className="flex items-center">
        <button
          onClick={closeTab}
          className={`p-1 rounded-md ${
            darkMode
              ? "hover:bg-[#292e42] text-gray-400"
              : "hover:bg-gray-200 text-gray-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Sidepanel = () => {
  // 状态管理
  const [apiKey, setApiKey] = useStorage("apiKey");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [darkMode, setDarkMode] = useStorage<boolean>("darkMode", true);
  const [showSettings, setShowSettings] = useState(false);
  const [conversations, setConversations] = useStorage<Conversation[]>(
    "conversations",
    []
  );
  const [currentConversationId, setCurrentConversationId] = useStorage<
    string | null
  >("currentConversationId", null);
  const [showConversationList, setShowConversationList] = useState(false);

  // 当前会话对象
  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) || null;

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 设置body的data-theme属性
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // 关闭当前标签页并创建新会话
  const closeTab = () => {
    handleCreateNewConversation();
  };

  // 初始化或加载当前会话
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

  // 处理右键菜单选中的文本
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

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // 记录当前提示
    const userPrompt = prompt.trim();

    // 添加用户消息到UI
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
      // 调用background处理请求
      const resp = await chrome.runtime.sendMessage({
        name: "process-request",
        body: {
          apiKey,
          request: userPrompt,
        },
      });

      // 添加助手响应到UI
      const assistantMessage: MessageType = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: resp.result || resp.error || "No response received",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // 更新当前会话
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
      console.error("处理请求出错:", error);

      // 添加错误消息
      const errorMessage: MessageType = {
        id: crypto.randomUUID(),
        type: "assistant",
        content:
          "An error occurred while processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 选择会话
  const handleSelectConversation = async (id: string) => {
    const conversation = await selectConv(id);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(id);
      setShowConversationList(false);
    }
  };

  // 删除会话
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    await deleteConv(id);

    // 如果删除的是当前会话，选择另一个会话
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

  // 创建新会话
  const handleCreateNewConversation = async () => {
    const newConv = await createNewConversation();
    setConversations((prev) => {
      const prevList = prev || [];
      return [newConv, ...prevList];
    });
    setCurrentConversationId(newConv.id);
    setMessages([]);
    setShowConversationList(false);
  };

  // 清除当前会话
  const handleClearConversation = async () => {
    await clearCurrentConversation();
    setMessages([]);
    setShowSettings(false);
  };

  // 如果显示设置页面
  if (showSettings) {
    return (
      <Settings
        apiKey={apiKey || ""}
        setApiKey={setApiKey}
        setShowSettings={setShowSettings}
        clearConversation={handleClearConversation}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div
      className={`flex flex-col h-screen ${darkMode ? "bg-[#1a1b26]" : "bg-white"}`}
    >
      {/* 头部和会话控制 */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setShowSettings={setShowSettings}
        setShowConversationList={setShowConversationList}
        createNewConversation={handleCreateNewConversation}
      />

      {/* 标签页UI */}
      <TabUI
        currentConversation={currentConversation}
        createNewConversation={handleCreateNewConversation}
        darkMode={darkMode}
        closeTab={closeTab}
      />

      {/* 会话列表 */}
      {showConversationList && (
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          selectConversation={handleSelectConversation}
          deleteConversation={handleDeleteConversation}
          createNewConversation={handleCreateNewConversation}
          setShowConversationList={setShowConversationList}
          darkMode={darkMode}
        />
      )}

      {/* 消息列表 */}
      <div
        className={`flex-1 overflow-y-auto p-4 ${
          darkMode ? "text-gray-200" : "text-gray-700"
        }`}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center">
            <h1
              className={`text-2xl font-bold mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Welcome to MIZU
            </h1>
            <p
              className={`text-center ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Start a new conversation to explore the AI's capabilities.
              <br />
              Ask a question, get help, or brainstorm ideas.
            </p>
            {!apiKey && (
              <p
                className={`mt-8 text-center ${
                  darkMode ? "text-amber-300" : "text-amber-700"
                }`}
              >
                You haven't set up your API key yet. Click the settings icon in
                the top right corner to add your key for full functionality.
              </p>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} darkMode={darkMode} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4">
        <InputArea
          prompt={prompt}
          setPrompt={setPrompt}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default Sidepanel;
