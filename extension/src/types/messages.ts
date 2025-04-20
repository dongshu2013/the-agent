/**
 * Message Types
 * Defines all message-related interfaces used in the application
 */

/**
 * Message type for chat display and processing
 */
export interface Message {
  message_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string;
  isLoading?: boolean;
  status?: "pending" | "completed" | "error";
  conversation_id?: string;
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
