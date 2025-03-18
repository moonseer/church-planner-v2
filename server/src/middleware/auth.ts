import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';
import User, { IUserDocument } from '../models/User';
import ErrorResponse from '../utils/ErrorResponse';
import {
  AuthenticatedRequest,
  JwtPayload as SharedJwtPayload,
  UserRole
} from '@shared/types/auth';
import { HttpStatus } from '@shared/types/api';
import { sendErrorResponse } from '../utils/responseUtils';
import mongoose from 'mongoose';

// Extend the Express Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
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
) => {
  try {
    let token;

    // Get token from cookies, headers, or query string
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    // Make sure token exists
    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as JwtPayload;

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      // Check if user account is active
      if (user.isActive === false) {
        return next(
          new ErrorResponse('Your account has been disabled. Please contact support.', 403)
        );
      }

      // Set user in request
      req.user = {
        id: user._id.toString(),
        role: user.role
      };

      next();
    } catch (error) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize specific user roles
 * @param roles Array of roles authorized to access the route
 */
export const authorize = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return next(
          new ErrorResponse('Not authorized to access this route', 401)
        );
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return next(
          new ErrorResponse('User not found', 404)
        );
      }

      // Check if the user's role is included in the authorized roles
      if (!roles.includes(user.role)) {
        return next(
          new ErrorResponse(
            `User role ${user.role} is not authorized to access this route`,
            403
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 