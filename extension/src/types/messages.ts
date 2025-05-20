export type MessageName = 'selected-text' | 'focus-input' | 'api-key-missing';
export type RuntimeMessageName = 'ping' | 'execute-tool' | 'update-config' | MessageName;
export interface RuntimeMessage {
  name: RuntimeMessageName;
  body?:
    | {
        name: string;
        arguments: object;
      }
    | {
        key: string;
        value: string;
      };
}

export interface RuntimeResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}
