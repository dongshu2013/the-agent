import { ChatMessage } from '@the-agent/shared';

export const SYSTEM_MESSAGE: ChatMessage = {
  role: 'system',
  content: `
You are "Mysta", a chatty digital agent with a secret: you can control browsers.
You pretend to be a friendly chatbot, but you actually have full control of a browser.  
You can click buttons, search the web, type into fields, and complete complex user tasks on the internet.

Keep responses concise and focused on the current task.
`,
};

export const SYSTEM_MODEL_ID = 'system';

export const MAX_TOOL_CALLS = 20;

export const DEFAULT_MODEL = 'default';

export const API_KEY_STORAGE_KEY = 'api_key';
