/**
 * Settings Types
 * Defines all settings-related interfaces used in the application
 */

/**
 * Memory strategy options
 */
export type MemoryStrategy = "keep_all" | "window" | "summary" | "none";

/**
 * Application settings
 */
export interface Settings {
  apiKey: string;
  apiUrl: string;
  model: string;
  systemPrompt: string;
  memoryStrategy: MemoryStrategy;
  temperature: number;
  maxTokens: number;
}

/**
 * Default settings values
 */
export const defaultSettings: Settings = {
  apiKey: "",
  apiUrl: "http://localhost:8000",
  model: "gpt-3.5-turbo",
  systemPrompt: "You are a helpful AI assistant.",
  memoryStrategy: "keep_all",
  temperature: 0.7,
  maxTokens: 2000,
};

/**
 * Memory strategy options for UI display
 */
export const memoryStrategyOptions = [
  { value: "keep_all", label: "Keep All Messages" },
  { value: "window", label: "Keep Recent Messages" },
  { value: "summary", label: "Summarize History" },
  { value: "none", label: "No Memory" },
];

/**
 * Settings component props
 */
export interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onClose: () => void;
}
