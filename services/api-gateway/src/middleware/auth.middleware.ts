import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '../config/config';
import logger from '../utils/logger';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Extracts the JWT token from the request headers
 * @param req Express request object
 * @returns The JWT token or null if not found
 */
const extractToken = (req: Request): string | null => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

/**
 * Middleware to validate JWT tokens and protect routes
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if this is a public route that doesn't need authentication
    if (isPublicRoute(req.path)) {
      return next();
    }

    // Extract token from headers
    const token = extractToken(req);
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'No authentication token provided'
      });
    }

    // Verify token
    jwt.verify(
      token, 
      config.jwt.secret, 
      {
        audience: config.jwt.audience,
        issuer: config.jwt.issuer
      },
      (err, decoded) => {
        if (err) {
          logger.warn(`JWT verification failed: ${err.message}`);
          
          // Handle different JWT errors
          if (err.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json({
              status: 'error',
              message: 'Authentication token has expired'
            });
          }
          
          return res.status(StatusCodes.UNAUTHORIZED).json({
            status: 'error',
            message: 'Invalid authentication token'
          });
        }

        // Attach user info to request for use in controllers
        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    logger.error(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Checks if a route is in the public routes list
 * @param path The request path
 * @returns True if the route is public, false otherwise
 */
const isPublicRoute = (path: string): boolean => {
  // List of public routes that don't require authentication
  const publicRoutes = [
    `${config.apiPrefix}/auth/login`,
    `${config.apiPrefix}/auth/register`,
    `${config.apiPrefix}/auth/forgot-password`,
    `${config.apiPrefix}/auth/reset-password`,
    '/health',
    '/health/deep',
    '/api-docs'
  ];

  return publicRoutes.some(route => path.startsWith(route));
}; 