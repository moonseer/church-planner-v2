import express from 'express';
import { receiveClientMetrics } from '../controllers/metricsController';

const router = express.Router();

// @route   POST /api/metrics/client
// @desc    Receive client-side metrics
// @access  Public
router.post('/client', receiveClientMetrics);

export default router; 