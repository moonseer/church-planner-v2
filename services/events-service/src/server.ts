import app from './app';
import config from './config';
import logger from './utils/logger';

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Events Service is running on port ${PORT} in ${config.env} mode`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  process.exit(1);
}); 