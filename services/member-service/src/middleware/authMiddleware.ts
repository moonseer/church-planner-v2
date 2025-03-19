import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Member from '../models/Member';
import config from '../config/config';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

// Extend Request type to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name?: string;
        email?: string;
        role?: string;
      };
      memberId?: string;
    }
  }
}

// Middleware to authenticate users with JWT
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
      ApiResponse.unauthorized(res, 'Not authorized to access this route. No token provided.');
      return;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

      // Add user info to request
      req.user = {
        id: decoded.id as string,
        name: decoded.name as string,
        email: decoded.email as string,
        role: decoded.role as string
      };

      logger.debug(`User authenticated: ${req.user.id}`);
      next();
    } catch (error) {
      logger.error('Token verification failed', error);
      ApiResponse.unauthorized(res, 'Token is invalid or expired');
      return;
    }
  } catch (err) {
    logger.error('Auth middleware error:', err);
    ApiResponse.serverError(res, 'Server error in authentication');
  }
};

// Check if user is owner of the member profile
export const isProfileOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      ApiResponse.unauthorized(res, 'Not authenticated');
      return;
    }

    // Find the member
    const member = await Member.findById(id);
    if (!member) {
      ApiResponse.notFound(res, 'Member not found');
      return;
    }

    // Check if the authenticated user is the owner of this member profile
    if (member.userId.toString() !== userId) {
      ApiResponse.forbidden(res, 'Not authorized to access this member profile');
      return;
    }

    // Store memberId in request for potential use in other middleware/controllers
    req.memberId = member._id.toString();
    
    logger.debug(`Profile ownership verified for user: ${userId}`);
    next();
  } catch (err) {
    logger.error('Profile owner check error:', err);
    ApiResponse.serverError(res, 'Server error in profile owner check');
  }
};

// Check if user has admin role
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      ApiResponse.forbidden(res, 'Admin access required');
      return;
    }

    logger.debug(`Admin access granted for user: ${req.user?.id}`);
    next();
  } catch (err) {
    logger.error('Admin check error:', err);
    ApiResponse.serverError(res, 'Server error in admin check');
  }
}; 