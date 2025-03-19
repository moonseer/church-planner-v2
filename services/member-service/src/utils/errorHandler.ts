import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from './logger';
import { ApiResponse } from './apiResponse';

/**
 * Custom error class with status code
 */
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

/**
 * Handle Mongoose validation errors
 */
export const handleValidationError = (err: mongoose.Error.ValidationError, res: Response): Response => {
  const errors = Object.values(err.errors).map(el => el.message);
  return ApiResponse.badRequest(res, errors.join(', '));
};

/**
 * Handle Mongoose cast errors (invalid IDs, etc.)
 */
export const handleCastError = (err: mongoose.Error.CastError, res: Response): Response => {
  return ApiResponse.badRequest(res, `Invalid ${err.path}: ${err.value}`);
};

/**
 * Handle JWT errors
 */
export const handleJWTError = (res: Response): Response => {
  return ApiResponse.unauthorized(res, 'Invalid token. Please log in again.');
};

/**
 * Handle expired JWT
 */
export const handleJWTExpiredError = (res: Response): Response => {
  return ApiResponse.unauthorized(res, 'Your token has expired. Please log in again.');
};

/**
 * Handle duplicate key errors
 */
export const handleDuplicateFieldsError = (err: any, res: Response): Response => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  return ApiResponse.conflict(res, `Duplicate field value: ${value}. Please use another value.`);
};

/**
 * Error controller for development environment
 */
const sendErrorDev = (err: AppError, res: Response): Response => {
  logger.error(`ERROR: ${err.message}`);
  
  return res.status(err.statusCode).json({
    success: false,
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode
  });
};

/**
 * Error controller for production environment
 */
const sendErrorProd = (err: AppError, res: Response): Response => {
  // Operational errors that we trust: send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }
  
  // Programming or unknown errors: don't leak error details
  logger.error('ERROR 💥', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): Response => {
  err.statusCode = err.statusCode || 500;
  
  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }
  
  // For production environment, handle specific errors
  let error = { ...err };
  error.message = err.message;
  
  if (err instanceof mongoose.Error.ValidationError) {
    return handleValidationError(err, res);
  }
  
  if (err instanceof mongoose.Error.CastError) {
    return handleCastError(err, res);
  }
  
  if (err.name === 'JsonWebTokenError') {
    return handleJWTError(res);
  }
  
  if (err.name === 'TokenExpiredError') {
    return handleJWTExpiredError(res);
  }
  
  if (err.code === 11000) {
    return handleDuplicateFieldsError(err, res);
  }
  
  return sendErrorProd(err, res);
}; 