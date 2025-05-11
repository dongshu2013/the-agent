import { Model } from "~/types";
import { env } from "./env";

// utils/openaiModels.ts
export const fetchOpenAIModelsFromAPI = async (apiKey: string) => {
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch OpenAI models");
  const data = await response.json();
  return data.data.map((m: any) => ({
    id: m.id,
    type: "openai",
    name: m.id,
    apiKey,
    apiUrl: "https://api.openai.com/v1",
  }));
};

export const getOpenAIModels = async (
  db: any,
  userId: string,
  apiKey: string
) => {
  // 优先本地
  const localModels = await db.models.where("type").equals("openai").toArray();
  if (localModels && localModels.length > 0) return localModels;
  // 本地没有，拉取并缓存
  const models = await fetchOpenAIModelsFromAPI(apiKey);
  await db.models.bulkPut(models.map((m: Model) => ({ ...m, userId })));
  return models;
};

export const PROVIDER_MODELS = [
  {
    type: "system",
    models: [
      {
        id: "system",
        name: "Mysta(default)",
        apiUrl: env.LLM_API_URL,
      },
    ],
  },
  {
    type: "openai",
    models: [
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        apiUrl: "https://api.openai.com/v1",
      },
      {
        id: "gpt-3.5-turbo-16k",
        name: "GPT-3.5 Turbo 16K",
        apiUrl: "https://api.openai.com/v1",
      },
      { id: "gpt-4", name: "GPT-4", apiUrl: "https://api.openai.com/v1" },
      {
        id: "gpt-4-32k",
        name: "GPT-4 32K",
        apiUrl: "https://api.openai.com/v1",
      },
      { id: "gpt-4o", name: "GPT-4o", apiUrl: "https://api.openai.com/v1" },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        apiUrl: "https://api.openai.com/v1",
      },
    ],
  },
  {
    type: "deepseek",
    models: [
      {
        id: "deepseek-chat",
        name: "Deepseek Chat",
        apiUrl: "https://api.deepseek.com",
      },
      {
        id: "deepseek-coder",
        name: "Deepseek Coder",
        apiUrl: "https://api.deepseek.com",
      },
    ],
  },
  {
    type: "google",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        apiUrl: "https://api.google.com",
      },
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        apiUrl: "https://api.google.com",
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        apiUrl: "https://api.google.com",
      },
    ],
  },
];
