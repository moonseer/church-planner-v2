import { Router } from 'express';
import { getHealth, getDeepHealth } from '../controllers/health.controller';

const router = Router();

/**
 * @route GET /health
 * @desc Basic health check endpoint
 * @access Public
 */
router.get('/', getHealth);

/**
 * @route GET /health/deep
 * @desc Deep health check endpoint with service connectivity tests
 * @access Public
 */
router.get('/deep', getDeepHealth);

export default router; 