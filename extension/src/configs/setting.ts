import { Settings } from '~/types';

/**
 * Default settings values
 */
export const defaultSettings: Settings = {
  apiKey: '',
  apiUrl: 'http://localhost:8000',
  model: 'gpt-3.5-turbo',
  systemPrompt: 'You are a helpful AI assistant.',
  memoryStrategy: 'keep_all',
  temperature: 0.7,
  maxTokens: 2000,
};
