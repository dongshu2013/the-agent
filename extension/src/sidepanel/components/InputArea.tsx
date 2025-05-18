import React, { useRef, useEffect, useState } from "react";
import { useCallback } from "react";

interface InputAreaProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isStreaming: boolean;
  onPauseStream: () => void;
  onAttachFile?: () => void;
  onRecordAudio?: () => void;
}

export default function InputArea({
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  isStreaming,
  onPauseStream,
  onAttachFile,
  onRecordAudio,
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachFile = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    if (onAttachFile) {
      onAttachFile();
    }
  }, [onAttachFile]);

  return (
    <div style={{ position: "relative" }}>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            borderRadius: "18px",
            border: `1px solid ${isHovered || isFocused ? "#333333" : "#e5e7eb"}`,
            background: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ display: "flex", flexDirection: "row" }}>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading && !isStreaming}
              placeholder="Send message..."
              rows={1}
              style={{
                flex: 1,
                padding: "10px 16px",
                height: "42px",
                outline: "none",
                resize: "none",
                border: "none",
                backgroundColor: "transparent",
                color: "#333333",
                fontSize: "13px",
                lineHeight: "1.5",
                fontWeight: "normal",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 8px 6px 8px",
              gap: "8px",
            }}
          >
            <div style={{ marginLeft: "2px" }}>
              <button
                type="button"
                aria-label="Attach file"
                disabled={true}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "not-allowed",
                  opacity: 0.5,
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  // Disabled hover effect
                }}
                onMouseOut={(e) => {
                  // Disabled hover effect
                }}
              >
                <svg
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#9ca3af"
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                multiple
                type="file"
                style={{ display: "none" }}
              />
            </div>

            <div style={{ flex: 1 }}></div>

            <button
              type="button"
              aria-label="Record audio"
              disabled={true}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "transparent",
                border: "none",
                cursor: "not-allowed",
                opacity: 0.5,
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                // Disabled hover effect
              }}
              onMouseOut={(e) => {
                // Disabled hover effect
              }}
            >
              <svg
                style={{
                  width: "20px",
                  height: "20px",
                  color: "#9ca3af"
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </button>

            <div style={{ marginRight: "2px" }}>
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
                    backgroundColor: "#333333",
                    border: "none",
                    cursor: "pointer",
                    transition: "transform 0.2s, background-color 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.7)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#333333";
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
                    <rect x="5" y="5" width="14" height="14" rx="1" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={onSubmit}
                  disabled={!prompt.trim() || isLoading}
                  aria-label="Send message"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: !prompt.trim() ? "#e5e7eb" : "#333333",
                    border: "none",
                    cursor: !prompt.trim() ? "not-allowed" : "pointer",
                    opacity: !prompt.trim() ? 0.5 : 1,
                    transition: "transform 0.2s, background-color 0.2s",
                    padding: "5px",
                  }}
                  onMouseOver={(e) => {
                    if (prompt.trim()) {
                      e.currentTarget.style.backgroundColor = "#000000";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (prompt.trim()) {
                      e.currentTarget.style.backgroundColor = "#333333";
                    }
                  }}
                  onMouseDown={(e) => {
                    if (prompt.trim()) {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }
                  }}
                  onMouseUp={(e) => {
                    if (prompt.trim()) {
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-white dark:text-black"
                  >
                    <path
                      d="M7 11L12 6L17 11M12 18V7"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </button>
              )}
            </div>
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
          Mysta AI assistant may produce inaccurate information. Your data is
          kept private.
        </p>
      </form>
    </div>
  );
}
