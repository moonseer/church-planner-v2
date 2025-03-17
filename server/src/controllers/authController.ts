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

/**
 * Generate JWT token
 */
const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET || 'defaultsecret';
  const payload = { id };
  
  // @ts-ignore - Ignoring TypeScript error for JWT sign
  return jwt.sign(payload, jwtSecret, {
    expiresIn: '30d',
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

      const responseData: IRegisterResponse = {
        user: userData,
        token: generateToken(user._id.toString()),
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

    // Check for user email
    const user = await userService.findByEmail(email);

    if (!user) {
      return sendErrorResponse(res, 'Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendErrorResponse(res, 'Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Get user with church data
    const userWithChurch = await userService.findUserWithChurch(user._id.toString());
    
    if (!userWithChurch) {
      return sendErrorResponse(res, 'User data could not be retrieved', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Format user data for response
    const userData = formatUserResponse(userWithChurch, userWithChurch.church as any);

    const responseData: ILoginResponse = {
      user: userData,
      token: generateToken(user._id.toString()),
    };

    return sendSuccessResponse(res, responseData);
  } catch (error) {
    handleError(res, error);
  }
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