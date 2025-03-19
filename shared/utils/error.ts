/**
 * Error handling utilities for Church Planner Microservices
 */

import { StatusCodes } from '../constants/statusCodes';

// Custom error class with HTTP status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Create common error types
export const createNotFoundError = (resource: string) => {
  return new AppError(`${resource} not found`, StatusCodes.NOT_FOUND);
};

export const createUnauthorizedError = () => {
  return new AppError('Unauthorized access', StatusCodes.UNAUTHORIZED);
};

export const createForbiddenError = () => {
  return new AppError('Forbidden access', StatusCodes.FORBIDDEN);
};

export const createBadRequestError = (message: string) => {
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

export const createConflictError = (message: string) => {
  return new AppError(message, StatusCodes.CONFLICT);
};

export const createServerError = (message = 'Internal server error') => {
  return new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR, false);
};

// Error response formatter
export const formatErrorResponse = (error: AppError | Error) => {
  const appError = error instanceof AppError
    ? error
    : createServerError(error.message);

  return {
    success: false,
    error: appError.message,
    statusCode: appError.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  };
}; 