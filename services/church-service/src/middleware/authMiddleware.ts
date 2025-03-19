import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Church from '../models/Church';
import config from '../config/config';

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
      res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
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

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Token is invalid or expired'
      });
      return;
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check if user is the church owner
export const isChurchOwner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    // Find the church
    const church = await Church.findById(id);
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found'
      });
      return;
    }

    // Check if the user is the owner
    const isOwner = church.admins.some(
      admin => admin.userId.toString() === userId && admin.role === 'owner'
    );

    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to perform this action'
      });
      return;
    }

    next();
  } catch (err) {
    console.error('Church owner check error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check if user is the church admin or owner
export const isChurchAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    // Find the church
    const church = await Church.findById(id);
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found'
      });
      return;
    }

    // Check if the user is an admin or owner
    const isAdminOrOwner = church.admins.some(
      admin => admin.userId.toString() === userId
    );

    if (!isAdminOrOwner) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to perform this action'
      });
      return;
    }

    next();
  } catch (err) {
    console.error('Church admin check error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 