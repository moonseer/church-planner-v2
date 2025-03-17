import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '@shared/types/auth';

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
      const mockUser = { 
        _id: 'user123', 
        name: 'Test User', 
        role: UserRole.ADMIN,
        church: 'church123'
      };
      (User.findById as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser)
      }));
      
      await protect(req as Request, res as Response, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET || 'defaultsecret');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(req.user).toEqual({
        id: 'user123',
        church: 'church123'
      });
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
      (User.findById as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(null)
      }));
      
      await protect(req as Request, res as Response, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET || 'defaultsecret');
      expect(User.findById).toHaveBeenCalledWith('nonexistentuser');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('authorize middleware', () => {
    it('should return 401 if req.user is not set', async () => {
      // No user set (req.user is undefined)
      req.user = undefined;
      
      // Create authorize middleware for admin role
      const authMiddleware = authorize([UserRole.ADMIN]);
      
      await authMiddleware(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not authorized'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user role is not authorized', async () => {
      // Set user with non-authorized role
      req.user = { 
        id: 'user123',
        church: 'church123'
      };
      
      // Mock user retrieval
      const mockUser = {
        _id: 'user123',
        role: UserRole.USER
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // Create authorize middleware for admin role
      const authMiddleware = authorize([UserRole.ADMIN]);
      
      await authMiddleware(req as Request, res as Response, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: `User role ${UserRole.USER} is not authorized to access this route`
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next() if user role is authorized', async () => {
      // Set user with authorized role
      req.user = { 
        id: 'user123',
        church: 'church123'
      };
      
      // Mock user retrieval
      const mockUser = {
        _id: 'user123',
        role: UserRole.ADMIN
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // Create authorize middleware for admin role
      const authMiddleware = authorize([UserRole.ADMIN]);
      
      await authMiddleware(req as Request, res as Response, next);
      
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
    
    it('should call next() if user role is one of multiple authorized roles', async () => {
      // Set user with one of the authorized roles
      req.user = { 
        id: 'user123',
        church: 'church123'
      };
      
      // Create a mock editor role
      const EDITOR_ROLE = 'editor' as UserRole;
      
      // Mock user retrieval
      const mockUser = {
        _id: 'user123',
        role: EDITOR_ROLE
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // Create authorize middleware with multiple roles
      const authMiddleware = authorize([UserRole.ADMIN, EDITOR_ROLE, 'moderator' as UserRole]);
      
      await authMiddleware(req as Request, res as Response, next);
      
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
}); 