import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerDocs from './config/swagger';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

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

// Add debug logging
console.log('=============================================');
console.log('SERVER STARTING UP - DEBUG INFORMATION');
console.log('=============================================');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set (hidden for security)' : 'NOT SET');
console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set (hidden for security)' : 'NOT SET');
console.log('Client URL:', process.env.CLIENT_URL);
console.log('=============================================');

// Create Express app
const app = express();

// HTTPS redirect middleware for production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Security headers middleware
app.use((req, res, next) => {
  // Prevent browsers from MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Set Content Security Policy if in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
    );
  }
  
  // Remove header that might reveal technology stack
  res.removeHeader('X-Powered-By');
  
  next();
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3030',
  credentials: true, // This is important for cookies to work with CORS
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token']
}));
app.use(express.json());
app.use(cookieParser()); // Add cookie-parser middleware

// Setup request logging
app.use(morgan('combined', { stream }));

// Add metrics middleware
app.use(metricsMiddleware);

// Setup CSRF protection
// Skip CSRF for API endpoints that don't require it (like metrics, health checks, or initial authentication)
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
});

// Simple health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/churches', csrfProtection, churchRoutes);
app.use('/api/auth', authRoutes); // No CSRF on auth routes
app.use('/api/event-types', csrfProtection, eventTypeRoutes);
app.use('/api/events', csrfProtection, eventRoutes);
app.use('/api/teams', csrfProtection, teamRoutes);
app.use('/api/team-members', csrfProtection, teamMemberRoutes);
app.use('/api/teams/:teamId/members', csrfProtection, teamMemberRoutes);
app.use('/api/services', csrfProtection, serviceRoutes);
app.use('/api/metrics', metricsRoutes); // No CSRF on metrics routes

// Route to get CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Add metrics endpoint
app.get('/metrics', metricsEndpoint);

// Basic route
app.get('/', (req, res) => {
  res.send('Church Planner API is running');
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    if (!process.env.MONGO_URI) {
      console.error('MongoDB connection string is not defined in environment variables');
      throw new Error('MongoDB connection string is not defined in environment variables');
    }
    
    console.log(`Connecting to MongoDB at: ${process.env.MONGO_URI.split('@')[1] || 'URI hidden'}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Additional connection options if needed
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database connection established successfully');
    return true;
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Full error:', error);
    
    // More informative error message based on error type
    if (error.name === 'MongoNetworkError') {
      console.error('MongoDB network error - Check if MongoDB container is running and network is properly configured');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('MongoDB server selection error - Check MongoDB server status and authentication credentials');
    }
    
    // Don't exit immediately in development to see the error
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('Not exiting in development mode, but MongoDB connection failed');
      return false;
    }
  }
};

// Initialize database monitoring
setupDbMonitoring();

// Setup global error handler (should be after all routes)
app.use(errorHandler);

// Setup unhandled rejection handlers
setupUnhandledRejections();

// Start server
const PORT = process.env.PORT || 8080;

// Connect to database and then start server
connectDB().then((connected) => {
  // Initialize Swagger
  swaggerDocs(app);

  if (connected || process.env.NODE_ENV === 'development') {
    console.log('Starting server...');
    
    if (process.env.NODE_ENV === 'production') {
      try {
        // Check if SSL certificate files exist
        const sslOptions = {
          key: fs.readFileSync(process.env.SSL_KEY_PATH || path.join(__dirname, '../ssl/key.pem')),
          cert: fs.readFileSync(process.env.SSL_CERT_PATH || path.join(__dirname, '../ssl/cert.pem'))
        };
        
        // Create HTTPS server
        https.createServer(sslOptions, app).listen(PORT, () => {
          logger.info(`Server running in production mode on port ${PORT} (HTTPS)`);
          console.log(`Server running in production mode on port ${PORT} (HTTPS)`);
        });
        
        // Optional HTTP server that redirects to HTTPS
        http.createServer((req, res) => {
          res.writeHead(301, { 'Location': `https://${req.headers.host}${req.url}` });
          res.end();
        }).listen(process.env.HTTP_PORT || 8081);
        
      } catch (error) {
        logger.error('Failed to start HTTPS server, falling back to HTTP:', error);
        console.error('Failed to start HTTPS server, falling back to HTTP:', error);
        
        app.listen(PORT, () => {
          logger.warn(`Server running in production mode on port ${PORT} (HTTP - Not Secure)`);
          console.log(`Server running in production mode on port ${PORT} (HTTP - Not Secure)`);
        });
      }
    } else {
      // Development mode - use HTTP
      app.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`API Documentation available at http://localhost:${PORT}/api/docs`);
        console.log(`Health check endpoint available at http://localhost:${PORT}/api/health`);
      });
    }
  } else {
    console.error('Server not started due to database connection failure');
  }
});

export default app; 