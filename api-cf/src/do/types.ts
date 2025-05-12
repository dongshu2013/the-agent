export interface TextMessage {
  type: "text";
  text: {
    value: string;
    annotations: string[];
  };
}

export interface ImageMessage {
  type: "image";
  image_url: {
    url: string;
  };
}

export type AgentMessage = TextMessage | ImageMessage;

export interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface Message {
  id: number;
  conversation_id: number;
  role: string;
  content: AgentMessage[];
  tool_calls: ToolCall[];
  tool_call_id: string;
}

export interface Conversation {
  id: number;
  messages: Message[];
}
