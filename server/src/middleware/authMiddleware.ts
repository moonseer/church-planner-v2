import { Request, Response, NextFunction } from 'express';
import authService from '../features/auth/services/authService';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate and protect routes
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. No token provided.',
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const { valid, decoded, error } = authService.verifyToken(token);
    
    if (!valid || !decoded) {
      return res.status(401).json({
        status: 'error',
        message: error || 'Invalid token',
      });
    }

    // Add user data to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    // Proceed to the protected route
    next();
  } catch (error: any) {
    return res.status(401).json({
      status: 'error',
      message: error.message || 'Authentication failed',
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
export const restrictToAdmin = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
}; 