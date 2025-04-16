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

  // 当前会话对象
  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) || null;

  // 引用
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const resp = await chrome.runtime.sendMessage({
        name: "process-request",
        body: {
          apiKey,
          request: userPrompt,
        },
      });

      // add assistant response to UI
      const assistantMessage: MessageType = {
        id: crypto.randomUUID(),
        type: "assistant",
        content: resp.result || resp.error || "No response received",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // update current conversation
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
      console.error("Error:", error);

      // add error message
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

  // Modified handlers for toggling UI elements
  const toggleSettings = (value: boolean) => {
    setShowSettings(value);
    if (value) {
      setShowConversationList(false);
    }
  };

  const toggleConversationList = (value: boolean | ((prev: boolean) => boolean)) => {
    setShowConversationList(value);
    if (typeof value === 'boolean' && value) {
      setShowSettings(false);
    }
  };

  // select conversation
  const handleSelectConversation = async (id: string) => {
    const conversation = await selectConv(id);
    if (conversation) {
      setMessages(conversation.messages);
      setCurrentConversationId(id);
      toggleConversationList(false);
    }
  };

  // delete conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    await deleteConv(id);

    // if delete current conversation, select another conversation
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

  // create new conversation
  const handleCreateNewConversation = async () => {
    const newConv = await createNewConversation();
    setConversations((prev) => {
      const prevList = prev || [];
      return [newConv, ...prevList];
    });
    setCurrentConversationId(newConv.id);
    setMessages([]);
    toggleConversationList(false);
  };

  // clear current conversation
  const handleClearConversation = async () => {
    await clearCurrentConversation();
    setMessages([]);
    toggleSettings(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800">
      {/* header menu */}
      <Header
        setShowSettings={toggleSettings}
        createNewConversation={handleCreateNewConversation}
        setShowConversationList={toggleConversationList}
      />

      <div className="flex-1 flex flex-col relative">
        {showSettings ? (
          // 设置面板
          <div className="absolute inset-0 z-50 bg-white">
            <Settings
              apiKey={apiKey}
              setApiKey={setApiKey}
              clearConversation={handleClearConversation}
              setShowSettings={toggleSettings}
            />
          </div>
        ) : (
          <>
            {/* 会话列表抽屉 */}
            <div 
              className={`fixed left-0 top-[60px] bottom-[88px] w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
                showConversationList ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <ConversationList
                conversations={conversations}
                currentConversationId={currentConversationId}
                selectConversation={handleSelectConversation}
                deleteConversation={handleDeleteConversation}
                createNewConversation={handleCreateNewConversation}
                setShowConversationList={toggleConversationList}
              />
            </div>

            {/* 遮罩层 */}
            {showConversationList && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => toggleConversationList(false)}
              />
            )}

            {/* 主聊天区域 */}
            <div className="flex-1 overflow-y-auto mb-[88px]">
              {messages.length > 0 ? (
                <div className="max-w-3xl mx-auto px-4 py-4">
                  {messages.map((message) => (
                    <Message key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col justify-center items-center max-w-lg mx-auto px-4">
                  <h1 className="text-2xl font-semibold mb-2 text-gray-800">
                    Welcome to MIZU
                  </h1>
                  <p className="text-center mb-8 text-gray-600">
                    Start a new conversation to explore the AI's capabilities.
                    <br />
                    Ask a question, get help, or brainstorm ideas.
                  </p>
                  {!apiKey && (
                    <p className="text-center text-yellow-600">
                      You haven't set up your API key yet. Click the settings icon
                      in the top right corner to add your key for full
                      functionality.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="fixed bottom-0 left-0 right-0 z-20">
              <InputArea
                prompt={prompt}
                setPrompt={setPrompt}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidepanel;
