/**
 * Message Types
 * Defines all message-related interfaces used in the application
 */

import { WebInteractionResult } from './tools';

export interface ChatMessage {
  role?: 'user' | 'assistant' | 'system' | 'tool';
  content?: string;
  tool_call_id?: string; // toolcall
  name?: string; // toolcall
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
    result?: WebInteractionResult<unknown>;
  }>;
}

/**
 * Message type for chat display and processing
 */
export interface Message extends ChatMessage {
  id: number;
  created_at?: string;
  conversation_id: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type MessageType = Message;
export type MessageName = 'selected-text' | 'focus-input' | 'api-key-missing';
export interface MessageProps {
  message: Message;
}

export type RuntimeMessageName = 'ping' | 'execute-tool' | 'update-config' | MessageName;

export interface RuntimeMessage {
  name: RuntimeMessageName;
  body?:
    | {
        name: string;
        arguments: object;
      }
    | {
        key: string;
        value: string;
      };
}

export interface RuntimeResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}
