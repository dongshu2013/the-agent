import { Env } from "../types/index";

// Default values (fallbacks)
const defaultEnv = {
  DEFAULT_MODEL: "deepseek-chat",
  BACKEND_URL: "https://api-staging.mysta.ai",
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
  LLM_API_URL: "",
  LLM_API_KEY: "",
  WEB_URL: "https://staging.mysta.ai",
};

export const env: Env = {
  DEFAULT_MODEL:
    process.env.PLASMO_PUBLIC_DEFAULT_MODEL || defaultEnv.DEFAULT_MODEL,
  SYSTEM_PROMPT:
    process.env.PLASMO_PUBLIC_SYSTEM_PROMPT || defaultEnv.SYSTEM_PROMPT,
  BACKEND_URL: process.env.PLASMO_PUBLIC_BACKEND_URL || defaultEnv.BACKEND_URL,
  LLM_API_URL: process.env.PLASMO_PUBLIC_LLM_API_URL || defaultEnv.LLM_API_URL,
  LLM_API_KEY: process.env.PLASMO_PUBLIC_LLM_API_KEY || defaultEnv.LLM_API_KEY,
  WEB_URL: process.env.PLASMO_PUBLIC_WEB_URL || defaultEnv.WEB_URL,
};
