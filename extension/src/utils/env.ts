import { Env } from "../types/index";

// Default values (fallbacks)
const defaultEnv = {
  DEFAULT_MODEL: "deepseek-chat",
  BACKEND_URL: "https://api-staging.mysta.ai",
  WEB_URL: "https://staging.mysta.ai",
};

export const env: Env = {
  DEFAULT_MODEL:
    process.env.PLASMO_PUBLIC_DEFAULT_MODEL || defaultEnv.DEFAULT_MODEL,
  BACKEND_URL: defaultEnv.DEFAULT_MODEL,
  WEB_URL: process.env.PLASMO_PUBLIC_WEB_URL || defaultEnv.WEB_URL,
};
