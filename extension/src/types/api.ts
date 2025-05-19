/**
 * API Types
 * Defines all API-related interfaces used in the application
 */

import { Model } from '.';
import { CreateConversationResponse, SaveMessageResponse } from './conversations';
import { ChatMessage } from './messages';

/**
 * Chat request interface
 */
export interface ChatRequest {
  currentModel: Model | null;
  messages: ChatMessage[];
}

/**
 * Memory generation options
 */
export interface MemoryOptions {
  strategy?: number;
  systemPrompt?: string;
}

/**
 * API service exports
 */
export type { CreateConversationResponse, SaveMessageResponse };
