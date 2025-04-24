import { Message as MessageType } from "../../types/messages";
import LoadingBrain from "./LoadingBrain";
import { useState } from "react";
import { processMarkdown } from "../../utils/markdown-processor";

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

    // 预处理内容，处理各种图片格式
    const processedContent = content
      .split("\n")
      .map((line) => {
        const trimmedLine = line.trim();

        // 如果是HTML img标签，提取src并重新格式化
        if (trimmedLine.match(/<img[^>]+>/)) {
          const srcMatch = trimmedLine.match(/src=["']([^"']+)["']/);
          if (srcMatch) {
            return `![](${srcMatch[1]})`;
          }
          return line;
        }

        // 如果已经是Markdown图片格式，保持不变
        if (trimmedLine.match(/^!\[.*\]\(.*\)$/)) {
          return line;
        }

        // 处理以感叹号开头的行
        if (trimmedLine.startsWith("!")) {
          const imageText = trimmedLine.slice(1).trim();
          // 如果是URL或base64数据，直接作为图片源
          if (imageText.match(/^(https?:\/\/|data:image\/)/)) {
            return `![](${imageText})`;
          }
          // 如果是纯文本，尝试从 chrome.runtime.getURL 获取本地资源
          return `![${imageText}](${imageText})`;
        }

        // 检查是否包含可能的图片文本（比如 "Elon Musk's Twitter Profile"）
        if (
          trimmedLine.includes("Twitter Profile") ||
          trimmedLine.includes("Screenshot") ||
          trimmedLine.includes("Image") ||
          trimmedLine.includes("Photo")
        ) {
          // 在消息历史中查找最近的图片数据
          const recentImageData = findRecentImageData(message);
          if (recentImageData) {
            return `![${trimmedLine}](${recentImageData})`;
          }
        }

        return line;
      })
      .join("\n");

    // 使用markdown处理器处理内容
    const htmlContent = processMarkdown(processedContent);

    return (
      <div
        className="markdown-content"
        style={{ width: "100%", overflow: "auto" }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  // 辅助函数：在消息历史中查找最近的图片数据
  const findRecentImageData = (currentMessage: MessageType): string | null => {
    // 检查当前消息是否包含base64图片数据
    const base64Match = currentMessage.content?.match(
      /data:image\/[^;]+;base64,[^"'\s]+/
    );
    if (base64Match) {
      return base64Match[0];
    }

    // 检查当前消息是否包含图片URL
    const urlMatch = currentMessage.content?.match(
      /https?:\/\/[^"'\s]+\.(jpg|jpeg|png|gif|webp)/i
    );
    if (urlMatch) {
      return urlMatch[0];
    }

    return null;
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
