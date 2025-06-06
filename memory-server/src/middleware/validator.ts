import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateMemoryAdd = (req: Request, res: Response, next: NextFunction) => {
  const { messages, options } = req.body;

  if (!messages || !Array.isArray(messages)) {
    throw new AppError(400, 'Messages must be an array');
  }

  if (messages.length === 0) {
    throw new AppError(400, 'Messages array cannot be empty');
  }

  next();
};

export const validateMemorySearch = (req: Request, res: Response, next: NextFunction) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    throw new AppError(400, 'Query must be a string');
  }

  next();
};

export const validateMessageSave = (req: Request, res: Response, next: NextFunction) => {
  const { content, role, conversationId } = req.body;

  if (!content || typeof content !== 'string') {
    throw new AppError(400, 'Content must be a string');
  }

  if (!role || !['user', 'assistant', 'system', 'tool'].includes(role)) {
    throw new AppError(400, 'Invalid role');
  }

  if (!conversationId || typeof conversationId !== 'string') {
    throw new AppError(400, 'Conversation ID must be a string');
  }

  next();
};
