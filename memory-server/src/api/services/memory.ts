import { Request, Response } from 'express';
import {
  AddMemoryOptions,
  GetAllMemoryOptions,
  Memory,
  MemoryItem,
  Message,
  SearchMemoryOptions,
  SearchResult,
} from '../../core';

export class MemoryService {
  constructor(private memory: Memory) {}

  async addMemory(req: Request, res: Response) {
    try {
      const { message, config } = req.body;
      const result = await this.memory.add(
        message as string | Message[],
        config as AddMemoryOptions
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchMemories(req: Request, res: Response) {
    try {
      const { query, config } = req.query;
      const results: SearchResult = await this.memory.search(
        query as string,
        config as SearchMemoryOptions
      );
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMemory(req: Request, res: Response) {
    try {
      const result: MemoryItem | null = await this.memory.get(req.params.id as string);
      if (!result) {
        return res.status(404).json({ error: 'Memory not found' });
      }
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { config } = req.query;
      const results: SearchResult = await this.memory.getAll(config as GetAllMemoryOptions);
      res.json(results);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { memoryId } = req.query;
      const result: { message: string } = await this.memory.delete(memoryId as string);
      res.status(204).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
