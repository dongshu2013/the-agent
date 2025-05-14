export interface TextMessage {
  type: 'text';
  text: {
    value: string;
    annotations?: string[] | null;
  };
}

export interface ImageMessage {
  type: 'image';
  image_url: {
    url: string;
  };
}

export type AgentMessage = TextMessage | ImageMessage;

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
  type?: string;
  result?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: string;
  content?: AgentMessage[];
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface Conversation {
  id: number;
  messages: Message[];
}

// Interface for chat sync data
export interface TelegramChatData {
  chat_id: string;
  chat_title: string;
  chat_type: string;
  is_public: boolean;
  is_free: boolean;
  subscription_fee: number;
}

// Interface for message data
export interface TelegramMessageData {
  message_id: string;
  message_text: string;
  message_timestamp: number;
  sender_id: string;
  sender_username: string | null;
  sender_firstname: string | null;
  sender_lastname: string | null;
}

// Interface for chat info in responses
export interface TgChatInfo {
  id: string;
  chat_id: string;
  chat_title: string;
  chat_type: string;
  is_public: boolean;
  is_free: boolean;
}

// Interface for message info in responses
export interface TgMessageInfo {
  id: string;
  message_id: string;
  message_text: string;
  message_timestamp: number;
  sender_id: string;
  sender_username: string | null;
  sender_firstname: string | null;
  sender_lastname: string | null;
  is_match?: boolean;
  similarity?: number | null;
}
