import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate and add request ID to each request
 * This helps in tracking requests through the microservices architecture
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Check if request ID already exists (might be passed from API Gateway)
  const existingRequestId = req.headers['x-request-id'];
  
  // Generate new request ID if none exists
  const requestId = existingRequestId || uuidv4();
  
  // Add request ID to request object for use in controllers
  req.headers['x-request-id'] = requestId;
  
  // Add request ID to response headers for client tracking
  res.setHeader('X-Request-ID', requestId);
  
  next();
}; 