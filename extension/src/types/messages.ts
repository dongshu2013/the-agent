/**
 * Message Types
 * Defines all message-related interfaces used in the application
 */

/**
 * Message type for chat display and processing
 */
export interface Message {
  id?: string;
  role: string;
  content: string;
  timestamp?: Date;
  isLoading?: boolean;
  type?: string; // Used for error messages
}

/**
 * Legacy type alias for Message - will be phased out
 * @deprecated Use Message instead
 */
export type MessageType = Message;

/**
 * Chat message for IndexedDB storage
 */
export interface ChatMessage {
  id?: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  conversationId: string;
  status?: "pending" | "completed" | "error";
}

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
