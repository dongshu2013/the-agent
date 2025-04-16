import React from "react";
import { Message as MessageType } from "../../services/chat";

// @ts-ignore
import aiIcon from "data-base64:../../../assets/icon.png";

interface MessageProps {
  message: MessageType;
}

const Message = ({ message }: MessageProps) => {
  const isAssistant = message.type === "assistant";

  return (
    <div className={`py-6 ${isAssistant ? "bg-white" : "bg-gray-50"}`}>
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
                <div className="whitespace-pre-wrap text-gray-900">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-row-reverse w-full">
            <div className="bg-gray-50 p-3 rounded-lg max-w-[80%]">
              <div className="whitespace-pre-wrap text-gray-900">
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
