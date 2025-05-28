/**
 * API Types
 * Defines all API-related interfaces used in the application
 */

import { ChatMessage, Message } from '@the-agent/shared';
import { Model } from '.';
import { ApiKey } from './settings';
export type ChatStatus = 'uninitialized' | 'idle' | 'waiting' | 'streaming' | 'calling_tool';

/**
 * Chat request interface
 */
export interface ChatRequest {
  model: Model | null;
  messages: ChatMessage[];
}

export interface ChatHandlerOptions {
  apiKey: ApiKey | null;
  currentConversationId: number;
  onStatusChange: (status: ChatStatus) => void;
  onError: (error: unknown) => void;
  onMessageUpdate: (message: Message) => void;
}
