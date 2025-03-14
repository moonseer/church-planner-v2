# Error Tracking and Monitoring

This document provides information about error tracking and monitoring for the Church Planner application.

## Overview

The Church Planner application uses Sentry for error tracking and Winston for logging. This setup allows for comprehensive error monitoring and debugging across all environments.

## Sentry Integration

[Sentry](https://sentry.io/) is used for real-time error tracking and monitoring. It captures unhandled exceptions and provides detailed information about errors, including:

- Stack traces
- Request data
- User context
- Environment information
- Performance metrics

### Setup

To use Sentry in your environment:

1. Create a Sentry account and project
2. Add the Sentry DSN to your environment variables:

```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project
```

### Configuration

Sentry is configured in `server/src/utils/errorHandler.ts` with the following settings:

- Environment-based configuration
- Sampling rates adjusted for each environment
- Automatic capture of unhandled exceptions and rejections

### Usage

Errors are automatically captured by the global error handler. You can also manually capture errors or events:

```typescript
import * as Sentry from '@sentry/node';

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  // Handle the error
}
```

## Logging with Winston

[Winston](https://github.com/winstonjs/winston) is used for application logging. It provides structured logging with different levels and formats.

### Log Levels

The following log levels are used (in order of severity):

1. `error`: Critical errors that require immediate attention
2. `warn`: Warning conditions that should be addressed
3. `info`: Informational messages about application state
4. `http`: HTTP request logs
5. `debug`: Detailed debugging information

### Configuration

Winston is configured in `server/src/utils/logger.ts` with the following features:

- Environment-based log levels
- Colorized console output
- JSON-formatted file logs in production
- Separate error log file in production

### Usage

```typescript
import { logger } from '../utils/logger';

// Different log levels
logger.error('Critical error occurred');
logger.warn('Warning condition');
logger.info('Application state information');
logger.http('HTTP request details');
logger.debug('Debugging information');

// With metadata
logger.info('User action', { userId: '123', action: 'login' });
```

## HTTP Request Logging

HTTP requests are logged using Morgan middleware, which is integrated with Winston:

```typescript
import morgan from 'morgan';
import { stream } from './utils/logger';

app.use(morgan('combined', { stream }));
```

## Log Files

In production, logs are stored in the following files:

- `logs/error.log`: Contains only error-level logs
- `logs/combined.log`: Contains all logs

## Monitoring Dashboard

For production monitoring, consider setting up:

1. Sentry dashboard for error tracking
2. Grafana or similar for metrics visualization
3. Alerting based on error rates or critical issues

## Best Practices

### Error Handling

1. Use the `createError` utility for operational errors
2. Let the global error handler manage responses
3. Add context to errors when possible

### Logging

1. Choose appropriate log levels
2. Include relevant context in log messages
3. Don't log sensitive information
4. Use structured logging for machine-readable logs

### Monitoring

1. Set up alerts for critical errors
2. Regularly review error trends
3. Use performance monitoring to identify bottlenecks

## Dependencies

To use the error tracking and logging functionality, you need to install the following dependencies:

```bash
npm install --save @sentry/node winston
npm install --save-dev @types/winston
```

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/platforms/node/)
- [Winston Documentation](https://github.com/winstonjs/winston#readme)
- [Node.js Error Handling Best Practices](https://www.joyent.com/node-js/production/design/errors) 