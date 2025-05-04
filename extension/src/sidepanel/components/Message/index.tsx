import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Message as MessageType } from "../../../types";
import LoadingBrain from "../LoadingBrain";
import "./styles.css";

interface MessageProps {
  message: MessageType;
  isLatestResponse?: boolean;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isUser = message?.role === "user";
  const isLoading = message?.isLoading === true;
  const isError = message?.status === "error";

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
    if (isLoading || isError || !message.content) return false;
    return !isUser || isHovered;
  };

  const processContent = (content: string) => {
    if (!content) return null;

    // 用正则分割出所有 Tool call: 段
    const parts = content.split(/(Tool call:[^\n]*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith("Tool call:")) {
        const toolName = part.replace("Tool call:", "").trim();
        return (
          <div className="tool-call" key={`tool-call-${idx}`}>
            <svg
              className="tool-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
              <path d="M17.64 15 22 10.64" />
              <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
            </svg>
            <span>Executed tool call</span>
            <span className="tool-name">{toolName}</span>
          </div>
        );
      } else if (part.trim() !== "") {
        // 处理HTML img标签
        if (part.match(/<img[^>]+>/)) {
          const srcMatch = part.match(/src=["']([^"']+)["']/);
          return srcMatch ? `![](${srcMatch[1]})` : part;
        }

        // 保持已有的Markdown图片格式
        if (part.match(/^!\[.*\]\(.*\)$/)) {
          return part;
        }

        // 处理以感叹号开头的行
        if (part.startsWith("!")) {
          const imageText = part.slice(1).trim();
          if (imageText.match(/^(https?:\/\/|data:image\/)/)) {
            return `![](${imageText})`;
          }
          return `![${imageText}](${imageText})`;
        }

        // 其它内容用 markdown 渲染
        return <ReactMarkdown key={`md-${idx}`}>{part}</ReactMarkdown>;
      }
      return null;
    });
  };

  const renderContent = () => {
    if (isLoading && !message.content) {
      return <LoadingBrain />;
    }
    if (isUser || isError) {
      return (
        <div style={{ whiteSpace: "pre-wrap" }}>{message.content || ""}</div>
      );
    }
    return <>{processContent(message.content || "")}</>;
  };

  return (
    <div
      className={`message ${message.role}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="content">{renderContent()}</div>
      {shouldShowCopyButton() && (
        <button
          onClick={handleCopy}
          className="copy-button"
          title="Copy to clipboard"
        >
          {copySuccess ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="copy-icon success"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="copy-icon"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default Message;
