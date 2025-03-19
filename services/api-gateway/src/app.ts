import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { StatusCodes } from 'http-status-codes';

import config from './config/config';
import logger, { logStream } from './utils/logger';
import { requestIdMiddleware } from './middleware/requestId.middleware';
import { authenticate } from './middleware/auth.middleware';
import { rateLimiter, authRateLimiter } from './middleware/rateLimit.middleware';
import { setupProxies, handleUndefinedRoutes } from './middleware/proxy.middleware';
import healthRoutes from './routes/health.routes';

// Initialize express app
const app = express();

// Apply global middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('combined', { stream: logStream })); // Request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request bodies

// Setup CORS
app.use(cors(config.cors));

// Add request ID to each request
app.use(requestIdMiddleware);

// Rate limiting
app.use(`${config.apiPrefix}/auth`, authRateLimiter); // Stricter limits for auth routes
app.use(rateLimiter); // General rate limiting

// Health check routes (these should be publicly accessible)
app.use('/health', healthRoutes);

// Swagger API documentation
if (config.nodeEnv !== 'production') {
  // Only mount Swagger in non-production environments
  try {
    const swaggerDocument = require('../swagger.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    logger.info('Swagger API documentation available at /api-docs');
  } catch (error) {
    logger.warn('Swagger documentation not available', error);
  }
}

// Authentication middleware
app.use(authenticate);

// Set up proxies for all microservices
setupProxies(app);

// Error handling for undefined routes
app.use(handleUndefinedRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  
  logger.error(`Error: ${message}`, { 
    url: req.originalUrl, 
    method: req.method, 
    statusCode,
    stack: config.nodeEnv === 'development' ? err.stack : undefined 
  });
  
  res.status(statusCode).json({
    status: 'error',
    message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined
  });
});

export default app; 