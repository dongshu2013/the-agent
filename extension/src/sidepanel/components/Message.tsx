import { MessageType } from "../../services/chat";
import LoadingBrain from "./LoadingBrain";
import React, { useState } from "react";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const isLoading = message.isLoading === true;
  const isError = message.role === "error";
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    if (isLoading || !message.content) return;

    navigator.clipboard
      .writeText(message.content)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* 用户消息靠右，AI消息靠左 */}
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          marginLeft: isUser ? "15%" : "0",
          marginRight: !isUser ? "15%" : "0",
        }}
      >
        {/* 消息内容容器 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            maxWidth: "100%",
            position: "relative",
          }}
        >
          {/* 消息内容 */}
          <div
            style={{
              display: "inline-block",
              maxWidth: "100%",
              padding: isUser ? "10px 16px" : "10px 16px 10px 0",
              textAlign: isUser ? "left" : "left",
              fontSize: "15px",
              lineHeight: "1.5",
              backgroundColor: isUser
                ? "#f2f2f2"
                : isError
                  ? "#fee2e2"
                  : "transparent",
              borderRadius: "18px",
              boxShadow: isUser ? "0 1px 2px rgba(0, 0, 0, 0.05)" : "none",
              color: isError ? "#b91c1c" : "#333333",
              wordBreak: "break-word",
            }}
          >
            {isLoading ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <LoadingBrain />
              </div>
            ) : (
              message.content
            )}
          </div>

          {/* 复制按钮 - 始终显示在AI消息的左下角 */}
          {!isUser && !isLoading && !isError && (
            <button
              onClick={handleCopy}
              style={{
                position: "absolute",
                bottom: "-30px",
                left: "0",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s",
              }}
              title="Copy to clipboard"
            >
              {copySuccess ? (
                <svg
                  style={{ width: "16px", height: "16px", color: "#059669" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  style={{ width: "16px", height: "16px", color: "#6b7280" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
