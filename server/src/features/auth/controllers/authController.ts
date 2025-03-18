import { Request, Response } from 'express';
import authService from '../services/authService';

class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   * @access Public
   */
  async register(req: Request, res: Response): Promise<Response> {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    // Validate request body
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields',
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long',
      });
    }

    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });

    if (result.error) {
      return res.status(400).json({
        status: 'error',
        message: result.error,
      });
    }

    return res.status(201).json({
      status: 'success',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  }

  /**
   * Login user
   * @route POST /api/auth/login
   * @access Public
   */
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password',
      });
    }

    const result = await authService.loginUser({ email, password });

    if (result.error) {
      // If the error mentions account is locked, return 429 Too Many Requests
      if (result.error.includes('Account is locked')) {
        return res.status(429).json({
          status: 'error',
          message: result.error,
        });
      }

      return res.status(401).json({
        status: 'error',
        message: result.error,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  }

  /**
   * Get current user profile
   * @route GET /api/auth/me
   * @access Private
   */
  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    // User ID should be available from the auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
      });
    }

    const result = await authService.getUserById(userId);

    if (result.error) {
      return res.status(404).json({
        status: 'error',
        message: result.error,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: result.user,
      },
    });
  }
}

export default new AuthController(); 