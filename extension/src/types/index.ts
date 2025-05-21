// Re-export all types from their respective files
export * from './messages';
export * from './conversations';
export * from './api';
export * from './settings';

export interface Env {
  BACKEND_URL: string;
  WEB_URL: string;
}

export interface Model {
  id: string;
  name: string;
  type: string;
  apiKey: string;
  apiUrl: string;
  userId: string;
}

export interface ApiKey {
  key: string;
  enabled: boolean;
}
