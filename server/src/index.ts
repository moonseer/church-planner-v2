import express from 'express';
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
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
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

// Start server
const PORT = process.env.PORT || 8080;

// Connect to database
connectDB().then(() => {
  // Initialize Swagger
  swaggerDocs(app);

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
      });
      
      // Optional HTTP server that redirects to HTTPS
      http.createServer((req, res) => {
        res.writeHead(301, { 'Location': `https://${req.headers.host}${req.url}` });
        res.end();
      }).listen(process.env.HTTP_PORT || 8081);
      
    } catch (error) {
      logger.error('Failed to start HTTPS server, falling back to HTTP:', error);
      app.listen(PORT, () => {
        logger.warn(`Server running in production mode on port ${PORT} (HTTP - Not Secure)`);
      });
    }
  } else {
    // Development mode - use HTTP
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  }
});

export default app; 