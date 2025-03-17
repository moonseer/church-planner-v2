# Environment Configurations

This document provides information about the environment configurations for the Church Planner application.

## Overview

The Church Planner application uses environment-specific configuration files to manage different settings for development, staging, and production environments. This approach allows for consistent configuration across different deployment environments.

## Environment Files

The following environment files are available:

- `.env.example`: Template file with example values
- `.env.development`: Configuration for local development
- `.env.staging`: Configuration for the staging environment
- `.env.production`: Configuration for the production environment

## Using Environment Files

### Local Development

For local development, you can create a `.env` file based on `.env.development`:

```bash
cp .env.development .env
```

Then, modify the values as needed for your local setup.

### Staging and Production

For staging and production environments, the appropriate environment file should be used during deployment. This can be done by:

1. Copying the file to `.env` during the deployment process
2. Using environment-specific commands (e.g., `NODE_ENV=production npm start`)
3. Setting environment variables directly in your hosting platform

## Environment Variables

### Server Configuration

- `PORT`: The port on which the server will run
- `NODE_ENV`: The current environment (development, staging, production)

### MongoDB Configuration

- `MONGO_URI`: The connection string for MongoDB

### JWT Configuration

- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time

### Client Configuration

- `VITE_API_URL`: The URL for API requests from the client

### Logging Configuration

- `LOG_LEVEL`: The level of logging (debug, info, warn, error)

### Security Configuration

- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting in milliseconds
- `RATE_LIMIT_MAX`: Maximum number of requests allowed in the time window

## Security Considerations

### Sensitive Information

Never commit sensitive information (like production secrets) to version control. Instead:

1. Use environment variables in your hosting platform
2. Use a secure secrets management service
3. Generate unique secrets for each environment

### Production Secrets

For production, ensure that:

1. `JWT_SECRET` is a strong, unique value
2. Database credentials are secure
3. Any API keys or external service credentials are properly secured

## Environment-Specific Behavior

The application behavior changes based on the environment:

### Development

- Detailed logging
- Error stack traces
- No rate limiting
- Local database

### Staging

- Moderate logging
- Limited error details
- Moderate rate limiting
- Staging database

### Production

- Minimal logging
- No error details exposed to clients
- Strict rate limiting
- Production database

## Adding New Environment Variables

When adding new environment variables:

1. Add them to `.env.example` with a sample value
2. Add them to all environment files
3. Document them in this file
4. Update any deployment scripts or documentation 