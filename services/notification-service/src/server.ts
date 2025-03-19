import app from './app';
import config from './config';
import logger from './utils/logger';
import emailService from './utils/emailService';

// Start the server
const server = app.listen(config.port, () => {
  logger.info(`Notification Service running in ${config.environment} mode on port ${config.port}`);
  
  // Initialize email service if in production
  if (config.environment === 'production') {
    emailService.initialize()
      .then(() => {
        logger.info('Email service initialized');
      })
      .catch((error) => {
        logger.error('Failed to initialize email service', { error });
      });
  } else {
    // In development, create a test account if not provided
    if (!config.email.auth.user || !config.email.auth.pass) {
      emailService.createTestAccount()
        .then(() => {
          logger.info('Email test account created');
        })
        .catch((error) => {
          logger.error('Failed to create email test account', { error });
        });
    } else {
      emailService.initialize()
        .then(() => {
          logger.info('Email service initialized with provided credentials');
        })
        .catch((error) => {
          logger.error('Failed to initialize email service', { error });
        });
    }
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection:', reason);
  // Close server and exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Close server and exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

export default server; 