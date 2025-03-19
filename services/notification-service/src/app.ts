import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoose from 'mongoose';
import config from './config';
import { stream } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorMiddleware';
import notificationRoutes from './routes/notification.routes';
import templateRoutes from './routes/template.routes';
import preferenceRoutes from './routes/preference.routes';
import logger from './utils/logger';

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(config.mongo.uri)
  .then(() => {
    logger.info('MongoDB connected successfully');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.cors.origin.split(','),
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON requests
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded requests

// Logging
app.use(morgan('dev', { stream }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/preferences', preferenceRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app; 