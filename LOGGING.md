# Logging System

This document provides information about the logging system for the Church Planner application.

## Overview

The Church Planner application uses Winston for application logging and Morgan for HTTP request logging. This setup provides comprehensive logging capabilities for debugging, monitoring, and auditing.

## Logging Architecture

The logging system consists of the following components:

1. **Winston Logger**: Core logging utility for application events
2. **Morgan**: HTTP request logging middleware
3. **Log Levels**: Different severity levels for categorizing logs
4. **Log Formats**: Different formats for development and production
5. **Log Storage**: Console and file-based storage options

## Winston Logger

Winston is a versatile logging library that supports multiple transports (output destinations) and formats.

### Configuration

The Winston logger is configured in `server/src/utils/logger.ts` with the following features:

- Custom log levels and colors
- Environment-specific log levels
- Formatted timestamps
- JSON formatting for production logs
- Console and file transports

### Log Levels

The following log levels are used (in order of severity):

1. `error`: Critical errors that require immediate attention
2. `warn`: Warning conditions that should be addressed
3. `info`: Informational messages about application state
4. `http`: HTTP request logs
5. `debug`: Detailed debugging information

The active log level is determined by:
- In development: Always `debug` (all logs)
- In other environments: The `LOG_LEVEL` environment variable, defaulting to `info`

### Usage

```typescript
import { logger } from '../utils/logger';

// Basic logging
logger.error('Database connection failed');
logger.warn('Rate limit approaching for user');
logger.info('User logged in successfully');
logger.debug('Processing request payload', { payload });

// With metadata
logger.info('User action', { 
  userId: '123', 
  action: 'create_event',
  timestamp: new Date().toISOString()
});

// Error logging with stack trace
try {
  // Some operation
} catch (error) {
  logger.error(`Operation failed: ${error.message}`, { 
    stack: error.stack,
    code: error.code
  });
}
```

## HTTP Request Logging

Morgan is used for HTTP request logging and is integrated with Winston.

### Configuration

Morgan is configured in `server/src/index.ts`:

```typescript
import morgan from 'morgan';
import { stream } from './utils/logger';

app.use(morgan('combined', { stream }));
```

### Log Format

The `combined` format includes:
- Remote address
- Remote user
- Date/time
- HTTP method
- URL
- HTTP version
- Status code
- Response size
- Referrer
- User agent

## Log Storage

### Development Environment

In development, logs are output to the console with colorized formatting for readability.

### Production Environment

In production, logs are:
1. Output to the console (for container environments)
2. Written to log files:
   - `logs/error.log`: Contains only error-level logs
   - `logs/combined.log`: Contains all logs

## Best Practices

### When to Use Each Log Level

- **error**: Use for exceptions and errors that prevent normal operation
- **warn**: Use for potentially harmful situations that don't prevent operation
- **info**: Use for significant events and milestones in normal operation
- **http**: Automatically used for HTTP requests
- **debug**: Use for detailed information useful during development

### Effective Logging

1. **Be Descriptive**: Include enough context to understand the log without additional information
2. **Include Metadata**: Add relevant objects or IDs as metadata rather than string concatenation
3. **Avoid Sensitive Data**: Never log passwords, tokens, or personal information
4. **Performance Consideration**: Use conditional logging for expensive operations
5. **Consistent Format**: Follow a consistent format for similar log messages

## Log Rotation

In production, consider setting up log rotation to manage log file sizes:

```bash
npm install --save winston-daily-rotate-file
```

This can be configured to rotate logs based on size or time intervals.

## Viewing Logs

### Development

Logs are visible in the console during development.

### Production

For production logs:

1. Access the log files directly on the server
2. Forward logs to a centralized logging system (ELK, Graylog, etc.)
3. Use a log viewer tool for the JSON-formatted logs

## Dependencies

To use the logging functionality, you need to install the following dependencies:

```bash
npm install --save winston morgan
npm install --save-dev @types/winston @types/morgan
```

## Additional Resources

- [Winston Documentation](https://github.com/winstonjs/winston#readme)
- [Morgan Documentation](https://github.com/expressjs/morgan#readme)
- [Node.js Logging Best Practices](https://blog.bitsrc.io/logging-best-practices-for-node-js-applications-8a0a5969b94c) 