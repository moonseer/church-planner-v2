import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const router = Router();

// Basic health check
router.get('/', (_req: Request, res: Response) => {
  logger.debug('Health check endpoint called');
  return res.status(200).json({
    status: 'ok',
    service: 'member-service',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check including MongoDB connection status
router.get('/detailed', (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  logger.debug('Detailed health check endpoint called');
  return res.status(200).json({
    status: 'ok',
    service: 'member-service',
    timestamp: new Date().toISOString(),
    details: {
      mongodb: mongoStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
});

export default router; 