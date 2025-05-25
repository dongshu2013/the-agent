import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../style.css';
import Header from './components/Header';
import Message from './components/Message';
import InputArea from './components/InputArea';
import ConversationList from './components/ConversationList';
import {
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  syncConversations,
  createNewConversation,
} from '../services/conversation';
import { db, UserInfo } from '~/utils/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChatHandler } from '../services/chat-handler';
import LoginModal from './components/LoginModal';
import Thinking from './components/Thinking';
import { APIError } from '@the-agent/shared';
import { ApiKey, ChatStatus } from '~/types';
import { API_KEY_TAG } from '~/services/cache';
import { getUserInfo, isEqualApiKey, parseApiKey } from '~/utils/user';
import Home from './Home';

const Sidepanel = () => {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [prompt, setPrompt] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<number>(-1);
  const [showConversationList, setShowConversationList] = useState(false);
  const [status, setStatus] = useState<ChatStatus>('uninitialized');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHandler, setChatHandler] = useState<ChatHandler | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  const messages =
    useLiveQuery(
      () =>
        currentConversationId !== -1 ? db.getMessagesByConversation(currentConversationId) : [],
      [currentConversationId]
    ) ?? [];

  const lastMessageVersion =
    useLiveQuery(() => {
      if (currentConversationId === -1) return 0;
      return db.getLastMessageVersion(currentConversationId);
    }, [currentConversationId]) ?? 0;

  const conversations =
    useLiveQuery(
      () => (currentUser && currentUser.id ? db.getAllConversations(currentUser.id) : []),
      [currentUser?.id]
    ) ?? [];

  const handleApiError = useCallback(
    (error: unknown) => {
      if (error instanceof APIError) {
        if (error.status === 401 || error.status === 403) {
          setApiKey(
            apiKey
              ? {
                  key: apiKey.key,
                  enabled: false,
                }
              : null
          );
          db.saveMessage({
            id: Date.now(),
            content: 'API key is disabled',
            conversation_id: currentConversationId || -1,
            role: 'error',
          });
          return;
        } else if (error.status === 402) {
          db.saveMessage({
            id: Date.now(),
            content: 'Insufficient credits. Please add more credits to your account.',
            conversation_id: currentConversationId || -1,
            role: 'error',
          });
          return;
        }
      }
      let message = 'An error occurred. Please try again.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      db.saveMessage({
        id: Date.now(),
        content: message,
        conversation_id: currentConversationId || -1,
        role: 'error',
      });
    },
    [currentConversationId, apiKey, setApiKey]
  );

  const refreshConversations = useCallback(
    async (userId: string) => {
      try {
        if (currentConversationId !== -1) {
          return;
        }
        await syncConversations(userId);
        const conversations = await db.getAllConversations(userId);
        if (conversations && conversations.length > 0) {
          setTimeout(() => {
            setCurrentConversationId(conversations[0].id);
          }, 100);
        } else {
          const newConv = await createNewConversation(userId);
          setTimeout(() => {
            setCurrentConversationId(newConv.id);
          }, 100);
        }
      } catch (error) {
        handleApiError(error);
      }
    },
    [handleApiError, setCurrentConversationId]
  );

  const initializeUserAndData = useCallback(
    async (apiKeyToUse: ApiKey) => {
      try {
        if (!apiKeyToUse.enabled) {
          throw new Error('API key is disabled');
        }

        const existingUser = await db.getUserByApiKey(apiKeyToUse.key);
        if (existingUser) {
          refreshConversations(existingUser.id);
          setCurrentUser(existingUser);
          setLoginModalOpen(false);
          return;
        }

        const userInfo = await getUserInfo(apiKeyToUse);
        await db.initModels(userInfo.id);
        await db.saveOrUpdateUser(userInfo);
        setCurrentUser(userInfo);
        refreshConversations(userInfo.id);
        setLoginModalOpen(false);
      } catch (error) {
        handleApiError(error);
      }
    },
    [handleApiError, refreshConversations]
  );

  useEffect(() => {
    const listener = async (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      // Only respond to external changes, not our own writes
      if (area === 'local' && changes[API_KEY_TAG]) {
        const oldApiKey = parseApiKey(changes[API_KEY_TAG].oldValue);
        const newApiKey = parseApiKey(changes[API_KEY_TAG].newValue);

        // Skip if no actual change
        if (!isEqualApiKey(oldApiKey, newApiKey)) {
          setApiKey(newApiKey);
          if (newApiKey?.enabled) {
            setShowSwitch(true);
            await initializeUserAndData(newApiKey);
          } else {
            setLoginModalOpen(true);
          }
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [setApiKey, setShowSwitch, initializeUserAndData, setLoginModalOpen]);

  useEffect(() => {
    const handleMessages = (request: { name: string; text?: string }) => {
      if (request.name === 'selected-text' && request.text) {
        setPrompt(request.text);
      }
      if (request.name === 'focus-input') {
        const inputElement = document.querySelector('textarea');
        inputElement?.focus();
      }
      if (request.name === 'api-key-missing') {
        setLoginModalOpen(true);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessages);
    return () => chrome.runtime.onMessage.removeListener(handleMessages);
  }, [setPrompt, setLoginModalOpen]);

  useEffect(() => {
    const handler = () => {
      setLoginModalOpen(true);
    };
    window.addEventListener('SHOW_LOGIN_MODAL', handler);
    return () => window.removeEventListener('SHOW_LOGIN_MODAL', handler);
  }, [setLoginModalOpen]);

  useEffect(() => {
    if (apiKey?.enabled && currentConversationId) {
      setChatHandler(
        new ChatHandler({
          apiKey: apiKey,
          currentConversationId,
          onError: handleApiError,
          onStatusChange: status => {
            setStatus(status);
          },
          onMessageUpdate: async message => {
            await db.saveMessage(message);
          },
        })
      );
    }
  }, [apiKey, currentConversationId, setLoginModalOpen, handleApiError]);

  // 自动滚动到底部
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToBottom();
  }, [messages.length, lastMessageVersion]);

  // 事件处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !chatHandler) return;

    const currentPrompt = prompt.trim();
    setPrompt('');
    await chatHandler.handleSubmit(currentPrompt);
  };

  const abort = useCallback(() => {
    chatHandler?.abort();
  }, [chatHandler]);

  const toggleConversationList = async (value?: boolean) => {
    const willShow = value !== undefined ? value : !showConversationList;
    setShowConversationList(willShow);
  };

  const handleSelectConversation = async (id: number) => {
    if (id === -1) {
      await handleCreateNewConversation();
      return;
    }

    try {
      const conversation = await selectConv(id);
      if (conversation) {
        setCurrentConversationId(id);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConv(id);
      if (id === currentConversationId) {
        const remaining = conversations?.filter(c => c.id !== id);
        if (remaining?.length > 0) {
          const conversation = await selectConv(remaining[0].id);
          if (conversation) {
            setCurrentConversationId(remaining[0].id);
          }
        } else {
          if (currentUser?.id) {
            const newConv = await createNewConversation(currentUser.id);
            setCurrentConversationId(newConv.id);
          }
        }
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleCreateNewConversation = async () => {
    try {
      if (currentUser?.id) {
        const newConv = await createNewConversation(currentUser.id);
        setCurrentConversationId(newConv.id);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  // Initialize state from storage - run only once on mount
  useEffect(() => {
    const initializeFromStorage = async () => {
      chrome.storage.local.get([API_KEY_TAG, 'currentConversationId'], result => {
        const convId = result['currentConversationId'] || -1;
        setCurrentConversationId(convId);

        const storedApiKey = parseApiKey(result[API_KEY_TAG]);
        if (storedApiKey) {
          setApiKey(storedApiKey);
        }

        if (!storedApiKey?.enabled) {
          setLoginModalOpen(true);
        } else {
          initializeUserAndData(storedApiKey);
          setStatus('idle');
        }
      });
    };

    // Only run this effect once on mount
    if (status === 'uninitialized') {
      initializeFromStorage();
    }
  }); // Empty dependency array - only run once

  // Debounced storage updates for apiKey
  useEffect(() => {
    if (!apiKey) return;

    const timer = setTimeout(() => {
      chrome.storage.local.set({ [API_KEY_TAG]: apiKey });
    }, 1000);

    return () => clearTimeout(timer);
  }, [apiKey]);

  // Debounced storage updates for currentConversationId
  useEffect(() => {
    if (currentConversationId === -1) return;

    const timer = setTimeout(() => {
      chrome.storage.local.set({ currentConversationId });
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentConversationId]);

  if (!currentUser) {
    return <Home />;
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          zIndex: 10,
        }}
      >
        <Header
          createNewConversation={handleCreateNewConversation}
          setShowConversationList={() => toggleConversationList()}
          user={currentUser}
        />
      </div>

      {/* Messages Area */}
      <div
        style={{
          position: 'absolute',
          top: '44px',
          bottom: '90px',
          left: 0,
          right: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div className="max-w-3xl mx-auto p-4">
          {messages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '120px 24px',
                minHeight: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: '480px',
                  textAlign: 'center',
                }}
              >
                <h3
                  style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '16px',
                    lineHeight: '1.3',
                  }}
                >
                  Ask anything. Automate everything.
                </h3>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    lineHeight: '1.6',
                    marginBottom: !apiKey ? '32px' : '0',
                  }}
                >
                  Start typing — your AI agent is here to help.
                </p>
                {!apiKey && (
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#9ca3af',
                      maxWidth: '400px',
                      lineHeight: '1.5',
                    }}
                  >
                    You haven&apos;t set up your API key yet. Please login to your web account to
                    get started.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{ paddingBottom: '32px' }}>
              {messages.map((message, index) => {
                const isLast =
                  (index === messages.length - 1 && message.role === 'assistant') ||
                  message.role === 'error';
                return (
                  <Message
                    key={`${message.id}-${message.version}-${isLast}-${status}`}
                    message={message}
                    isLatestResponse={isLast}
                    status={status}
                  />
                );
              })}
              {status === 'waiting' && (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <Thinking />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          zIndex: 10,
        }}
      >
        <InputArea
          prompt={prompt}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          status={status}
          abort={abort}
        />
      </div>

      {/* Conversation List */}
      {showConversationList && (
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          selectConversation={handleSelectConversation}
          deleteConversation={handleDeleteConversation}
          setShowConversationList={(show: boolean) => toggleConversationList(show)}
        />
      )}

      <LoginModal
        open={loginModalOpen}
        isSwitch={false}
        text={apiKey && !apiKey.enabled ? 'Enable Your Mysta API Key' : 'Sign In with Mysta Web'}
        currentUser={currentUser}
      />
      <LoginModal
        open={showSwitch}
        isSwitch={true}
        currentUser={currentUser}
        onClose={async () => {
          // First stop streaming and hide the switch modal
          if (chatHandler) {
            chatHandler.abort();
          }
          setShowSwitch(false);
        }}
      />
    </div>
  );
};

export default Sidepanel;
