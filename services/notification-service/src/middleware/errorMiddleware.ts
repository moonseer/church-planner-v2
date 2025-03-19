import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Custom Application Error class
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle 404 Not Found errors
 * @param req Express request
 * @param _res Express response
 * @param next Express next function
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Cannot ${req.method} ${req.url}`, 404);
  next(error);
};

/**
 * Global error handler middleware
 * @param err Error object
 * @param req Express request
 * @param res Express response
 * @param _next Express next function
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Set default values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log the error
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`Error ${statusCode}: ${message}`, {
    error: {
      stack: err.stack,
      isOperational: err.isOperational || false,
    },
    requestInfo: {
      method: req.method,
      path: req.path,
      params: req.params,
      query: req.query,
      ip: req.ip,
    },
  });

  // Determine if this is a trusted error (operational) or unknown error
  const isProduction = process.env.NODE_ENV === 'production';
  const responseError = {
    success: false,
    message,
    ...((!isProduction || (err.isOperational && statusCode < 500)) && {
      stack: err.stack,
    }),
  };

  // Send error response
  res.status(statusCode).json(responseError);
}; 