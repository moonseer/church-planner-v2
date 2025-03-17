import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from './logger';
import { errorsTotal } from './metrics';

// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
  logger.info('Sentry initialized for error tracking');
} else {
  logger.warn('Sentry DSN not provided, error tracking disabled');
}

// Error interface
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

// Create custom error
export const createError = (
  message: string,
  statusCode = 500,
  isOperational = true
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};

// Global error handler middleware
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Track error in Prometheus metrics
  errorsTotal.inc({ type: err.name || 'UnknownError' });
  
  // Log error
  if (err.isOperational) {
    logger.warn(`Operational error: ${err.message}`);
  } else {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    
    // Send to Sentry if available
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }
  }

  // Set default values
  err.statusCode = err.statusCode || 500;
  const status = err.statusCode >= 400 && err.statusCode < 500 ? 'fail' : 'error';

  // Log the error
  logger.error(`[${err.name || 'Error'}] ${err.message}`, {
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
  });

  // Send response
  res.status(err.statusCode).json({
    status,
    message: err.isOperational ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Catch unhandled rejections
export const setupUnhandledRejections = () => {
  process.on('unhandledRejection', (err: Error) => {
    logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
    
    // Send to Sentry if available
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }
    
    // In production, we might want to gracefully shut down
    if (process.env.NODE_ENV === 'production') {
      logger.error('Unhandled rejection in production, consider implementing graceful shutdown');
    }
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
    
    // Send to Sentry if available
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(err);
    }
    
    // Uncaught exceptions are serious, we should exit
    if (process.env.NODE_ENV === 'production') {
      logger.error('Uncaught exception in production, exiting process');
      process.exit(1);
    }
  });
}; 