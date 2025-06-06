import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error('Operational error', {
      statusCode: err.statusCode,
      message: err.message,
    });
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error('Unexpected error', {
    error: err,
    stack: err.stack,
  });

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
