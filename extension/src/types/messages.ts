/**
 * Message Types
 * Defines all message-related interfaces used in the application
 */

export interface ChatMessage {
  role?: "user" | "assistant" | "system" | "tool";
  content?: string;
  toolCallId?: string; // toolcall
  tool_call_id?: string; // toolcall
  name?: string; // toolcall
  toolCalls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
    result: {
      data: any;
      success: boolean;
    };
  }>;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
    result: {
      data: any;
      success: boolean;
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
export type MessageName = "selected-text" | "focus-input" | "api-key-missing";

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
