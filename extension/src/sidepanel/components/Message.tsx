import React from "react";
import { Message as MessageType } from "../../services/chat";

// @ts-ignore
import aiIcon from "data-base64:../../../assets/icon.png";

interface MessageProps {
  message: MessageType;
  darkMode: boolean;
}

const Message = ({ message, darkMode }: MessageProps) => {
  const isAssistant = message.type === "assistant";

  // 根据深色模式设置样式
  const theme = darkMode
    ? {
        userBg: "bg-[#24283b]",
        botBg: "bg-[#292e42]",
        text: "text-gray-50",
      }
    : {
        userBg: "bg-gray-50",
        botBg: "bg-white",
        text: "text-gray-900",
      };

  return (
    <div className={`py-6 ${isAssistant ? theme.botBg : theme.userBg}`}>
      <div className="max-w-3xl mx-auto px-4">
        {isAssistant ? (
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center overflow-hidden bg-white">
                <img
                  src={aiIcon}
                  alt="AI助手"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0 max-w-[90%] w-full">
              <div className="prose max-w-none">
                <div className={`whitespace-pre-wrap ${theme.text}`}>
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-row-reverse w-full">
            <div
              className={`${
                darkMode ? theme.userBg : "bg-gray-50"
              } p-3 rounded-lg max-w-[80%]`}
            >
              <div className={`whitespace-pre-wrap ${theme.text}`}>
                {message.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
