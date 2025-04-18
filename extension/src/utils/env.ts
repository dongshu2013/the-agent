// Environment variables for the extension
// Import this file to access environment variables

// Default values (fallbacks)
const defaultEnv = {
  OPENAI_MODEL: "deepseek-chat",
  API_URL: "http://localhost:8000/v1",
};

// Try to get values from process.env, fallback to defaults
export const env = {
  OPENAI_MODEL: process.env.PLASMO_PUBLIC_OPENAI_MODEL || defaultEnv.OPENAI_MODEL,
  API_URL: process.env.PLASMO_PUBLIC_API_URL || defaultEnv.API_URL,
};

// For debugging
console.log("Environment loaded:", {
  OPENAI_MODEL: env.OPENAI_MODEL,
  API_URL: env.API_URL,
});
