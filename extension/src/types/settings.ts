/**
 * Settings Types
 * Defines all settings-related interfaces used in the application
 */

import { MemoryStrategy } from './memory';

export interface ApiKey {
  key: string;
  enabled: boolean;
}

export interface Model {
  id: string;
  name: string;
  type: string;
  apiKey: string;
  apiUrl: string;
  userId: string;
}

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
 * Settings component props
 */
export interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onClose: () => void;
}
