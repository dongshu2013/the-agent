/**
 * API Types
 * Defines all API-related interfaces used in the application
 */

import { ChatMessage } from '@the-agent/shared';
import { Model } from '.';

export type ChatStatus = 'uninitialized' | 'idle' | 'waiting' | 'streaming' | 'calling_tool';

/**
 * Chat request interface
 */
export interface ChatRequest {
  model: Model | null;
  messages: ChatMessage[];
}
