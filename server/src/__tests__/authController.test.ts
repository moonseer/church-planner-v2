import { Request, Response } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
import mongoose from 'mongoose';
import { 
  ILoginRequest, 
  IRegisterRequest, 
  UserRole,
  JwtPayload
} from '@shared/types/auth';
import { IUserDocument, IChurchDocument } from '@shared/types/mongoose';
import { isUserDocument, isChurchDocument } from '../utils/typeGuards';
import { Result } from '@shared/types/utility';

// Use more specific types for the RequestWithUser interface
interface RequestWithUser extends Request {
  user?: {
    id: string;
    church?: string;
  };
}

// Mock dependencies
jest.mock('mongoose');

// Mock User model before importing it
jest.mock('../models/User', () => {
  return {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
});

// Mock Church model before importing it
jest.mock('../models/Church', () => {
  return {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };
});

// Import models after mocking
import User from '../models/User';
import Church from '../models/Church';

describe('Auth Controller', () => {
  let req: Partial<RequestWithUser>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  // Test helpers using type guards
  const createMockUser = (overrides: Partial<IUserDocument> = {}): IUserDocument => {
    return {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword123',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  };

  const createMockChurch = (overrides: Partial<IChurchDocument> = {}): IChurchDocument => {
    return {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Church',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  };

  // Type-safe assertion helpers
  const assertIsUserDocument = (value: unknown): asserts value is IUserDocument => {
    if (!isUserDocument(value)) {
      throw new Error(`Expected user document but got: ${JSON.stringify(value)}`);
    }
  };

  const assertIsChurchDocument = (value: unknown): asserts value is IChurchDocument => {
    if (!isChurchDocument(value)) {
      throw new Error(`Expected church document but got: ${JSON.stringify(value)}`);
    }
  };

  describe('register', () => {
    it('should register a new user with a new church', async () => {
      // Setup mock request data
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
        churchName: 'Test Church',
        churchAddress: '123 Test St',
        churchCity: 'Test City',
        churchState: 'TS',
        churchZip: '12345',
      };

      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mock Church.findOne to return null (church doesn't exist)
      (Church.findOne as jest.Mock).mockResolvedValue(null);

      // Setup church creation mock
      const mockChurch = {
        _id: 'church123',
        name: 'Test Church',
      };
      (Church.create as jest.Mock).mockResolvedValue(mockChurch);

      // Setup user creation mock
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        church: 'church123',
        getSignedJwtToken: jest.fn().mockReturnValue('token123'),
      };
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      // Call the controller function
      await register(req as Request, res as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(Church.findOne).toHaveBeenCalledWith({ name: 'Test Church' });
      expect(Church.create).toHaveBeenCalledWith({
        name: 'Test Church',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
      });
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
        church: 'church123',
      });
      expect(mockUser.getSignedJwtToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'token123',
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
          church: {
            id: 'church123',
            name: 'Test Church',
          },
        },
      });
    });

    it('should return 400 if user already exists', async () => {
      // Setup mock request data
      req.body = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        churchName: 'Test Church',
      };

      // Mock User.findOne to return an existing user
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: 'user123',
        email: 'existing@example.com',
      });

      // Call the controller function
      await register(req as Request, res as Response);

      // Assertions
      expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User already exists with that email',
      });
    });

    it('should return 400 if church name is not provided', async () => {
      // Setup mock request data with missing church name
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return null (user doesn't exist)
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await register(req as Request, res as Response);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Church name is required',
      });
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      // Setup mock request data
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return a user
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        church: 'church123',
        matchPassword: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('token123'),
      };
      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser),
      }));

      // Mock Church.findById to return a church
      const mockChurch = {
        _id: 'church123',
        name: 'Test Church',
      };
      (Church.findById as jest.Mock).mockResolvedValue(mockChurch);

      // Call the controller function
      await login(req as Request, res as Response);

      // Assertions
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(mockUser.getSignedJwtToken).toHaveBeenCalled();
      expect(Church.findById).toHaveBeenCalledWith('church123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'token123',
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
          church: {
            id: 'church123',
            name: 'Test Church',
          },
        },
      });
    });

    it('should return 400 if email or password is missing', async () => {
      // Setup mock request data with missing email
      req.body = {
        password: 'password123',
      };

      // Call the controller function
      await login(req as Request, res as Response);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Please provide an email and password',
      });
    });

    it('should return 401 if user is not found', async () => {
      // Setup mock request data
      req.body = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      // Mock User.findOne to return null (user not found)
      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(null),
      }));

      // Call the controller function
      await login(req as Request, res as Response);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials',
      });
    });

    it('should return 401 if password is incorrect', async () => {
      // Setup mock request data
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Mock User.findOne to return a user
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false),
      };
      (User.findOne as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(mockUser),
      }));

      // Call the controller function
      await login(req as Request, res as Response);

      // Assertions
      expect(mockUser.matchPassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user data', async () => {
      // Setup authenticated user in request
      req = {
        user: {
          id: 'user123',
        },
      };

      // Mock User.findById to return a user
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        church: 'church123',
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Mock Church.findById to return a church
      const mockChurch = {
        _id: 'church123',
        name: 'Test Church',
      };
      (Church.findById as jest.Mock).mockResolvedValue(mockChurch);

      // Call the controller function
      await getCurrentUser(req as RequestWithUser, res as Response);

      // Assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Church.findById).toHaveBeenCalledWith('church123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin',
          church: {
            id: 'church123',
            name: 'Test Church',
          },
        },
      });
    });

    it('should return 404 if user is not found', async () => {
      // Setup authenticated user in request
      req = {
        user: {
          id: 'nonexistent',
        },
      };

      // Mock User.findById to return null (user not found)
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await getCurrentUser(req as RequestWithUser, res as Response);

      // Assertions
      expect(User.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found',
      });
    });

    it('should return 404 if church is not found', async () => {
      // Setup authenticated user in request
      req = {
        user: {
          id: 'user123',
        },
      };

      // Mock User.findById to return a user
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        church: 'nonexistent',
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      // Mock Church.findById to return null (church not found)
      (Church.findById as jest.Mock).mockResolvedValue(null);

      // Call the controller function
      await getCurrentUser(req as RequestWithUser, res as Response);

      // Assertions
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Church.findById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Church not found',
      });
    });
  });
}); 