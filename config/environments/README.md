# Environment Configurations

This directory contains environment-specific configuration files for the Church Planner v2 application.

## Files

- `development.env.example`: Example environment variables for development
- `production.env.example`: Example environment variables for production
- `test.env.example`: Example environment variables for testing

## Usage

1. Copy the appropriate example file and remove the `.example` suffix:
   ```bash
   cp development.env.example .env
   ```

2. Edit the `.env` file to set the correct values for your environment.

3. The application will load these environment variables at startup.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, production, test) | `development` |
| `PORT` | Port for the server to listen on | `8080` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/church_planner` |
| `JWT_SECRET` | Secret for signing JWT tokens | `your-secret-key` |
| `CLIENT_URL` | URL of the client application | `http://localhost:3030` |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging level | `info` | `debug` |
| `RATE_LIMIT_WINDOW` | Rate limiting window in minutes | `15` | `60` |
| `RATE_LIMIT_MAX` | Maximum requests in window | `100` | `1000` |
| `SESSION_SECRET` | Secret for session cookies | | `your-session-secret` |
| `SMTP_HOST` | SMTP server host | | `smtp.example.com` |
| `SMTP_PORT` | SMTP server port | `587` | `25` |
| `SMTP_USER` | SMTP server username | | `user@example.com` |
| `SMTP_PASS` | SMTP server password | | `password` |
| `SMTP_FROM` | From email address | | `no-reply@churchplanner.example.com` |

## Security Considerations

- Do not commit actual `.env` files to version control
- Use different secrets for different environments
- Rotate secrets periodically
- Consider using a secrets management service in production

## Example Usage in Code

```typescript
// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

// Load the appropriate .env file based on NODE_ENV
const envFile = path.resolve(__dirname, `../../config/environments/${process.env.NODE_ENV || 'development'}.env`);
dotenv.config({ path: envFile });

// Use environment variables
const port = process.env.PORT || 8080;
const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;

// Validate required environment variables
if (!mongoUri || !jwtSecret) {
  console.error('Missing required environment variables');
  process.exit(1);
}
``` 