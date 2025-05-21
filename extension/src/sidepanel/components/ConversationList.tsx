import React, { useState } from 'react';
import { Conversation } from '../../types/conversations';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  selectConversation: (id: number) => void;
  deleteConversation: (id: number, e: React.MouseEvent) => void;
  setShowConversationList: (show: boolean) => void;
}

const ConversationList = ({
  conversations,
  currentConversationId,
  selectConversation,
  deleteConversation,
  setShowConversationList,
}: ConversationListProps) => {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const sortedConversations = conversations.sort((a, b) => {
    const aMessages = a.messages || [];
    const bMessages = b.messages || [];

    const aId = aMessages.length > 0 ? aMessages[aMessages.length - 1].id : a.id;
    const bId = bMessages.length > 0 ? bMessages[bMessages.length - 1].id : b.id;

    return bId - aId;
  });

  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const handleConfirmDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(id, e);
    setConfirmDelete(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      {/* 会话列表容器 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#ffffff',
          boxShadow: '0 0 15px 0 rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* 头部区域 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: '44px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>All Chats</h2>
          <button
            onClick={() => setShowConversationList(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <svg
              style={{ width: '20px', height: '20px' }}
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
            overflowY: 'auto',
            padding: '16px',
            height: 'calc(100vh - 44px)',
          }}
        >
          {sortedConversations && sortedConversations.length > 0 ? (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sortedConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor:
                      conversation.id === currentConversationId ? '#f3f4f6' : 'transparent',
                    color: conversation.id === currentConversationId ? '#111827' : '#4b5563',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    selectConversation(conversation.id);
                    setShowConversationList(false);
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '14px',
                      lineHeight: '1.5',
                    }}
                  >
                    {conversation.messages && conversation.messages.length > 0
                      ? conversation.messages[0].content?.slice(0, 200)
                      : 'New Chat'}
                  </span>
                  {index > 0 && (
                    <button
                      onClick={e => handleDeleteClick(conversation.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#6b7280';
                      }}
                    >
                      <svg
                        style={{ width: '18px', height: '18px' }}
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
                  )}
                </div>
              ))}
            </nav>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100vh - 200px)',
              }}
            >
              <p style={{ fontSize: '14px', color: '#6b7280' }}>No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={handleCancelDelete}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: '32px 32px 24px 32px',
              minWidth: 340,
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '90%',
              maxWidth: '400px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              Delete Conversation
            </h3>
            <div
              style={{
                fontSize: 15,
                color: '#374151',
                marginBottom: 28,
                textAlign: 'center',
              }}
            >
              Are you sure you want to delete this conversation? This action cannot be undone.
            </div>
            <div
              style={{
                display: 'flex',
                gap: 16,
              }}
            >
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '9px 22px',
                  borderRadius: 7,
                  border: '1px solid #D1D5DB',
                  background: '#fff',
                  color: '#111827',
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'background 0.2s, border 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={e => handleConfirmDelete(confirmDelete, e)}
                style={{
                  padding: '9px 22px',
                  borderRadius: 7,
                  border: 'none',
                  background: '#DC2626',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px 0 rgba(220,38,38,0.08)',
                  transition: 'background 0.2s',
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
