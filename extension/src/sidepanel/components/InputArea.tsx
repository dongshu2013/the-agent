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

  // 使用useRef和useEffect自动调整textArea高度
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        80
      )}px`;
    }
  }, [prompt]);

  return (
    <div style={{ position: "relative" }}>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "12px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="send message..."
            rows={1}
            style={{
              flex: 1,
              padding: "12px 60px 12px 16px", // 右侧留出空间给按钮
              maxHeight: "80px",
              minHeight: "44px",
              outline: "none",
              resize: "none",
              border: "none",
              backgroundColor: "transparent",
              color: "#333333",
              overflowY: "auto",
              borderRadius: "8px",
              fontSize: "14px",
              lineHeight: "20px",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "12px",
              bottom: "8px",
            }}
          >
            {isStreaming ? (
              <button
                type="button"
                onClick={onPauseStream}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#2563eb",
                  border: "none",
                  cursor: "pointer",
                  transition: "transform 0.2s, background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#1d4ed8";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <svg
                  style={{ width: "16px", height: "16px", color: "#ffffff" }}
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: !prompt.trim() ? "#94a3b8" : "#2563eb",
                  border: "none",
                  cursor: !prompt.trim() ? "not-allowed" : "pointer",
                  opacity: !prompt.trim() ? 0.7 : 1,
                  transition: "transform 0.2s, background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  if (prompt.trim()) {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                  }
                }}
                onMouseOut={(e) => {
                  if (prompt.trim()) {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <svg
                  style={{ width: "20px", height: "20px", color: "#ffffff" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <p
          style={{
            fontSize: "12px",
            marginTop: "8px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          MIZU AI assistant may produce inaccurate information. Your data is
          kept private.
        </p>
      </form>
    </div>
  );
}
