import React, { useState, useRef, useEffect } from "react";
import { useStorage } from "@plasmohq/storage/hook";
import "../../style.css";

// 使用declare声明aiIcon的类型
// @ts-ignore
import aiIcon from "data-base64:../../assets/icon.png";

interface Message {
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Sidepanel = () => {
  const [apiKey, setApiKey] = useStorage("apiKey");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [darkMode, setDarkMode] = useStorage<boolean>("darkMode", true);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user message
    const userMessage: Message = {
      type: "user",
      content: prompt.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);
    setPrompt("");

    try {
      const resp = await chrome.runtime.sendMessage({
        name: "process-request",
        body: {
          apiKey,
          request: userMessage.content,
        },
      });

      // Add assistant message
      const assistantMessage: Message = {
        type: "assistant",
        content: resp.result || resp.error || "No response received",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error processing request:", error);

      // Add error message
      const errorMessage: Message = {
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

  const clearConversation = () => {
    setMessages([]);
    setShowSettings(false);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Set theme-based colors
  const theme = darkMode
    ? {
        bg: "bg-gray-900",
        conversationBg: "bg-[#343541]",
        userBg: "bg-[#343541]",
        botBg: "bg-[#444654]",
        text: "text-gray-100",
        secondaryText: "text-gray-300",
        tertiaryText: "text-gray-400",
        border: "border-gray-700",
        userIcon: "bg-[#10a37f]",
        userIconText: "text-white",
        assistantIcon: "bg-[#19c37d]",
        assistantIconText: "text-white",
        hover: "hover:bg-gray-700",
        settingsBg: "bg-gray-800",
        inputBg: "bg-[#40414f]",
        inputBorder: "border-gray-600",
        inputText: "text-gray-100",
        buttonBg: "bg-[#10a37f]",
        buttonHover: "hover:bg-[#0d8e6c]",
        gradientFrom: "from-[#343541]",
        gradientVia: "via-[#343541]",
      }
    : {
        bg: "bg-[#f7f7f8]",
        conversationBg: "bg-white",
        userBg: "bg-white",
        botBg: "bg-[#f7f7f8]",
        text: "text-gray-800",
        secondaryText: "text-gray-700",
        tertiaryText: "text-gray-500",
        border: "border-gray-200",
        userIcon: "bg-[#10a37f]",
        userIconText: "text-white",
        assistantIcon: "bg-[#19c37d]",
        assistantIconText: "text-white",
        hover: "hover:bg-gray-100",
        settingsBg: "bg-gray-50",
        inputBg: "bg-white",
        inputBorder: "border-gray-300",
        inputText: "text-gray-800",
        buttonBg: "bg-[#10a37f]",
        buttonHover: "hover:bg-[#0d8e6c]",
        gradientFrom: "from-white",
        gradientVia: "via-white",
      };

  return (
    <div className="flex flex-col h-screen bg-[#0B0D19] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0B0D19] text-white">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-[#3dbe80] mr-3"></div>
          <h1 className="text-xl font-medium">MIZU Agent</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-md hover:bg-[#1E1F2E] transition-colors bg-[#26272F]"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-md hover:bg-[#1E1F2E] transition-colors bg-[#26272F]"
            aria-label="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div
          className={`absolute right-4 top-14 z-10 ${theme.settingsBg} border border-gray-700 rounded-lg shadow-lg p-4 w-72`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey || ""}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key"
                className={`w-full px-3 py-2 ${theme.inputBg} border ${theme.inputBorder} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${theme.inputText}`}
              />
            </div>
            <button
              onClick={clearConversation}
              className={`w-full py-2 px-3 rounded-md border border-gray-700 hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-2`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              Clear conversation
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-[#0B0D19]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="max-w-md">
              <svg
                className="w-32 h-32 mx-auto mb-6 text-[#10a37f]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8 10.5h8m-8 4h4m-9-9h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-8.5L9 21.5v-4H3a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z"
                ></path>
              </svg>
              <h2 className="text-3xl font-bold mb-4">How can I help today?</h2>
              <p className={`mb-8 ${theme.tertiaryText} text-lg`}>
                Ask me anything or try one of these examples
              </p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  "Explain quantum computing in simple terms",
                  "Write a creative story about a world where AI and humans live in harmony",
                  "How do I make an HTTP request in JavaScript?",
                  "What are some creative uses of AI in healthcare?",
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(example);
                      setTimeout(() => textareaRef.current?.focus(), 100);
                    }}
                    className={`p-4 rounded-xl border ${theme.border} text-left ${theme.hover} transition-colors hover:border-gray-400`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pb-32">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`py-6 ${message.type === "assistant" ? "bg-[#444654]" : "bg-[#343541]"}`}
              >
                <div className="max-w-3xl mx-auto px-4">
                  {message.type === "assistant" ? (
                    // AI消息 - 左侧显示
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-sm flex items-center justify-center overflow-hidden bg-white">
                          <img
                            src={aiIcon}
                            alt="AI Assistant"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="min-w-0 max-w-[90%] w-full">
                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap text-white">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 用户消息 - 右侧显示
                    <div className="flex flex-row-reverse w-full">
                      <div className="bg-[#2a2c42] p-3 rounded-lg max-w-[80%]">
                        <div className="whitespace-pre-wrap text-white">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2 bg-[#0B0D19]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end border border-gray-700 rounded-lg shadow-lg overflow-hidden bg-[#1E1F2E]">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message AI Assistant..."
                className="w-full py-3 pl-4 pr-12 max-h-[150px] bg-[#272935] text-white focus:outline-none resize-none sidepanel-input"
                style={{
                  color: "#FFFFFF !important",
                  textShadow: "0 0 0 #FFFFFF",
                }}
                rows={1}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className={`absolute right-2 bottom-2 p-1 rounded-md transition-colors ${
                  isLoading || !prompt.trim()
                    ? "text-gray-400 opacity-40"
                    : "text-white bg-[#19c37d] hover:bg-[#10a37f]"
                }`}
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg
                    className="w-6 h-6 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.3 2.1c.4-.2.8-.1 1.1.2.3.3.4.7.2 1.1L11.9 21.9c-.2.4-.6.6-1 .6-.1 0-.2 0-.3-.1-.3-.1-.5-.3-.6-.6l-2-5.4-5.4-2c-.3-.1-.5-.3-.6-.6-.1-.4 0-.8.3-1.1L20.3 2.1z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs mt-2 text-center text-gray-500">
              AI Assistant may produce inaccurate information. Your data stays
              private.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sidepanel;
