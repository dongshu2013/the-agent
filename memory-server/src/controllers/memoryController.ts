import { Request, Response } from 'express';
import Mem0Service from '../services/Mem0Service';
import logger from '../utils/logger';

export class MemoryController {
  private mem0Service: Mem0Service;

  constructor(mem0: Mem0Service) {
    this.mem0Service = mem0;
  }

  async addMemory(req: Request, res: Response) {
    try {
      const { messages, options } = req.body;
      const result = await this.mem0Service.addMemory(messages, options);
      res.json(result);
    } catch (error) {
      logger.error('Error adding memory:', error);
      res.status(500).json({ error: 'Failed to add memory' });
    }
  }

  async searchMemory(req: Request, res: Response) {
    try {
      const { query, options } = req.body;
      const result = await this.mem0Service.searchMemory(query, options);
      res.json(result);
    } catch (error) {
      logger.error('Error searching memory:', error);
      res.status(500).json({ error: 'Failed to search memory' });
    }
  }

  async getMemory(req: Request, res: Response) {
    try {
      const result = await this.mem0Service.getMemory(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error('Error getting memory:', error);
      res.status(500).json({ error: 'Failed to get memory' });
    }
  }

  async getAllMemories(req: Request, res: Response) {
    try {
      const result = await this.mem0Service.getAllMemories(req.query);
      res.json(result);
    } catch (error) {
      logger.error('Error getting all memories:', error);
      res.status(500).json({ error: 'Failed to get memories' });
    }
  }

  async deleteMemory(req: Request, res: Response) {
    try {
      const result = await this.mem0Service.deleteMemory(req.params.id);
      res.json(result);
    } catch (error) {
      logger.error('Error deleting memory:', error);
      res.status(500).json({ error: 'Failed to delete memory' });
    }
  }
}
