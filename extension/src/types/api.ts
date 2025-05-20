/**
 * API Types
 * Defines all API-related interfaces used in the application
 */

import { ChatMessage } from '@the-agent/shared';
import { Model } from '.';

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
