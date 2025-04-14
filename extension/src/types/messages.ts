export type MessageName = "process-request";

export interface ProcessRequestMessage {
  name: MessageName;
  body: {
    apiKey?: string;
    request: string;
  };
}

export interface ProcessRequestResponse {
  error?: string;
  result?: string;
}
