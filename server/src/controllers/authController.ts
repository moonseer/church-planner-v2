import { Request, Response } from 'express';
import User from '../models/User';
import Church from '../models/Church';
import mongoose from 'mongoose';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, churchName, churchAddress, churchCity, churchState, churchZip } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists with that email',
      });
      return;
    }

    // Create or find church
    let church;
    if (churchName) {
      // Check if church exists
      church = await Church.findOne({ name: churchName });
      
      // If church doesn't exist, create it
      if (!church) {
        church = await Church.create({
          name: churchName,
          address: churchAddress || '',
          city: churchCity || '',
          state: churchState || '',
          zip: churchZip || '',
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Church name is required',
      });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // Allow setting role during registration
      church: church._id,
    });

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        church: {
          id: church._id,
          name: church.name,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide an email and password',
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Get church info
    const church = await Church.findById(user.church);
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found',
      });
      return;
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        church: {
          id: church._id,
          name: church.name,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById((req as any).user.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Get church info
    const church = await Church.findById(user.church);
    if (!church) {
      res.status(404).json({
        success: false,
        error: 'Church not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        church: {
          id: church._id,
          name: church.name,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}; 