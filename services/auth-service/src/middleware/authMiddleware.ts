import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

// Define custom user interface in a separate file instead of using namespace
interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Middleware to authenticate and protect routes
 */
export const authenticate = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No token provided.'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const { valid, decoded, error } = authService.verifyToken(token);
    
    if (!valid || !decoded) {
      return res.status(401).json({
        success: false,
        error: error || 'Invalid token'
      });
    }

    // Add user data to request object
    req.user = {
      id: decoded.id as string,
      email: decoded.email as string,
      role: decoded.role as string
    };

    // Proceed to the protected route
    next();
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return res.status(401).json({
      success: false,
      error: errorMessage
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
export const restrictToAdmin = (req: RequestWithUser, res: Response, next: NextFunction): Response | void => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin privileges required.'
    });
  }

  next();
}; 