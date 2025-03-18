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
import { Request, Response, NextFunction } from 'express';
import { userService, churchService } from '../services';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { JWT_COOKIE_EXPIRE } from '../config/auth';
import ErrorResponse from '../utils/ErrorResponse';
import nodemailer from 'nodemailer';

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
 * Send email using nodemailer
 */
const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  html?: string;
}): Promise<void> => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASSWORD || '',
    },
  });

  // Define email options
  const message = {
    from: `${process.env.FROM_NAME || 'Church Planner'} <${
      process.env.FROM_EMAIL || 'noreply@churchplanner.com'
    }>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send email
  await transporter.sendMail(message);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const userExists = await userService.findByEmail(email);

    if (userExists) {
      return sendErrorResponse(res, 'User already exists', HttpStatus.BAD_REQUEST);
    }

    // Create user
    const user = await userService.createUser(
      {
        firstName,
        lastName,
        email,
        password,
        role: 'user',
        churches: [],
        isActive: true,
        loginAttempts: 0
      },
      null
    );

    if (user) {
      // Format user data for response
      const userData = formatUserResponse(user, null);
      
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
    next(error);
  }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    next(error);
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

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user: IUserDocument, statusCode: number, res: Response) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // use HTTPS in production
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        churches: user.churches,
      },
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new ErrorResponse('User authentication required', 401)
      );
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}; 