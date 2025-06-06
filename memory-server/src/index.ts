import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import logger, { requestLogger } from './utils/logger';
import memoryRoutes from './routes/memoryRoutes';
import { errorHandler } from './middleware/errorHandler';
import './embeddings/factory'; // Import our embedder factory

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.server.corsOrigin,
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: config.server.rateLimit.windowMs,
    max: config.server.rateLimit.max,
    message: { error: 'Too many requests, please try again later.' },
  })
);

// Request parsing
app.use(express.json());

// Request logging
app.use(requestLogger);

// Routes
app.use('/api/memory', memoryRoutes);

// Health check
app.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
  })
);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: config.env,
    logLevel: config.logLevel,
  });
});
