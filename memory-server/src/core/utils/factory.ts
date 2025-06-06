/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenAIEmbedder } from '../embeddings/openai';
import { OllamaEmbedder } from '../embeddings/ollama';
import { OpenAILLM } from '../llms/openai';
import { OpenAIStructuredLLM } from '../llms/openai_structured';
import { AnthropicLLM } from '../llms/anthropic';
import { MemoryVectorStore } from '../vector_stores/memory';
import { EmbeddingConfig, HistoryStoreConfig, LLMConfig, VectorStoreConfig } from '../types';
import { Embedder } from '../embeddings/base';
import { LLM } from '../llms/base';
import { VectorStore } from '../vector_stores/base';
import { RedisDB } from '../vector_stores/redis';
import { OllamaLLM } from '../llms/ollama';
import { SupabaseDB } from '../vector_stores/supabase';
import { SQLiteManager } from '../storage/SQLiteManager';
import { MemoryHistoryManager } from '../storage/MemoryHistoryManager';
import { SupabaseHistoryManager } from '../storage/SupabaseHistoryManager';
import { HistoryManager } from '../storage/base';
import { GoogleEmbedder } from '../embeddings/google';
import { GoogleLLM } from '../llms/google';
import { AzureOpenAILLM } from '../llms/azure';
import { AzureOpenAIEmbedder } from '../embeddings/azure';
import { DeepInfraEmbedding } from '../embeddings/deepinfra';
import { DeepInfraLLM } from '../llms/deepinfra';
export class EmbedderFactory {
  static create(provider: string, config: EmbeddingConfig): Embedder {
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIEmbedder(config);
      case 'ollama':
        return new OllamaEmbedder(config);
      case 'google':
        return new GoogleEmbedder(config);
      case 'azure_openai':
        return new AzureOpenAIEmbedder(config);
      case 'deepinfra':
        return new DeepInfraEmbedding(config);
      default:
        throw new Error(`Unsupported embedder provider: ${provider}`);
    }
  }
}

export class LLMFactory {
  static create(provider: string, config: LLMConfig): LLM {
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAILLM(config);
      case 'openai_structured':
        return new OpenAIStructuredLLM(config);
      case 'anthropic':
        return new AnthropicLLM(config);
      case 'ollama':
        return new OllamaLLM(config);
      case 'google':
        return new GoogleLLM(config);
      case 'azure_openai':
        return new AzureOpenAILLM(config);
      case 'deepinfra':
        return new DeepInfraLLM(config);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}

export class VectorStoreFactory {
  static create(provider: string, config: VectorStoreConfig): VectorStore {
    switch (provider.toLowerCase()) {
      case 'memory':
        return new MemoryVectorStore(config);
      case 'redis':
        return new RedisDB(config as any);
      case 'supabase':
        return new SupabaseDB(config as any);
      default:
        throw new Error(`Unsupported vector store provider: ${provider}`);
    }
  }
}

export class HistoryManagerFactory {
  static create(provider: string, config: HistoryStoreConfig): HistoryManager {
    switch (provider.toLowerCase()) {
      case 'sqlite':
        return new SQLiteManager(config.config.historyDbPath || ':memory:');
      case 'supabase':
        return new SupabaseHistoryManager({
          supabaseUrl: config.config.supabaseUrl || '',
          supabaseKey: config.config.supabaseKey || '',
          tableName: config.config.tableName || 'memory_history',
        });
      case 'memory':
        return new MemoryHistoryManager();
      default:
        throw new Error(`Unsupported history store provider: ${provider}`);
    }
  }
}
