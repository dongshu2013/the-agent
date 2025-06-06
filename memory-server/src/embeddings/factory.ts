import { Embedder } from 'mem0ai/oss';
import { DeepInfraEmbedder } from './DeepInfraEmbedder';

export class EmbedderFactory {
  private static providers: Map<string, new (config: any) => Embedder> = new Map();

  static register(provider: string, embedderClass: new (config: any) => Embedder) {
    this.providers.set(provider, embedderClass);
  }

  static create(provider: string, config: any): Embedder {
    const embedderClass = this.providers.get(provider);
    if (!embedderClass) {
      throw new Error(`Unsupported embedder provider: ${provider}`);
    }
    return new embedderClass(config);
  }
}

// Register our DeepInfraEmbedder
EmbedderFactory.register('deepinfra', DeepInfraEmbedder);
