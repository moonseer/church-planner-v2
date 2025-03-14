import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect, authorize } from '../middleware/auth';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

// Import models after mocking
import User from '../models/User';

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      user: undefined
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Clear all mock calls
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token is provided', async () => {
      // No token in header
      req.headers = {};
      
      await protect(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token format is invalid', async () => {
      // Invalid token format (no 'Bearer')
      req.headers = {
        authorization: 'InvalidToken'
      };
      
      await protect(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token verification fails', async () => {
      // Set token in header
      req.headers = {
        authorization: 'Bearer invalidtoken'
      };
      
      // Mock jwt.verify to throw error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await protect(req as Request, res as Response, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', process.env.JWT_SECRET);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should set req.user and call next() if token is valid', async () => {
      // Set token in header
      req.headers = {
        authorization: 'Bearer validtoken'
      };
      
      // Mock successful jwt.verify
      const mockDecodedToken = { id: 'user123', iat: 1234567890, exp: 9876543210 };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      
      // Mock user retrieval
      const mockUser = { _id: 'user123', name: 'Test User', role: 'admin' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      await protect(req as Request, res as Response, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    it('should handle the case where user is not found', async () => {
      // Set token in header
      req.headers = {
        authorization: 'Bearer validtoken'
      };
      
      // Mock successful jwt.verify
      const mockDecodedToken = { id: 'nonexistentuser', iat: 1234567890, exp: 9876543210 };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
      
      // Mock user not found
      (User.findById as jest.Mock).mockResolvedValue(null);
      
      await protect(req as Request, res as Response, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith('nonexistentuser');
      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled(); // Next is still called, but user will be null
    });
  });
  
  describe('authorize middleware', () => {
    it('should return 401 if req.user is not set', () => {
      // No user set (req.user is undefined)
      req.user = undefined;
      
      // Create authorize middleware for admin role
      const authMiddleware = authorize('admin');
      
      authMiddleware(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user role is not authorized', () => {
      // Set user with non-authorized role
      req.user = { 
        _id: 'user123', 
        name: 'Test User', 
        role: 'user' 
      };
      
      // Create authorize middleware for admin role
      const authMiddleware = authorize('admin');
      
      authMiddleware(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User role user is not authorized to access this route'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next() if user role is authorized', () => {
      // Set user with authorized role
      req.user = { 
        _id: 'user123', 
        name: 'Test User', 
        role: 'admin' 
      };
      
      // Create authorize middleware for admin role
      const authMiddleware = authorize('admin');
      
      authMiddleware(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    it('should call next() if user role is one of multiple authorized roles', () => {
      // Set user with one of the authorized roles
      req.user = { 
        _id: 'user123', 
        name: 'Test User', 
        role: 'editor' 
      };
      
      // Create authorize middleware with multiple roles
      const authMiddleware = authorize('admin', 'editor', 'moderator');
      
      authMiddleware(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
}); 