import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

// Custom error class for API errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Set defaults
  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isOperational = (err as AppError).isOperational || false;

  // Log error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`, {
      error: err.stack,
      requestId: req.headers['x-request-id'],
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`, {
      requestId: req.headers['x-request-id'],
    });
  }

  // Handle specific error types
  if (err instanceof mongoose.Error.ValidationError) {
    // Mongoose validation error
    const errors = Object.values(err.errors).map((val: any) => val.message);
    return ApiResponse.badRequest(res, 'Validation Error', { errors });
  }

  if (err instanceof mongoose.Error.CastError) {
    // Mongoose cast error (e.g., invalid ObjectId)
    return ApiResponse.badRequest(res, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.name === 'MongoError' && (err as any).code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys((err as any).keyValue)[0];
    return ApiResponse.conflict(res, `Duplicate value for ${field}`);
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Your token has expired. Please log in again.');
  }

  // Send standard error response
  // In production, only send operational errors details
  const errorResponse = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(process.env.NODE_ENV === 'development' || isOperational
      ? {
          stack: err.stack,
          isOperational,
        }
      : {}),
  };

  if (statusCode >= 500) {
    return ApiResponse.serverError(res, message, errorResponse);
  }

  return res.status(statusCode).json(errorResponse);
}; 