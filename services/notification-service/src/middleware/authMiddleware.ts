import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import config from '../config';
import { AppError } from './errorMiddleware';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        churchId?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'Authentication required. Please login.');
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // Add user info to request
      req.user = {
        id: decoded.id,
        role: decoded.role,
        churchId: decoded.churchId
      };
      
      next();
    } catch (error) {
      // Token verification failed
      logger.warn('JWT verification failed', { error });
      
      // Try to validate token with Auth Service if JWT_SECRET doesn't match
      if (error instanceof jwt.JsonWebTokenError) {
        try {
          // Call Auth Service to validate token
          const response = await axios.post(
            `${config.services.auth}/validate-token`,
            { token },
            { 
              headers: { 
                'Content-Type': 'application/json',
                'service-name': config.serviceName
              }
            }
          );
          
          if (response.data.success && response.data.data.valid) {
            // Token is valid, add user info to request
            req.user = {
              id: response.data.data.user.id,
              role: response.data.data.user.role,
              churchId: response.data.data.user.churchId
            };
            
            next();
            return;
          }
        } catch (authServiceError) {
          logger.error('Error validating token with Auth Service', { authServiceError });
        }
      }
      
      ApiResponse.unauthorized(res, 'Invalid or expired token. Please login again.');
    }
  } catch (err) {
    next(new AppError('Authentication error', 500));
  }
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    ApiResponse.unauthorized(res, 'Authentication required');
    return;
  }
  
  if (req.user.role !== 'admin') {
    ApiResponse.forbidden(res, 'Admin access required');
    return;
  }
  
  next();
};

/**
 * Middleware to check if user is a church admin
 */
export const isChurchAdmin = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    ApiResponse.unauthorized(res, 'Authentication required');
    return;
  }
  
  // Allow system admins and church admins
  if (req.user.role !== 'admin' && req.user.role !== 'churchAdmin') {
    ApiResponse.forbidden(res, 'Church admin access required');
    return;
  }
  
  // If not system admin, check if user is admin for the specific church
  if (req.user.role === 'churchAdmin') {
    // Get church ID from params, query, or body
    const churchId = 
      req.params.churchId || 
      req.query.churchId as string || 
      (req.body ? req.body.churchId : null);
    
    // If church ID is specified in the request, check if user is admin for that church
    if (churchId && req.user.churchId !== churchId) {
      ApiResponse.forbidden(res, 'You are not authorized to access this church');
      return;
    }
  }
  
  next();
}; 