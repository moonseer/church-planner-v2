import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  ILoginRequest, 
  IRegisterRequest, 
  ILoginResponse, 
  IRegisterResponse, 
  IUserResponse,
  IUserWithChurch,
  UserRole,
  JwtPayload,
  IChurchInfo
} from '@shared/types/auth';
import { IUserDocument, IChurchDocument } from '@shared/types/mongoose';
import { ApiResponsePromise, HttpStatus } from '@shared/types/api';
import { sendSuccessResponse, sendErrorResponse, handleError } from '../utils/responseUtils';
import { Request, Response } from 'express';
import { userService, churchService } from '../services';

// Cookie options for JWT token
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax',
};

/**
 * Generate JWT token
 */
const generateToken = (id: string): string => {
  // Get JWT secret from environment variables
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.warn('WARNING: JWT_SECRET environment variable not set. Using a less secure fallback.');
    // In production, this should never happen as the app should fail to start without a JWT_SECRET
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }
  }
  
  const payload = { id };
  
  // @ts-ignore - Ignoring TypeScript error for JWT sign
  return jwt.sign(payload, jwtSecret || 'defaultsecret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

/**
 * Format user data for response
 */
const formatUserResponse = (
  user: IUserDocument & { _id: mongoose.Types.ObjectId }, 
  church?: IChurchDocument & { _id: mongoose.Types.ObjectId } | null
): IUserWithChurch => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    church: church ? {
      id: church._id.toString(),
      name: church.name,
    } : null,
  };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request<{}, {}, IRegisterRequest>, res: Response): Promise<void> => {
  try {
    const { name, email, password, churchName } = req.body;

    // Check if user exists
    const userExists = await userService.findByEmail(email);

    if (userExists) {
      return sendErrorResponse(res, 'User already exists', HttpStatus.BAD_REQUEST);
    }

    // Create church or find existing one
    let church;

    if (churchName) {
      const existingChurch = await churchService.findChurchesByName(churchName);

      if (existingChurch.length > 0) {
        church = existingChurch[0];
      } else {
        church = await churchService.create({ name: churchName });
      }
    }

    // Create user
    const user = await userService.createUser(
      {
        name,
        email,
        password,
        role: church ? UserRole.ADMIN : UserRole.USER,
      },
      church?._id.toString()
    );

    if (user) {
      // Format user data for response
      const userData = formatUserResponse(user, church);
      
      // Generate JWT token
      const token = generateToken(user._id.toString());
      
      // Set token in HTTP-only cookie
      res.cookie('token', token, cookieOptions);

      const responseData: IRegisterResponse = {
        user: userData,
        // No token in response body
      };

      return sendSuccessResponse(res, responseData, HttpStatus.CREATED);
    } else {
      return sendErrorResponse(res, 'Invalid user data', HttpStatus.BAD_REQUEST);
    }
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request<{}, {}, ILoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user email - include password for verification
    // and include login attempt fields for account locking
    const user = await userService.findByEmail(email, true);

    if (!user) {
      return sendErrorResponse(res, 'Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000); // Convert to minutes
      return sendErrorResponse(
        res, 
        `Account is locked due to too many failed attempts. Try again in ${lockTimeRemaining} minutes.`, 
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Increment login attempts and potentially lock account
      await user.incrementLoginAttempts();
      
      // If account is now locked after incrementing attempts
      if (user.lockUntil && user.lockUntil > new Date()) {
        return sendErrorResponse(
          res,
          'Account locked due to too many failed attempts. Try again in 15 minutes.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      
      return sendErrorResponse(res, 'Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Successful login - reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Get user with church data
    const userWithChurch = await userService.findUserWithChurch(user._id.toString());
    
    if (!userWithChurch) {
      return sendErrorResponse(res, 'User data could not be retrieved', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Format user data for response
    const userData = formatUserResponse(userWithChurch, userWithChurch.church as any);
    
    // Generate JWT token
    const token = generateToken(user._id.toString());
    
    // Set token in HTTP-only cookie
    res.cookie('token', token, cookieOptions);

    const responseData: ILoginResponse = {
      user: userData,
      // No token in response body
    };

    return sendSuccessResponse(res, responseData);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = (req: Request, res: Response): void => {
  // Clear the auth cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // Expire immediately
  });
  
  sendSuccessResponse(res, { message: 'Logged out successfully' });
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set in the auth middleware
    const user = await userService.findUserWithChurch((req as any).user.id);

    if (!user) {
      return sendErrorResponse(res, 'User not found', HttpStatus.NOT_FOUND);
    }

    // Format user data for response
    const userData = formatUserResponse(user, user.church as any);

    return sendSuccessResponse<IUserResponse>(res, { user: userData });
  } catch (error) {
    handleError(res, error);
  }
}; 