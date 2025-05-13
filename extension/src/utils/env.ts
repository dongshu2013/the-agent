import { Env } from "../types/index";

// Default values (fallbacks)
const defaultEnv = {
  OPENAI_MODEL: "deepseek-chat",
  BACKEND_URL: "http://localhost:8000",
  SYSTEM_PROMPT: `You are Mysta Agent, a helpful AI assistant that can interact with the browser.
When users request browser actions like opening pages, clicking elements, or filling forms, you should use the available tools rather than just describing what to do.
For example, if a user asks to open Twitter, use the TabToolkit.handleTwitterSequence tool instead of just saying "I'll open Twitter for you."
Always format tool calls as a JSON array, like this:
[
  {
    "name": "TabToolkit.handleTwitterSequence",
    "arguments": {}
  }
]`,
  SERVER_URL: "https://the-agent-production.up.railway.app",
  LLM_API_URL: "",
  LLM_API_KEY: "",
  OPENAI_API_KEY: "",
  WEB_URL: "http://localhost:3000",
};

export const env: Env = {
  OPENAI_MODEL:
    process.env.PLASMO_PUBLIC_OPENAI_MODEL || defaultEnv.OPENAI_MODEL,
  SYSTEM_PROMPT:
    process.env.PLASMO_PUBLIC_SYSTEM_PROMPT || defaultEnv.SYSTEM_PROMPT,
  BACKEND_URL: process.env.PLASMO_PUBLIC_BACKEND_URL || defaultEnv.BACKEND_URL,
  SERVER_URL: process.env.PLASMO_PUBLIC_SERVER_URL || defaultEnv.SERVER_URL,
  LLM_API_URL: process.env.PLASMO_PUBLIC_LLM_API_URL || defaultEnv.LLM_API_URL,
  LLM_API_KEY: process.env.PLASMO_PUBLIC_LLM_API_KEY || defaultEnv.LLM_API_KEY,
  OPENAI_API_KEY:
    process.env.PLASMO_PUBLIC_OPENAI_API_KEY || defaultEnv.OPENAI_API_KEY,
  WEB_URL: process.env.PLASMO_PUBLIC_WEB_URL || defaultEnv.WEB_URL,
};
