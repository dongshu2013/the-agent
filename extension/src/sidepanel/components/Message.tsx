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

  console.log("isUser🍷", isUser);

  return (
    <div className="mb-4">
      {/* 用户消息靠右，AI消息靠左 */}
      <div
        style={{
          display: "flex",
          justifyContent: isUser ? "flex-end" : "flex-start",
          // backgroundColor: isUser ? "#a4f4fd" : "#fff",
        }}
      >
        {/* AI头像只在AI消息时显示，且在左侧 */}
        {!isUser && (
          <div className="flex-shrink-0 mr-2">
            <img src={aiIcon} alt="AI" className="w-6 h-6" />
          </div>
        )}

        {/* 消息内容容器 */}
        <div
          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
        >
          {/* 消息内容 */}
          <div
            className={`inline-block max-w-[80%] px-4 py-2 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
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
