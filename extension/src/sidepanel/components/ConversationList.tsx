import React from "react";
import { Conversation } from "../../services/chat";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  setShowConversationList: (show: boolean) => void;
}

const ConversationList = ({
  conversations,
  currentConversationId,
  selectConversation,
  deleteConversation,
  setShowConversationList,
}: ConversationListProps) => {
  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩，点击关闭会话列表 */}
      <div
        className="absolute inset-0 bg-black/20 cursor-pointer"
        onClick={() => setShowConversationList(false)}
      />

      {/* 会话列表容器 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[300px] shadow-xl rounded-r-lg border-r border-gray-200 z-10"
        style={{
          backgroundColor: "#fff",
          top: "50px",
          bottom: "150px",
          height: "auto",
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex-1"
            style={{
              backgroundColor: "#fff",
              boxShadow: "0 0 15px 0 rgba(0, 0, 0, 0.15)",
              borderRight: "1px solid rgba(0, 0, 0, 0.1)",
              overflowY: "auto",
              height: "100%",
            }}
          >
            {conversations && conversations.length > 0 ? (
              <nav className="px-2 pb-6 pt-2 space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`group flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer active:scale-98 transition-transform ${
                      conversation.id === currentConversationId
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => selectConversation(conversation.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-blue-600 flex-shrink-0"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="truncate flex-1">
                      {conversation.messages.length > 0
                        ? conversation.messages[0].content
                        : "New Chat"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conversation.id, e);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-700 active:scale-95 transition-transform z-20 ml-auto"
                      aria-label="Delete conversation"
                      style={{ background: "none", border: "none", padding: 0 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </nav>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-sm text-gray-500">No conversations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
