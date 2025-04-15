import React from "react";
import { Conversation } from "../../services/chat";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  createNewConversation: () => void;
  setShowConversationList: (value: boolean) => void;
  darkMode: boolean;
}

const ConversationList = ({
  conversations,
  currentConversationId,
  selectConversation,
  deleteConversation,
  createNewConversation,
  setShowConversationList,
  darkMode,
}: ConversationListProps) => {
  // 格式化日期
  const formatDate = (date: Date): string => {
    const now = new Date();
    const conversationDate = new Date(date);

    // 如果是今天，显示时间
    if (
      now.getFullYear() === conversationDate.getFullYear() &&
      now.getMonth() === conversationDate.getMonth() &&
      now.getDate() === conversationDate.getDate()
    ) {
      return conversationDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // 如果是昨天，显示"昨天"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      yesterday.getFullYear() === conversationDate.getFullYear() &&
      yesterday.getMonth() === conversationDate.getMonth() &&
      yesterday.getDate() === conversationDate.getDate()
    ) {
      return "昨天";
    }

    // 否则显示日期
    return conversationDate.toLocaleDateString();
  };

  return (
    <div className="absolute inset-0 z-30 flex">
      {/* 会话侧边栏 */}
      <div
        className={`w-72 h-full border-r flex flex-col ${
          darkMode
            ? "bg-[#1a1b26] border-gray-700 text-gray-200"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      >
        <div
          className={`px-4 py-3 flex justify-between items-center border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            onClick={createNewConversation}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 ${
              darkMode
                ? "bg-[#24283b] hover:bg-[#292e42] text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span className="text-sm font-medium">new chat</span>
          </button>
          <button
            onClick={() => setShowConversationList(false)}
            className={`p-2 rounded-md ${
              darkMode
                ? "bg-[#24283b] hover:bg-[#292e42]"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations && conversations.length > 0 ? (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center group gap-2 p-2 rounded-md cursor-pointer ${
                    conv.id === currentConversationId
                      ? darkMode
                        ? "bg-gray-800"
                        : "bg-gray-100"
                      : darkMode
                        ? "hover:bg-gray-900"
                        : "hover:bg-gray-50"
                  }`}
                  onClick={() => selectConversation(conv.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 flex-shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                  <div className="flex-1 flex justify-between items-center">
                    <div className="truncate text-sm flex-1">{conv.title}</div>
                    <div className="text-xs text-gray-500 ml-1 flex-shrink-0">
                      {formatDate(new Date(conv.updatedAt))}
                    </div>
                  </div>
                  <button
                    className={`opacity-0 group-hover:opacity-100 ${
                      darkMode ? "hover:text-red-400" : "hover:text-red-500"
                    }`}
                    onClick={(e) => deleteConversation(conv.id, e)}
                    aria-label="删除会话"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-4 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No conversation
            </div>
          )}
        </div>
      </div>

      {/* 用于在移动端关闭侧边栏的背景蒙层 */}
      <div
        className="flex-1 bg-black bg-opacity-10"
        onClick={() => setShowConversationList(false)}
      ></div>
    </div>
  );
};

export default ConversationList;
