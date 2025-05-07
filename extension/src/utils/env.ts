import { Env } from "../types/index";

// Default values (fallbacks)
const defaultEnv = {
  OPENAI_MODEL: "deepseek-chat",
  BACKEND_URL: "http://localhost:8000",
  SERVER_URL: "https://the-agent-production.up.railway.app",
};

console.log("🔥 process.env:", process.env.PLASMO_PUBLIC_DEFAULT_MODEL);
// Try to get values from process.env, fallback to defaults
export const env: Env = {
  OPENAI_MODEL:
    process.env.PLASMO_PUBLIC_OPENAI_MODEL || defaultEnv.OPENAI_MODEL,
  BACKEND_URL: process.env.PLASMO_PUBLIC_BACKEND_URL || defaultEnv.BACKEND_URL,
  SERVER_URL: process.env.PLASMO_PUBLIC_SERVER_URL || defaultEnv.SERVER_URL,
};
