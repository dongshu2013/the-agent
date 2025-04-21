import React, { useRef, useEffect, useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
            alignItems: "center",
            position: "relative",
            borderRadius: "12px",
            border: `1px solid ${isHovered || isFocused ? "#2563eb" : "#e5e7eb"}`,
            background: "#ffffff",
            overflow: "hidden",
            boxShadow:
              isHovered || isFocused
                ? "0 0 0 3px rgba(37, 99, 235, 0.1)"
                : "none",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading && !isStreaming}
            placeholder="send message..."
            rows={1}
            style={{
              flex: 1,
              padding: "12px 48px 12px 16px", // 右侧留出空间给按钮
              maxHeight: "80px",
              minHeight: "35px",
              outline: "none",
              resize: "none",
              border: "none",
              backgroundColor: "transparent",
              color: "#333333",
              overflowY: "auto",
              fontSize: "14px",
              lineHeight: "20px",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
                  width: "32px",
                  height: "32px",
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
                  style={{ width: "14px", height: "14px", color: "#ffffff" }}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="1" />
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
                  width: "32px",
                  height: "32px",
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
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="M5 12L12 5L19 12" />
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
