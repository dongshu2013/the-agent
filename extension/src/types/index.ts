/**
 * Types Index
 * Central export point for all application type definitions
 */

// Re-export all types from their respective files
export * from "./messages";
export * from "./conversations";
export * from "./api";
export * from "./settings";

/**
 * Environment configuration interface
 * Used for managing environment variables throughout the application
 */
export interface Env {
  OPENAI_MODEL: string;
  BACKEND_URL: string;
  SYSTEM_PROMPT: string;
  SERVER_URL: string;
  LLM_API_URL: string;
  LLM_API_KEY: string;
  OPENAI_API_KEY: string;
}
/**
 * Default configuration for the background service
 */
export interface DefaultConfig {
  [key: string]: string;
}

/**
 * Chrome message types
 */
export type ChromeMessageName =
  | "process-request"
  | "update-config"
  | "selected-text"
  | "api-key-missing"
  | "focus-input";

/**
 * Process request message sent to background script
 */
export interface ProcessRequestBody {
  apiKey?: string;
  request: string;
}

/**
 * Update config message from UI to background
 */
export interface ChromeUpdateConfigMessage {
  name: "update-config";
  body: {
    key: string;
    value: string;
  };
}

/**
 * Selected text message from context menu to UI
 */
export interface ChromeSelectedTextMessage {
  name: "selected-text";
  text: string;
}

/**
 * API key missing message from background to UI
 */
export interface ChromeApiKeyMissingMessage {
  name: "api-key-missing";
  redirectUrl: string;
}

/**
 * Focus input message to UI
 */
export interface ChromeFocusInputMessage {
  name: "focus-input";
}

/**
 * Union type of all Chrome messages
 */
export type ChromeMessage =
  | ChromeUpdateConfigMessage
  | ChromeSelectedTextMessage
  | ChromeApiKeyMissingMessage
  | ChromeFocusInputMessage;

/**
 * Process request response from background to UI
 */
export interface ProcessRequestResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Cache manager data structure
 */
export interface CacheData<T> {
  data: T;
  timestamp: number;
}

export enum ModelType {
  system = "SYSTEM",
  custom = "CUSTOM",
}

export interface Model {
  id: string;
  name: string;
  type: ModelType;
  apiKey: string;
  apiUrl: string;
}
