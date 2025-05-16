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
                onClick={handleAttachFile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z"
                    fill="currentColor"
                  ></path>
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
              id="audio-recorder"
              type="button"
              aria-label="Use microphone"
              title="Use microphone"
              onClick={onRecordAudio}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4b5563"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
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
