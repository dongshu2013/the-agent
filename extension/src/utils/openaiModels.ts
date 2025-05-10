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
