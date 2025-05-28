/**
 * Memory strategy options
 */
export type MemoryStrategy = 'keep_all' | 'window' | 'summary' | 'none';

/**
 * Memory generation options
 */
export interface MemoryOptions {
  strategy?: number;
  systemPrompt?: string;
}
