import React, { useState } from 'react';
import { Conversation } from '../../types/conversations';
import { sortConversations } from '~/utils/chat';
import { Modal, Tooltip } from 'antd';
import newchatIcon from '~/assets/icons/newchat.svg';
import { X, Trash2 } from 'lucide-react';

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

  const sortedConversations = sortConversations(conversations);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Tooltip title="New chat" placement="bottom">
              <button
                title="New chat"
                onClick={() => {
                  selectConversation(-1);
                  setShowConversationList(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#E5E7EB';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <img src={newchatIcon} alt="New Chat" style={{ width: 20, height: 20 }} />
              </button>
            </Tooltip>
            <Tooltip title="Close" placement="bottom">
              <button
                onClick={() => setShowConversationList(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.backgroundColor = '#E5E7EB';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <X color="#374151" size={20} />
              </button>
            </Tooltip>
          </div>
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
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedConversations.map((conversation, index) => {
                const isSelected = conversation.id === currentConversationId;
                return (
                  <div
                    key={conversation.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                      padding: '0 16px',
                      height: '40px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#fff' : '#f7f8fa',
                      color: isSelected ? '#111827' : '#6b7280',
                      border: isSelected ? '1px solid #0f172a' : 'none',
                      transition: 'all 0.18s',
                      outline: isSelected ? 'none' : undefined,
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
                        lineHeight: 1.5,
                      }}
                    >
                      {conversation.messages && conversation.messages.length > 0
                        ? conversation.messages[0].content?.slice(0, 200)
                        : 'New Chat'}
                    </span>
                    {index > 0 && (
                      <Tooltip title="Delete" placement="top">
                        <button
                          onClick={e => handleDeleteClick(conversation.id, e)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                          }}
                          onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = '#E5E7EB';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseOut={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
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
      <Modal
        open={!!confirmDelete}
        onCancel={handleCancelDelete}
        footer={
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            <button
              onClick={handleCancelDelete}
              style={{
                fontWeight: 500,
                fontSize: 15,
                padding: '9px 22px',
                borderRadius: 7,
                border: '1px solid #D1D5DB',
                color: '#111827',
                background: '#fff',
                cursor: 'pointer',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                handleConfirmDelete(confirmDelete as number, e)
              }
              style={{
                fontWeight: 600,
                fontSize: 15,
                padding: '9px 22px',
                borderRadius: 7,
                border: 'none',
                background: '#DC2626',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 8px 0 rgba(220,38,38,0.08)',
                transition: 'background 0.2s',
              }}
            >
              Delete
            </button>
          </div>
        }
        centered
        closable={false}
        width={300}
        styles={{
          mask: { background: 'rgba(0,0,0,0.18)' },
          content: { borderRadius: 24 },
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Delete Conversation</h3>
          <div style={{ fontSize: 17, color: '#374151', marginBottom: 28 }}>
            Are you sure you want to delete this conversation? This action cannot be undone.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConversationList;
