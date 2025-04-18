/**
 * Conversation Types
 * Defines all conversation-related interfaces used in the application
 */

import { Message } from "./messages";

/**
 * Conversation model
 */
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ConversationList component props
 */
export interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string, e: React.MouseEvent) => void;
  setShowConversationList: (show: boolean) => void;
}

/**
 * Create conversation response from API
 */
export interface CreateConversationResponse {
  success: boolean;
  data?: {
    id: string;
    title?: string;
  };
  error?: string;
}

/**
 * Save message response from API
 */
export interface SaveMessageResponse {
  success: boolean;
  data?: {
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    created_at: string;
  };
  error?: string;
}
