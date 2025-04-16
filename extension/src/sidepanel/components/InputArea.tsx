import React, { useRef, useEffect } from "react";

interface InputAreaProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isStreaming: boolean;
  onPauseStream: () => void;
}

export default function InputArea({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  isStreaming,
  onPauseStream,
}: InputAreaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认的换行行为
      if (prompt.trim() && !isLoading) {
        onSubmit(e as any);
      }
    }
  };

  return (
    <div>
      <form className="flex items-end gap-2 p-2 border-t">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown} // 添加键盘事件处理
          disabled={isLoading}
          placeholder="send message..."
          className="w-full py-3 pl-4 pr-12 max-h-[150px] min-h-[44px] focus:outline-none resize-none bg-white text-gray-800 placeholder-gray-400"
          rows={3} // 默认只显示一行
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onPauseStream}
            className="p-2 rounded hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            onClick={onSubmit}
            disabled={!prompt.trim() || isLoading}
            className="p-2 rounded hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </form>
      <p className="text-xs mt-1 text-center text-gray-500">
        MIZU AI assistant may produce inaccurate information. Your data is kept
        private.
      </p>
    </div>
  );
}
