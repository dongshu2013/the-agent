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
