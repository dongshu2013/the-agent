import { Message } from '@the-agent/shared';

export interface GraphContext {
  type: string;
  content: string;
}

export interface GraphRelationship {
  type: string;
  target: string;
}

export interface MessageWithContext extends Message {
  context?: GraphContext[];
}

export interface SearchParams {
  query: string;
  limit?: number;
  depth?: number;
}

export interface SaveMessageParams {
  message: Message;
  conversationId: string;
}

export interface UpdateGraphParams {
  message: Message;
  type: string;
  relationships: GraphRelationship[];
}
