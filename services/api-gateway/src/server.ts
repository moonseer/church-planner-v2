import http from 'http';
import app from './app';
import logger from './utils/logger';
import config from './config/config';

// Get port from environment or use default
const port = config.port;

// Create HTTP server
const server = http.createServer(app);

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Start server
server.listen(port, () => {
  logger.info(`🚀 API Gateway started in ${config.nodeEnv} mode`);
  logger.info(`🔗 API Gateway listening on port ${port}`);
  logger.info(`💓 Health check available at http://localhost:${port}/health`);
  
  if (config.nodeEnv !== 'production') {
    logger.info(`📚 API documentation available at http://localhost:${port}/api-docs`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process in production, but log the error
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('API Gateway closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

export default server; 