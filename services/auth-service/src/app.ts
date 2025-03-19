import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import authRoutes from './routes/authRoutes';
import config from './config/config';
import { ApiResponse } from './utils/apiResponse';

// Initialize express app
const app: Application = express();

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request ID middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.id = req.headers['x-request-id'] as string || 
           req.headers['x-correlation-id'] as string || 
           Math.random().toString(36).substring(2, 15);
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'success',
    service: config.serviceName,
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  return ApiResponse.notFound(res, 'Endpoint not found');
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  return ApiResponse.serverError(res, 'Internal server error');
});

export default app; 