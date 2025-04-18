import { MessageType } from "../../services/chat";

// @ts-ignore
import aiIcon from "data-base64:../../../assets/icon.png";
import LoadingBrain from "./LoadingBrain";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const isLoading = message.isLoading === true;
  const isError = message.role === "error";

  return (
    <div style={{ marginBottom: "16px" }}>
      {/* 用户消息靠右，AI消息靠左 */}
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          marginLeft: isUser ? "20%" : "0",
          marginRight: !isUser ? "20%" : "0",
        }}
      >
        {/* AI头像只在AI消息时显示，且在左侧 */}
        {!isUser && !isError && (
          <div style={{ flexShrink: 0, marginRight: "8px" }}>
            <img
              src={aiIcon}
              alt="AI"
              style={{ width: "24px", height: "24px" }}
            />
          </div>
        )}

        {/* 消息内容容器 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            maxWidth: "100%",
          }}
        >
          {/* 消息内容 */}
          <div
            style={{
              display: "inline-block",
              maxWidth: "100%",
              padding: "10px 16px",
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
        </div>
      </div>
    </div>
  );
}
