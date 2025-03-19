import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import os from 'os';
import mongoose from 'mongoose';

/**
 * Basic health check controller
 * @param req - Express request object
 * @param res - Express response object
 */
export const getHealth = (req: Request, res: Response): void => {
  const healthInfo = {
    status: 'UP',
    service: process.env.SERVICE_NAME || 'service-template',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: process.memoryUsage()
    }
  };

  res.status(StatusCodes.OK).json(healthInfo);
};

/**
 * Deep health check controller with database connection test
 * @param req - Express request object
 * @param res - Express response object
 */
export const getDeepHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
    
    const healthInfo = {
      status: dbStatus === 'UP' ? 'UP' : 'DEGRADED',
      service: process.env.SERVICE_NAME || 'service-template',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown'
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: process.memoryUsage()
      }
    };

    const statusCode = dbStatus === 'UP' ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(healthInfo);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'DOWN',
      service: process.env.SERVICE_NAME || 'service-template',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
}; 