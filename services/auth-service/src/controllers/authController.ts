import { Request, Response } from 'express';
import authService from '../services/authService';
import { ApiResponse } from '../utils/apiResponse';

// Import the RequestWithUser interface
interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  // Validate request body
  if (!email || !password || !firstName || !lastName) {
    return ApiResponse.badRequest(res, 'Please provide all required fields');
  }

  const result = await authService.registerUser({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
  });

  if (result.error) {
    return ApiResponse.badRequest(res, result.error);
  }

  return ApiResponse.created(res, {
    tokens: result.tokens,
    user: result.user
  });
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return ApiResponse.badRequest(res, 'Please provide email and password');
  }

  const result = await authService.loginUser({ email, password });

  if (result.error) {
    // If the error mentions account is locked, return 429 Too Many Requests
    if (result.error.includes('Account is locked')) {
      return ApiResponse.tooManyRequests(res, result.error);
    }
    return ApiResponse.unauthorized(res, result.error);
  }

  return ApiResponse.success(res, {
    tokens: result.tokens,
    user: result.user
  });
};

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ApiResponse.badRequest(res, 'Refresh token is required');
  }

  const result = await authService.refreshToken({ refreshToken });

  if (result.error) {
    return ApiResponse.unauthorized(res, result.error);
  }

  return ApiResponse.success(res, {
    tokens: result.tokens,
    user: result.user
  });
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req: RequestWithUser, res: Response): Promise<Response> => {
  const authHeader = req.headers.authorization;
  const refreshToken = req.body.refreshToken;

  if (!authHeader || !authHeader.startsWith('Bearer ') || !refreshToken) {
    return ApiResponse.badRequest(res, 'Access token and refresh token are required');
  }

  const accessToken = authHeader.split(' ')[1];
  
  const result = await authService.logout(accessToken, refreshToken);

  if (!result.success) {
    return ApiResponse.badRequest(res, result.error || 'Logout failed');
  }

  return ApiResponse.success(res, { message: 'Logged out successfully' });
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req: RequestWithUser, res: Response): Promise<Response> => {
  // User ID should be available from the auth middleware
  const userId = req.user?.id;

  if (!userId) {
    return ApiResponse.unauthorized(res, 'Not authenticated');
  }

  const result = await authService.getUserById(userId);

  if (result.error) {
    return ApiResponse.notFound(res, result.error);
  }

  return ApiResponse.success(res, { user: result.user });
};

/**
 * Update user details
 * @route PUT /api/auth/updatedetails
 * @access Private
 */
export const updateDetails = async (req: RequestWithUser, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  if (!userId) {
    return ApiResponse.unauthorized(res, 'Not authenticated');
  }

  const { email, firstName, lastName, phoneNumber } = req.body;
  
  // At least one field must be provided for update
  if (!email && !firstName && !lastName && !phoneNumber) {
    return ApiResponse.badRequest(res, 'Please provide at least one field to update');
  }

  const updateData = {
    ...(email && { email }),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(phoneNumber && { phoneNumber })
  };

  const result = await authService.updateUserDetails(userId, updateData);

  if (result.error) {
    return ApiResponse.badRequest(res, result.error);
  }

  return ApiResponse.success(res, { user: result.user });
};

/**
 * Update password
 * @route PUT /api/auth/updatepassword
 * @access Private
 */
export const updatePassword = async (req: RequestWithUser, res: Response): Promise<Response> => {
  const userId = req.user?.id;
  if (!userId) {
    return ApiResponse.unauthorized(res, 'Not authenticated');
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return ApiResponse.badRequest(res, 'Please provide current and new password');
  }

  const result = await authService.updatePassword(userId, { 
    currentPassword, 
    newPassword 
  });

  if (result.error) {
    return ApiResponse.badRequest(res, result.error);
  }

  return ApiResponse.success(res, { 
    message: 'Password updated successfully',
    tokens: result.tokens
  });
}; 