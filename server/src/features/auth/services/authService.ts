import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import mongoose from 'mongoose';

// Types for auth service
export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface AuthServiceResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: string;
  };
  error?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData: RegisterUserInput): Promise<AuthServiceResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        return { error: 'Email is already registered' };
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: any) {
      return { error: error.message || 'Error registering user' };
    }
  }

  /**
   * Authenticate user and generate token
   */
  async loginUser(credentials: LoginUserInput): Promise<AuthServiceResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: credentials.email.toLowerCase() });
      if (!user) {
        return { error: 'Invalid email or password' };
      }

      // Check if account is locked
      if (user.isLocked()) {
        const lockTime = user.lockUntil ? new Date(user.lockUntil) : new Date();
        return { 
          error: `Account is locked. Try again after ${lockTime.toLocaleTimeString()}` 
        };
      }

      // Verify password
      const isMatch = await user.comparePassword(credentials.password);
      if (!isMatch) {
        // Increment login attempts on failed password
        await user.incrementLoginAttempts();
        return { error: 'Invalid email or password' };
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: any) {
      return { error: error.message || 'Error logging in' };
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: IUser): string {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    // Type assertion to handle _id type
    const id = (user._id as mongoose.Types.ObjectId).toString();

    return jwt.sign(
      {
        id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { valid: boolean; decoded?: any; error?: string } {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret);
      return { valid: true, decoded };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthServiceResponse> {
    try {
      const user = await User.findById(userId).select('-password -loginAttempts -lockUntil');
      if (!user) {
        return { error: 'User not found' };
      }

      return {
        user: {
          id: (user._id as mongoose.Types.ObjectId).toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      };
    } catch (error: any) {
      return { error: error.message || 'Error retrieving user' };
    }
  }
}

export default new AuthService(); 