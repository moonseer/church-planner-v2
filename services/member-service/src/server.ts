import app from './app';
import config from './config';
import logger from './utils/logger';

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// Start the server
const server = app.listen(config.port, () => {
  logger.info(`Member Service running on port ${config.port} in ${config.env} mode`);
  logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal (e.g., when running in a containerized environment)
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});

export default server; 