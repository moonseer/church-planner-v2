import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ApiResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import config from '../config';
import { AppError } from './errorMiddleware';

// Extend Request type to include user data
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
 * Middleware to authenticate users with JWT
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      ApiResponse.unauthorized(res, 'Authentication required. Please login.');
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;

      // Add user info to request
      req.user = {
        id: decoded.id as string,
        role: decoded.role as string,
        churchId: decoded.churchId as string,
      };

      logger.debug(`User authenticated: ${req.user.id}`);
      next();
    } catch (error) {
      logger.error('Token verification failed', error);
      ApiResponse.unauthorized(res, 'Invalid or expired token. Please login again.');
      return;
    }
  } catch (err) {
    logger.error('Auth middleware error:', err);
    next(new AppError('Authentication error', 500));
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    if (req.user.role !== 'admin') {
      ApiResponse.forbidden(res, 'Admin access required for this resource');
      return;
    }

    next();
  } catch (err) {
    logger.error('Admin check error:', err);
    next(new AppError('Authorization error', 500));
  }
};

/**
 * Middleware to check if user is a church admin for the specified church
 */
export const isChurchAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    // Admin role can access any church
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const churchId = req.params.churchId || req.body.churchId;
    
    if (!churchId) {
      ApiResponse.badRequest(res, 'Church ID is required');
      return;
    }

    try {
      // Check with Church Service if the user is a church admin
      const response = await axios.get(
        `${config.churchService.url}/api/churches/${churchId}/admins/check/${req.user.id}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      if (response.data && response.data.success) {
        next();
      } else {
        ApiResponse.forbidden(res, 'You must be a church admin to perform this action');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        ApiResponse.notFound(res, 'Church not found');
        return;
      }
      
      logger.error('Error checking church admin status:', error);
      if (error.response && error.response.status === 403) {
        ApiResponse.forbidden(res, 'You must be a church admin to perform this action');
        return;
      }

      throw new AppError('Error verifying church admin status', 500);
    }
  } catch (err) {
    logger.error('Church admin check error:', err);
    next(new AppError('Authorization error', 500));
  }
};

/**
 * Middleware to check if user is a team member for the specified event
 */
export const isEventTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    // Admin role can access any event
    if (req.user.role === 'admin') {
      next();
      return;
    }

    const eventId = req.params.id;
    
    if (!eventId) {
      ApiResponse.badRequest(res, 'Event ID is required');
      return;
    }

    // Import Event model here to avoid circular dependency
    const Event = require('../models/Event').default;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      ApiResponse.notFound(res, 'Event not found');
      return;
    }
    
    // Check if user is a church admin
    try {
      const churchAdminResponse = await axios.get(
        `${config.churchService.url}/api/churches/${event.churchId}/admins/check/${req.user.id}`,
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      if (churchAdminResponse.data && churchAdminResponse.data.success) {
        next();
        return;
      }
    } catch (error) {
      // Continue with team member check
      logger.debug('User is not a church admin, checking if team member');
    }
    
    // Check if user is a team member
    const isTeamMember = event.team.some(
      (member: any) => member.memberId.toString() === req.user?.id
    );
    
    if (isTeamMember) {
      next();
    } else {
      ApiResponse.forbidden(res, 'You must be a team member to perform this action');
    }
  } catch (err) {
    logger.error('Event team member check error:', err);
    next(new AppError('Authorization error', 500));
  }
}; 