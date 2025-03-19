import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createLogger, LogLevel } from '../../shared/utils/logger';
import { formatErrorResponse, AppError } from '../../shared/utils/error';
import { StatusCodes } from '../../shared/constants/statusCodes';

// Import routes
import healthRoutes from './routes/health.routes';

// Create Express application
const app: Application = express();

// Initialize logger
const logger = createLogger('service-template', LogLevel.INFO);

// Middleware
app.use(helmet()); // Set security-related HTTP headers
app.use(cors()); // Enable CORS for all routes
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Development logging format
} else {
  app.use(morgan('combined')); // Production logging format
}

// Create request ID middleware (for tracking requests across services)
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  next();
});

// Routes
app.use('/health', healthRoutes);

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError('Route not found', StatusCodes.NOT_FOUND);
  next(error);
});

// Global error handler
app.use((err: AppError | Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error occurred', { error: err });
  
  const errorResponse = formatErrorResponse(err);
  
  res.status(errorResponse.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: errorResponse.error
  });
});

export { app, logger }; 