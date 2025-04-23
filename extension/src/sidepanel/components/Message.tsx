import { Message as MessageType } from "../../types/messages";
import LoadingBrain from "./LoadingBrain";
import { useState, useEffect } from "react";

interface Props {
  message: MessageType;
  isLatestResponse?: boolean;
}

export default function MessageComponent({ message }: Props) {
  const isUser = message?.role === "user";
  const isLoading = message?.isLoading === true;
  const isError = message?.status === "error";
  const [copySuccess, setCopySuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!message) {
    console.warn("Message component received null or undefined message");
    return null;
  }

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

  const shouldShowCopyButton = () => {
    if (isLoading) return false;
    if (isError) return false;
    if (!message.content) return false;

    // AI 回复的复制按钮始终显示
    if (!isUser) return true;

    // 用户消息的复制按钮只在 hover 时显示
    return isHovered;
  };

  const renderContent = () => {
    if (isLoading && !message.content) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <LoadingBrain />
        </div>
      );
    }

    if (isUser || isError) {
      return (
        <div style={{ whiteSpace: "pre-wrap" }}>{message.content || ""}</div>
      );
    }

    const content = message.content || "";

    // 简单的 markdown 转换
    const processedContent = content
      // 处理代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre style="background-color: #f6f8fa; padding: 8px; border-radius: 4px; margin: 4px 0; font-size: 13px; line-height: 1.3;"><code class="language-${lang || ""}" style="font-family: monospace; white-space: pre;">${code.trim()}</code></pre>`;
      })
      // 处理行内代码
      .replace(
        /`([^`]+)`/g,
        '<code style="background-color: #f6f8fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 13px;">\$1</code>'
      )
      // 处理粗体
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      // 处理斜体
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      // 处理链接
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #0366d6; text-decoration: none;">$1</a>'
      )
      // 处理列表
      .replace(/^\s*[-*]\s+(.+)$/gm, "<li style='margin-left: 20px;'>$1</li>")
      // 处理标题
      .replace(
        /^#\s+(.+)$/gm,
        "<h1 style='font-size: 1.5em; margin: 16px 0;'>$1</h1>"
      )
      .replace(
        /^##\s+(.+)$/gm,
        "<h2 style='font-size: 1.3em; margin: 14px 0;'>$2</h2>"
      )
      .replace(
        /^###\s+(.+)$/gm,
        "<h3 style='font-size: 1.1em; margin: 12px 0;'>$3</h3>"
      )
      // 处理引用
      .replace(
        /^>\s+(.+)$/gm,
        "<blockquote style='border-left: 3px solid #e1e4e8; margin: 8px 0; padding-left: 16px; color: #6a737d;'>$1</blockquote>"
      )
      // 处理换行
      .replace(/\n/g, "<br>");

    return (
      <div
        className="markdown-content"
        style={{ width: "100%" }}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    );
  };

  return (
    <div
      style={{ marginBottom: !isUser ? "32px" : "32px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          marginLeft: isUser ? "15%" : "0",
          marginRight: !isUser ? "15%" : "0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            maxWidth: "100%",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "inline-block",
              maxWidth: "100%",
              padding: isUser || isError ? "10px 16px" : "10px 16px 10px 0",
              textAlign: "left",
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
            {renderContent()}
          </div>

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
                border: "none",
                backgroundColor: "transparent",
                padding: 0,
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s",
                opacity: !isUser ? 1 : isHovered ? 1 : 0,
                pointerEvents: !isUser ? "auto" : isHovered ? "auto" : "none",
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
