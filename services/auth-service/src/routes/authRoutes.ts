import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  updateDetails, 
  updatePassword,
  refreshToken,
  logout
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/auth/refresh-token
 * @description Refresh a user's token
 * @access Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route GET /api/auth/me
 * @description Get current user profile
 * @access Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route PUT /api/auth/updatedetails
 * @description Update user details
 * @access Private
 */
router.put('/updatedetails', authenticate, updateDetails);

/**
 * @route PUT /api/auth/updatepassword
 * @description Update user password
 * @access Private
 */
router.put('/updatepassword', authenticate, updatePassword);

/**
 * @route POST /api/auth/logout
 * @description Logout a user
 * @access Private
 */
router.post('/logout', authenticate, logout);

export default router; 