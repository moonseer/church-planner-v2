import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { createError, errorHandler, AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

// Mock dependencies
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Error Handler Utility', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Save original environment
    process.env.NODE_ENV_ORIGINAL = process.env.NODE_ENV;
    process.env.SENTRY_DSN_ORIGINAL = process.env.SENTRY_DSN;
  });
  
  afterEach(() => {
    // Restore original environment
    process.env.NODE_ENV = process.env.NODE_ENV_ORIGINAL;
    process.env.SENTRY_DSN = process.env.SENTRY_DSN_ORIGINAL;
    
    // Delete temporary variables
    delete process.env.NODE_ENV_ORIGINAL;
    delete process.env.SENTRY_DSN_ORIGINAL;
  });

  describe('createError', () => {
    it('should create an error with default values', () => {
      const error = createError('Test error');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });
    
    it('should create an error with custom statusCode', () => {
      const error = createError('Not found', 404);
      
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
    
    it('should create an error with custom isOperational flag', () => {
      const error = createError('Internal error', 500, false);
      
      expect(error.message).toBe('Internal error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('errorHandler', () => {
    it('should handle operational errors', () => {
      const err: AppError = createError('Validation failed', 400);
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(logger.warn).toHaveBeenCalledWith(`Operational error: ${err.message}`);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Validation failed',
      });
    });
    
    it('should handle non-operational errors', () => {
      const err: AppError = new Error('Unexpected error') as AppError;
      err.isOperational = false;
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(logger.error).toHaveBeenCalledWith(`Unhandled error: ${err.message}`, { stack: err.stack });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
      });
    });
    
    it('should include stack trace in development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const err: AppError = new Error('Development error') as AppError;
      err.statusCode = 500;
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Something went wrong',
        stack: err.stack,
      });
    });
    
    it('should not include stack trace in production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const err: AppError = new Error('Production error') as AppError;
      err.statusCode = 500;
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(res.json).not.toHaveBeenCalledWith(
        expect.objectContaining({ stack: expect.any(String) })
      );
    });
    
    it('should send 4xx errors with fail status', () => {
      const err: AppError = createError('Bad request', 400);
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(res.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Bad request',
      });
    });
    
    it('should send 5xx errors with error status', () => {
      const err: AppError = createError('Server error', 500);
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Server error',
      });
    });
    
    it('should capture exception with Sentry if available', () => {
      process.env.SENTRY_DSN = 'https://fake-sentry-dsn.com';
      
      const err: AppError = new Error('Sentry tracked error') as AppError;
      err.isOperational = false;
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(err);
    });
    
    it('should use default statusCode of 500 if not provided', () => {
      const err: AppError = new Error('No status code') as AppError;
      
      errorHandler(err, req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
}); 