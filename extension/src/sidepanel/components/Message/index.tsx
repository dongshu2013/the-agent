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
    if (!content) return "";

    return content
      .split("\n")
      .map((line) => {
        const trimmedLine = line.trim();

        // 处理HTML img标签
        if (trimmedLine.match(/<img[^>]+>/)) {
          const srcMatch = trimmedLine.match(/src=["']([^"']+)["']/);
          return srcMatch ? `![](${srcMatch[1]})` : line;
        }

        // 保持已有的Markdown图片格式
        if (trimmedLine.match(/^!\[.*\]\(.*\)$/)) {
          return line;
        }

        // 处理以感叹号开头的行
        if (trimmedLine.startsWith("!")) {
          const imageText = trimmedLine.slice(1).trim();
          if (imageText.match(/^(https?:\/\/|data:image\/)/)) {
            return `![](${imageText})`;
          }
          return `![${imageText}](${imageText})`;
        }

        return line;
      })
      .join("\n");
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

    const markdownContent = processContent(message.content || "");
    return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
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
