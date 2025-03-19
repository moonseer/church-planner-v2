import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import config from './config/config';
import logger from './utils/logger';
import { globalErrorHandler } from './utils/errorHandler';

// Import route files
import healthRoutes from './routes/health.routes';
import churchRoutes from './routes/church.routes';

// Initialize Express app
const app: Express = express();

// Connect to MongoDB
mongoose
  .connect(config.mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(helmet());

// Morgan logger middleware
app.use(morgan('dev', {
  stream: {
    write: (message: string) => logger.http(message.trim())
  }
}));

// Add request ID middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  next();
});

// Routes
app.use('/health', healthRoutes);
app.use('/api/churches', churchRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    error: 'Resource not found'
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app; 