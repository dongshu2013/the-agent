import { Message as MessageType } from "../../types";
import LoadingBrain from "./LoadingBrain";
import { useState, useEffect } from "react";
import "highlight.js/styles/github.css";

interface Props {
  message: MessageType;
  isLatestResponse?: boolean;
}

export default function MessageComponent({
  message,
  isLatestResponse = false,
}: Props) {
  const isUser = message.role === "user";
  const isLoading = message.isLoading === true;
  const isError = message.role === "error";
  const [copySuccess, setCopySuccess] = useState(false);
  const [contentRendered, setContentRendered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 当消息内容加载完成后，设置contentRendered为true
  useEffect(() => {
    if (!isLoading && !isUser && message.content) {
      setContentRendered(true);
    } else {
      setContentRendered(false);
    }
  }, [isLoading, isUser, message.content]);

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

  // 判断是否应该显示复制按钮
  const shouldShowCopyButton = () => {
    if (isLoading) return false;
    if (isError) return false;
    if (!message.content) return false;

    // 对于最新的AI响应，只要渲染完成就显示
    if (isLatestResponse && !isUser) {
      return contentRendered;
    }

    // 对于其他消息，只在悬停时显示
    return isHovered;
  };

  return (
    <div
      style={{ marginBottom: !isUser ? "64px" : "16px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
              padding: isUser || isError ? "10px 16px" : "10px 16px 10px 0",
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
              <div
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.content || ""}
              </div>
            )}
          </div>

          {/* 复制按钮 - 根据条件显示 */}
          {shouldShowCopyButton() && (
            <button
              onClick={handleCopy}
              style={{
                position: "absolute",
                bottom: "-30px",
                left: isUser ? "auto" : "0",
                right: isUser ? "0" : "auto",
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
                opacity: isLatestResponse && !isUser ? 1 : isHovered ? 1 : 0,
                pointerEvents:
                  (isLatestResponse && !isUser) || isHovered ? "auto" : "none", // 当不可见时禁用交互
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
