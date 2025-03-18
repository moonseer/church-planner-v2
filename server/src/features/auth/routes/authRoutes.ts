import express from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../../../middleware/authMiddleware';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @description Login a user
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/me
 * @description Get current user profile
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router; 