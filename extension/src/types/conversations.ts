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
  user_id: string;
  messages?: Message[];
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
  error?: string;
  data?: {
    id: string;
    user_id: string;
    created_at: string;
    status: string;
    title?: string;
  };
}

/**
 * Save message response from API
 */
export interface SaveMessageResponse {
  success: boolean;
  data?: {
    top_k_messages: number[];
  };
  error?: string;
}
