import React, { useState } from "react";
import { Conversation } from "../../types/conversations";

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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const handleConfirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id, e);
    setConfirmDelete(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      {/* 会话列表容器 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ffffff",
          boxShadow: "0 0 15px 0 rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {/* 头部区域 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
            All Chats
          </h2>
          <button
            onClick={() => setShowConversationList(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <svg
              style={{ width: "20px", height: "20px" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 会话列表内容 */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            height: "calc(100vh - 65px)",
          }}
        >
          {conversations && conversations.length > 0 ? (
            <nav
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor:
                      conversation.id === currentConversationId
                        ? "rgba(37, 99, 235, 0.1)"
                        : "transparent",
                    color:
                      conversation.id === currentConversationId
                        ? "#2563eb"
                        : "#4b5563",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    const deleteButton =
                      e.currentTarget.querySelector("button");
                    if (deleteButton) {
                      deleteButton.style.opacity = "1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const deleteButton =
                      e.currentTarget.querySelector("button");
                    if (deleteButton) {
                      deleteButton.style.opacity = "0";
                    }
                  }}
                  onClick={() => {
                    selectConversation(conversation.id);
                    setShowConversationList(false);
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {conversation.messages.length > 0
                      ? conversation.messages[0].content
                      : "New Chat"}
                  </span>
                  <button
                    onClick={(e) => handleDeleteClick(conversation.id, e)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "4px",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#6b7280",
                      cursor: "pointer",
                      opacity: 0,
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#6b7280";
                    }}
                  >
                    <svg
                      style={{ width: "18px", height: "18px" }}
                      viewBox="0 0 20 20"
                      fill="currentColor"
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100vh - 200px)",
              }}
            >
              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                No conversations yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              width: "90%",
              maxWidth: "400px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "12px",
              }}
            >
              Delete Conversation
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#4b5563",
                marginBottom: "20px",
              }}
            >
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#e5e7eb",
                  border: "none",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleConfirmDelete(confirmDelete, e)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  backgroundColor: "#ef4444",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
