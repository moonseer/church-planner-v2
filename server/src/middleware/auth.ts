import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import {
  AuthenticatedRequest,
  JwtPayload,
  UserRole
} from '@shared/types/auth';
import { HttpStatus } from '@shared/types/api';
import { sendErrorResponse } from '../utils/responseUtils';

// Define a custom interface for the request with user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        church?: string;
      };
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Get token from cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      sendErrorResponse(res, 'Not authorized to access this route', HttpStatus.UNAUTHORIZED);
      return;
    }

    try {
      // Get JWT secret from environment variables
      const jwtSecret = process.env.JWT_SECRET;
      
      if (!jwtSecret) {
        console.warn('WARNING: JWT_SECRET environment variable not set. Using a less secure fallback.');
        // In production, this should never happen as the app should fail to start without a JWT_SECRET
        if (process.env.NODE_ENV === 'production') {
          throw new Error('JWT_SECRET must be set in production environment');
        }
      }
      
      // Verify token
      const decoded = jwt.verify(token, jwtSecret || 'defaultsecret') as JwtPayload;

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        sendErrorResponse(res, 'User not found', HttpStatus.UNAUTHORIZED);
        return;
      }

      // Add user to request
      req.user = {
        id: user._id.toString(),
        church: user.church ? user.church.toString() : undefined
      };

      next();
    } catch (error) {
      sendErrorResponse(res, 'Not authorized to access this route', HttpStatus.UNAUTHORIZED);
      return;
    }
  } catch (error) {
    sendErrorResponse(res, 'Server error', HttpStatus.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Middleware to authorize specific user roles
 * @param roles Array of roles authorized to access the route
 */
export const authorize = (roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendErrorResponse(res, 'Not authorized', HttpStatus.UNAUTHORIZED);
        return;
      }
      
      const user = await User.findById(req.user.id);

      if (!user) {
        sendErrorResponse(res, 'User not found', HttpStatus.NOT_FOUND);
        return;
      }

      // Check if the user's role is included in the authorized roles
      if (!roles.includes(user.role as UserRole)) {
        sendErrorResponse(
          res, 
          `User role ${user.role} is not authorized to access this route`,
          HttpStatus.FORBIDDEN
        );
        return;
      }

      next();
    } catch (error) {
      sendErrorResponse(res, 'Server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
}; 