import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import os from 'os';
import config from '../config/config';
import logger from '../utils/logger';

/**
 * Basic health check controller
 * @param req - Express request object
 * @param res - Express response object
 */
export const getHealth = (req: Request, res: Response): void => {
  const healthInfo = {
    status: 'UP',
    service: config.serviceName,
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
 * Deep health check controller with service connectivity tests
 * @param req - Express request object
 * @param res - Express response object
 */
export const getDeepHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check connectivity to all services
    const serviceStatuses = await checkServicesHealth();
    
    // Determine overall status
    const allServicesUp = Object.values(serviceStatuses).every(status => status === 'UP');
    const overallStatus = allServicesUp ? 'UP' : 'DEGRADED';
    
    const healthInfo = {
      status: overallStatus,
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: serviceStatuses,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: process.memoryUsage()
      }
    };

    const statusCode = overallStatus === 'UP' ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;
    res.status(statusCode).json(healthInfo);
  } catch (error) {
    logger.error(`Health check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'DOWN',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Helper function to check the health of all microservices
 * @returns Object with service health status
 */
async function checkServicesHealth(): Promise<Record<string, string>> {
  const timeoutMs = 3000; // 3 seconds timeout
  const serviceStatuses: Record<string, string> = {};
  
  // Get all service URLs from config
  const services = {
    'auth-service': config.services.auth,
    'church-service': config.services.church,
    'member-service': config.services.member,
    'event-service': config.services.event
  };
  
  // Check each service in parallel
  const healthCheckPromises = Object.entries(services).map(async ([serviceName, serviceUrl]) => {
    try {
      const healthEndpoint = `${serviceUrl}/health`;
      
      const response = await axios.get(healthEndpoint, {
        timeout: timeoutMs,
        validateStatus: () => true // Don't throw on error status codes
      });
      
      // Service is UP if response status is 2xx
      serviceStatuses[serviceName] = response.status >= 200 && response.status < 300 
        ? 'UP' 
        : 'DOWN';
      
      logger.debug(`Health check for ${serviceName}: ${serviceStatuses[serviceName]}`);
    } catch (error) {
      // Service is DOWN if request fails
      serviceStatuses[serviceName] = 'DOWN';
      logger.warn(`Health check failed for ${serviceName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Wait for all health checks to complete
  await Promise.all(healthCheckPromises);
  
  return serviceStatuses;
} 