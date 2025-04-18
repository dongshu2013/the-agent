/**
 * API Types
 * Defines all API-related interfaces used in the application
 */

import {
  CreateConversationResponse,
  SaveMessageResponse,
} from "./conversations";
import { Message } from "./messages";

/**
 * Chat request interface
 */
export interface ChatRequest {
  model?: string;
  messages: Message[];
  max_tokens?: number;
  stream?: boolean;
  tools?: any[];
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
