import React, { useRef, useEffect } from "react";

interface InputAreaProps {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  darkMode: boolean;
}

const InputArea = ({
  prompt,
  setPrompt,
  handleSubmit,
  isLoading,
  darkMode,
}: InputAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  }, [prompt]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2 border-t"
      style={{
        backgroundColor: darkMode ? "#1a1b26" : "#ffffff",
        borderColor: darkMode ? "#374151" : "#e5e7eb",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div
            className="flex items-end border rounded-lg overflow-hidden"
            style={{
              backgroundColor: darkMode ? "#24283b" : "#ffffff",
              borderColor: darkMode ? "#4b5563" : "#d1d5db",
              boxShadow: darkMode
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
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
              placeholder="Send a message to the AI assistant..."
              className="w-full py-3 pl-4 pr-12 max-h-[150px] focus:outline-none resize-none"
              style={{
                backgroundColor: darkMode ? "#24283b" : "#ffffff",
                color: darkMode ? "#f8f8f2" : "#333333",
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
          <p
            className="text-xs mt-2 text-center"
            style={{ color: darkMode ? "#9ca3af" : "#6b7280" }}
          >
            MIZU AI assistant may produce inaccurate information. Your data is
            kept private.
          </p>
        </form>
      </div>
    </div>
  );
};

export default InputArea;
