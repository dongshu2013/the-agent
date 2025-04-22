/**
 * API Types
 * Defines all API-related interfaces used in the application
 */

import {
  CreateConversationResponse,
  SaveMessageResponse,
} from "./conversations";
import { ChatMessage } from "./messages";

/**
 * Chat request interface
 */
export interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
  top_k_related?: number;
}

/**
 * Chat response interface
 */
export interface ChatResponse {
  success: boolean;
  data?: any;
  error?: string;
  tool_calls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
}

/**
 * Memory generation options
 */
export interface MemoryOptions {
  strategy?: number;
  systemPrompt?: string;
}

/**
 * Tool call result interface
 */
export interface ToolCallResult {
  toolName: string;
  toolInput: Record<string, any>;
  toolOutput: any;
  error?: string;
}

/**
 * API service exports
 */
export type { CreateConversationResponse, SaveMessageResponse };
