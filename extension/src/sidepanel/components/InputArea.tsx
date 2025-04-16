import React, { useRef, useEffect } from "react";

interface InputAreaProps {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const InputArea = ({
  prompt,
  setPrompt,
  handleSubmit,
  isLoading,
}: InputAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本区域高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "24px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        44
      )}px`;
    }
  }, [prompt]);

  return (
    <div className="w-full bg-white border-t border-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end rounded-lg overflow-hidden bg-white shadow-sm border border-gray-300">
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
              placeholder="send message..."
              className="w-full py-3 pl-4 pr-12 max-h-[150px] min-h-[44px] focus:outline-none resize-none bg-white text-gray-800 placeholder-gray-400"
              rows={1}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className={`absolute right-2 bottom-2 rounded-lg p-2 flex items-center justify-center transition-colors ${
                isLoading || !prompt.trim()
                  ? "text-gray-400 opacity-50"
                  : "text-white bg-blue-500 hover:bg-blue-600"
              }`}
              aria-label="Send message"
            >
              {isLoading ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
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
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs mt-1 text-center text-gray-500">
            MIZU AI assistant may produce inaccurate information. Your data is
            kept private.
          </p>
        </form>
      </div>
    </div>
  );
};

export default InputArea;
