import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStorage } from '@plasmohq/storage/hook';
import '../style.css';
import Header from './components/Header';
import Message from './components/Message';
import InputArea from './components/InputArea';
import ConversationList from './components/ConversationList';
import {
  createNewConversation,
  selectConversation as selectConv,
  deleteConversation as deleteConv,
  getConversations,
  createNewConversationByUserId,
} from '../services/conversation';
import { db, UserInfo } from '~/utils/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChatHandler } from '../services/chat-handler';
import { env } from '~/utils/env';
import LoginModal from './components/LoginModal';
import LoadingBrain from './components/LoadingBrain';
import { APIClient, APIError } from '@the-agent/shared';
import { ApiKey } from '~/types';
import { API_KEY_TAG } from '~/services/cache';

const Sidepanel = () => {
  const [apiKey, setApiKeyState] = useStorage<ApiKey | null>(API_KEY_TAG, null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [currentConversationId, setCurrentConversationId] = useStorage<number | null>(
    'currentConversationId',
    null
  );
  const [showConversationList, setShowConversationList] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHandler, setChatHandler] = useState<ChatHandler | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  // 数据查询
  const messages =
    useLiveQuery(
      () => (currentConversationId ? db.getMessagesByConversation(currentConversationId) : []),
      [currentConversationId]
    ) ?? [];

  const conversations =
    useLiveQuery(
      () => (currentUser && currentUser.id ? db.getAllConversations(currentUser.id) : []),
      [currentUser?.id]
    ) ?? [];

  const handleApiError = useCallback(
    (error: unknown) => {
      if (error instanceof APIError) {
        if (error.status === 401 || error.status === 403) {
          setApiKeyState(
            apiKey
              ? {
                  key: apiKey.key,
                  enabled: false,
                }
              : null
          );
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
    [currentConversationId, apiKey, setApiKeyState]
  );

  // Function to refresh and initialize conversations
  const refreshConversations = useCallback(
    async (userId: string) => {
      try {
        // Temporarily clear conversation ID to force message refresh
        setCurrentConversationId(null);

        // Get fresh conversations for this user
        const freshConversations = await db.getAllConversations(userId);

        // Select first conversation or create new one
        if (freshConversations && freshConversations.length > 0) {
          // Small delay to ensure state updates properly
          setTimeout(() => {
            setCurrentConversationId(freshConversations[0].id);
          }, 100);
        } else {
          // If no conversations, create a new one
          const newConv = await createNewConversationByUserId(userId);
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
        setIsLoading(true);
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

        const client = new APIClient({
          baseUrl: env.BACKEND_URL,
          apiKey: apiKeyToUse.key,
        });
        const user = await client.getUser();
        const now = new Date().toISOString();
        const userInfo = {
          id: user.id,
          email: user.email,
          api_key_enabled: apiKeyToUse.enabled,
          api_key: apiKeyToUse.key,
          credits: user.balance.toString(),
          created_at: now,
          updated_at: now,
          selectedModelId: 'system',
        };
        await db.initModels(user.id);
        await db.saveOrUpdateUser(userInfo);
        setCurrentUser(userInfo);
        refreshConversations(userInfo.id);
        setLoginModalOpen(false);
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleApiError, refreshConversations]
  );

  useEffect(() => {
    const listener = async (
      changes: { [key: string]: chrome.storage.StorageChange },
      area: string
    ) => {
      if (area === 'local' && changes[API_KEY_TAG]) {
        let newApiKey: ApiKey | null = null;
        if (typeof changes[API_KEY_TAG].newValue === 'string') {
          newApiKey = JSON.parse(changes[API_KEY_TAG].newValue);
        } else {
          newApiKey = changes[API_KEY_TAG].newValue;
        }
        setApiKeyState(newApiKey);
        if (!newApiKey) {
          setLoginModalOpen(true);
          return;
        }

        if (newApiKey.enabled) {
          setShowSwitch(true);
          await initializeUserAndData(newApiKey);
        } else {
          setLoginModalOpen(true);
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
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
    const handler = () => {
      setLoginModalOpen(true);
    };
    window.addEventListener('SHOW_LOGIN_MODAL', handler);
    return () => {
      chrome.storage.onChanged.removeListener(listener);
      chrome.runtime.onMessage.removeListener(handleMessages);
      window.removeEventListener('SHOW_LOGIN_MODAL', handler);
    };
  }, [initializeUserAndData, setLoginModalOpen, setShowSwitch, setCurrentUser, setApiKeyState]);

  useEffect(() => {
    if (apiKey?.enabled && currentConversationId) {
      setChatHandler(
        new ChatHandler({
          apiKey: apiKey,
          currentConversationId,
          onError: handleApiError,
          onStreamStart: () => {
            setIsLoading(true);
            setIsStreaming(true);
          },
          onStreamEnd: () => {
            setIsLoading(false);
            setIsStreaming(false);
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
  }, [messages.length]);

  // 事件处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !chatHandler) return;

    const currentPrompt = prompt.trim();
    setPrompt('');
    await chatHandler.handleSubmit(currentPrompt);
  };

  const handlePauseStream = useCallback(() => {
    chatHandler?.stopStreaming();
  }, [chatHandler]);

  const toggleConversationList = async (value?: boolean) => {
    const willShow = value !== undefined ? value : !showConversationList;

    if (willShow) {
      try {
        setIsLoading(true);
        if (!conversations || conversations.length === 0) {
          await getConversations(apiKey?.key || '');
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    }

    setShowConversationList(willShow);
  };

  const handleSelectConversation = async (id: number) => {
    if (isLoading) return;

    if (id === -1) {
      await handleCreateNewConversation();
      return;
    }

    setIsLoading(true);
    try {
      const conversation = await selectConv(id);
      if (conversation) {
        setCurrentConversationId(id);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
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
          const newConv = await createNewConversation(apiKey?.key || '');
          setCurrentConversationId(newConv.id);
        }
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewConversation = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newConv = await createNewConversation(apiKey?.key || '');
      setCurrentConversationId(newConv.id);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async (apiKey: ApiKey) => {
      if (isInitialized) {
        return;
      }
      await initializeUserAndData(apiKey);
      setIsInitialized(true);
    };
    chrome.storage.local.get(API_KEY_TAG, result => {
      let apiKey: ApiKey | null = null;
      if (result[API_KEY_TAG]) {
        if (typeof result[API_KEY_TAG] === 'string') {
          apiKey = JSON.parse(result[API_KEY_TAG]);
        } else {
          apiKey = result[API_KEY_TAG];
        }
        setApiKeyState(apiKey);
      }
      if (!apiKey?.enabled) {
        setLoginModalOpen(true);
      } else {
        initializeApp(apiKey);
      }
    });
  }, [setLoginModalOpen, initializeUserAndData, setIsInitialized, isInitialized, setApiKeyState]);

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
          borderBottom: '1px solid #f0f0f0',
          zIndex: 10,
        }}
      >
        <Header
          createNewConversation={handleCreateNewConversation}
          setShowConversationList={() => toggleConversationList()}
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
              {messages.map((message, index) => (
                <Message
                  key={message.id || index}
                  message={message}
                  isLatestResponse={index === messages.length - 1 && message.role === 'assistant'}
                />
              ))}
              {isStreaming && (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <LoadingBrain />
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
          isLoading={isLoading}
          isStreaming={isStreaming}
          onPauseStream={handlePauseStream}
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
            chatHandler.stopStreaming();
          }
          setShowSwitch(false);
        }}
      />
    </div>
  );
};

export default Sidepanel;
