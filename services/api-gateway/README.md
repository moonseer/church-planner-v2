# Microservice Template

This is a template microservice for the Church Planner application. This template provides a standardized structure and configuration for creating new microservices in the system.

## Features

- Express server with TypeScript
- Health check endpoints
- Request ID tracking
- Standardized error handling
- Docker configuration
- Test setup with Jest
- Linting with ESLint
- Code formatting with Prettier

## Directory Structure

```
service-template/
├── src/
│   ├── config/      # Configuration files
│   ├── controllers/ # Request handlers
│   ├── middleware/  # Express middleware
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   ├── utils/       # Utility functions
│   ├── app.ts       # Express app setup
│   └── server.ts    # Server entry point
├── tests/
│   ├── unit/        # Unit tests
│   └── integration/ # Integration tests
├── .env.example     # Example environment variables
├── .gitignore       # Git ignore rules
├── Dockerfile       # Production Docker config
├── Dockerfile.dev   # Development Docker config
├── healthcheck.js   # Docker health check script
├── package.json     # Dependencies and scripts
└── tsconfig.json    # TypeScript configuration
```

## Getting Started

1. Copy this template and rename it for your service:
   ```bash
   cp -r service-template your-service-name
   ```

2. Update package.json with your service name and details.

3. Create an .env file based on .env.example:
   ```bash
   cp .env.example .env
   ```
   
4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Docker Usage

### Development:
```bash
docker build -t your-service-name:dev -f Dockerfile.dev .
docker run -p 3000:3000 --env-file .env your-service-name:dev
```

### Production:
```bash
docker build -t your-service-name:latest .
docker run -p 3000:3000 --env-file .env your-service-name:latest
```

## API Endpoints

- Health Check: `GET /health`
- Deep Health Check: `GET /health/deep`

## Adding New Features

When adding new features to your service:

1. Create models in the `src/models` directory
2. Add controllers in the `src/controllers` directory
3. Define routes in the `src/routes` directory
4. Register routes in `src/app.ts`
5. Write tests in the `tests` directory

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Linting and Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
``` 