import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './api/middleware/error';
import { Memory } from './core';
import { MemoryService } from './api/services/memory';
import { createMemoryRoutes } from './api/routes/memory';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create memory service and register routes
const memory = Memory.fromConfig(config.mem0);
const memoryService = new MemoryService(memory);
app.use('/memories', createMemoryRoutes(memoryService));

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down...');
  process.exit(0);
});
