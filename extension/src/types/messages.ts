/**
 * Message Types
 * Defines all message-related interfaces used in the application
 */

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
    result?: {
      success: boolean;
      data?: object;
      error?: string;
    };
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

/**
 * Legacy type alias for Message - will be phased out
 * @deprecated Use Message instead
 */
export type MessageType = Message;

/**
 * Message name for internal message passing
 */
export type MessageName = 'selected-text' | 'focus-input' | 'api-key-missing';

/**
 * Process request message
 */
export interface ProcessRequestMessage {
  name: MessageName;
  body: {
    apiKey?: string;
    request: string;
  };
}

/**
 * Process request response
 */
export interface ProcessRequestResponse {
  error?: string;
  result?: string;
}

/**
 * Message component props
 */
export interface MessageProps {
  message: Message;
}

/**
 * Runtime message types for background script
 */
export type RuntimeMessageName = 'ping' | 'execute-tool' | 'update-config' | MessageName;

export interface RuntimeMessage {
  name: RuntimeMessageName;
  body?:
    | {
        name: string;
        arguments: any;
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
