import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerDocs from './config/swagger';

// Import routes
import churchRoutes from './routes/churchRoutes';
import authRoutes from './routes/authRoutes';
import eventTypeRoutes from './routes/eventTypeRoutes';
import eventRoutes from './routes/eventRoutes';
import teamRoutes from './routes/teamRoutes';
import teamMemberRoutes from './routes/teamMemberRoutes';
import serviceRoutes from './routes/serviceRoutes';
import metricsRoutes from './routes/metrics';

// Import logging and error handling
import morgan from 'morgan';
import { logger, stream } from './utils/logger';
import { errorHandler, setupUnhandledRejections } from './utils/errorHandler';
import { metricsMiddleware, metricsEndpoint } from './utils/metrics';
import { setupDbMonitoring } from './utils/dbMonitoring';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup request logging
app.use(morgan('combined', { stream }));

// Add metrics middleware
app.use(metricsMiddleware);

// Mount routes
app.use('/api/churches', churchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/teams/:teamId/members', teamMemberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/metrics', metricsRoutes);

// Add metrics endpoint
app.get('/metrics', metricsEndpoint);

// Basic route
app.get('/', (req, res) => {
  res.send('Church Planner API is running');
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Initialize database monitoring
setupDbMonitoring();

// Setup global error handler (should be after all routes)
app.use(errorHandler);

// Setup unhandled rejection handlers
setupUnhandledRejections();

// Only start the server if this file is run directly (not when imported for testing)
if (process.env.NODE_ENV !== 'test' && require.main === module) {
  const PORT = process.env.PORT || 8080;
  const portNumber = parseInt(PORT.toString(), 10);

  const server = app.listen(portNumber, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${portNumber}`);
    
    // Connect to database
    connectDB();
    
    // Setup Swagger docs
    swaggerDocs(app, portNumber);
  });
}

export default app; 