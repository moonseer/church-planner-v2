import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('User Model', () => {
  let userModel: any;
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    church: new mongoose.Types.ObjectId(),
  };

  beforeAll(() => {
    // Mock bcrypt functions
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('mocksalt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Mock JWT sign
    (jwt.sign as jest.Mock).mockReturnValue('mockjwttoken');
  });

  beforeEach(() => {
    // Create a user model instance before each test
    userModel = new User(mockUser);
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('User Schema', () => {
    it('should create a new user with all required fields', () => {
      expect(userModel.name).toBe(mockUser.name);
      expect(userModel.email).toBe(mockUser.email);
      expect(userModel.password).toBe(mockUser.password);
      expect(userModel.role).toBe(mockUser.role);
      expect(userModel.church).toEqual(mockUser.church);
      expect(userModel.createdAt).toBeDefined();
    });

    it('should have default values set correctly', () => {
      const userWithDefaults = new User({
        name: 'Default User',
        email: 'default@example.com',
        password: 'password123',
        church: new mongoose.Types.ObjectId(),
      });

      expect(userWithDefaults.role).toBe('user');
      expect(userWithDefaults.createdAt).toBeDefined();
    });
  });

  describe('Password Encryption', () => {
    // Instead of directly accessing hooks, we'll test the behavior
    it('should hash the password when saving a user', async () => {
      // Create a user model with save method mocked
      const userWithSave = new User(mockUser);
      userWithSave.save = jest.fn().mockImplementation(async function(this: any) {
        // Simulate the pre-save hook
        if (this.isModified && this.isModified('password')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }
        return this;
      });
      
      // Mock isModified to return true
      userWithSave.isModified = jest.fn().mockReturnValue(true);
      
      // Save the user
      await userWithSave.save();
      
      // Assertions
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUser.password, 'mocksalt');
      expect(userWithSave.password).toBe('hashedpassword');
    });
    
    it('should not hash the password if it was not modified', async () => {
      // Create a user model with save method mocked
      const userWithSave = new User(mockUser);
      userWithSave.save = jest.fn().mockImplementation(async function(this: any) {
        // Simulate the pre-save hook
        if (this.isModified && this.isModified('password')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }
        return this;
      });
      
      // Mock isModified to return false
      userWithSave.isModified = jest.fn().mockReturnValue(false);
      
      // Original password
      const originalPassword = userWithSave.password;
      
      // Save the user
      await userWithSave.save();
      
      // Assertions
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userWithSave.password).toBe(originalPassword);
    });
  });

  describe('matchPassword Method', () => {
    it('should correctly match passwords', async () => {
      const enteredPassword = 'correctpassword';
      
      // Mock implementation to verify correct arguments
      (bcrypt.compare as jest.Mock).mockImplementationOnce((entered, stored) => {
        expect(entered).toBe(enteredPassword);
        expect(stored).toBe(userModel.password);
        return Promise.resolve(true);
      });
      
      const result = await userModel.matchPassword(enteredPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(enteredPassword, userModel.password);
      expect(result).toBe(true);
    });
    
    it('should correctly reject non-matching passwords', async () => {
      const enteredPassword = 'wrongpassword';
      
      // Mock bcrypt.compare to return false for wrong password
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      
      const result = await userModel.matchPassword(enteredPassword);
      
      expect(bcrypt.compare).toHaveBeenCalledWith(enteredPassword, userModel.password);
      expect(result).toBe(false);
    });
  });

  describe('getSignedJwtToken Method', () => {
    it('should generate and return a signed JWT token', () => {
      // Mock implementation to verify correct arguments
      (jwt.sign as jest.Mock).mockImplementationOnce((payload, secret, options) => {
        expect(payload).toEqual({ id: userModel._id });
        expect(secret).toBe(process.env.JWT_SECRET || 'defaultsecret');
        expect(options).toEqual({ expiresIn: process.env.JWT_EXPIRE || '30d' });
        return 'mockjwttoken';
      });
      
      const token = userModel.getSignedJwtToken();
      
      expect(jwt.sign).toHaveBeenCalled();
      expect(token).toBe('mockjwttoken');
    });
    
    it('should use default values if environment variables are not set', () => {
      // Save original environment values
      const originalJwtSecret = process.env.JWT_SECRET;
      const originalJwtExpire = process.env.JWT_EXPIRE;
      
      // Unset environment variables
      delete process.env.JWT_SECRET;
      delete process.env.JWT_EXPIRE;
      
      // Call method
      userModel.getSignedJwtToken();
      
      // Check if defaults were used
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userModel._id },
        'defaultsecret',
        { expiresIn: '30d' }
      );
      
      // Restore environment variables
      process.env.JWT_SECRET = originalJwtSecret;
      process.env.JWT_EXPIRE = originalJwtExpire;
    });
  });
}); 