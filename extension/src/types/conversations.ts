import { Conversation as C } from '@the-agent/shared';

/**
 * Conversation model
 */
export interface Conversation extends C {
  title: string;
  user_id: string;
}

/**
 * ConversationList component props
 */
export interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  selectConversation: (id: number) => void;
  deleteConversation: (id: number, e: React.MouseEvent) => void;
  setShowConversationList: (show: boolean) => void;
}
