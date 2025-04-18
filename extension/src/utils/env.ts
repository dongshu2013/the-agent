// Environment variables for the extension
// Import this file to access environment variables
import { Env } from "../types";

// Default values (fallbacks)
const defaultEnv = {
  OPENAI_MODEL: "deepseek-chat",
  BACKEND_URL: "http://localhost:8000/v1",
  SYSTEM_PROMPT: "You are a helpful AI assistant named MIZU Agent.",
  SERVER_URL: "https://the-agent-production.up.railway.app",
  DEFAULT_MODEL: "deepseek-chat",
};

// Try to get values from process.env, fallback to defaults
export const env: Env = {
  OPENAI_MODEL:
    process.env.PLASMO_PUBLIC_OPENAI_MODEL || defaultEnv.OPENAI_MODEL,
  SYSTEM_PROMPT:
    process.env.PLASMO_PUBLIC_SYSTEM_PROMPT || defaultEnv.SYSTEM_PROMPT,
  BACKEND_URL: process.env.PLASMO_PUBLIC_BACKEND_URL || defaultEnv.BACKEND_URL,
  SERVER_URL: process.env.PLASMO_PUBLIC_SERVER_URL || defaultEnv.SERVER_URL,
  DEFAULT_MODEL:
    process.env.PLASMO_PUBLIC_DEFAULT_MODEL || defaultEnv.DEFAULT_MODEL,
};
