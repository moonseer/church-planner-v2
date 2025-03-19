# Church Service

This service manages church data for the Church Planner application.

## Features

- Church CRUD operations
- Admin management
- Secure API with JWT authentication
- Validation with Joi
- Standardized error handling
- Comprehensive logging

## API Endpoints

- `GET /api/churches` - Get all churches (with pagination, filtering, and sorting)
- `GET /api/churches/:id` - Get a single church by ID
- `POST /api/churches` - Create a new church (requires authentication)
- `PUT /api/churches/:id` - Update a church (requires authentication and admin role)
- `DELETE /api/churches/:id` - Soft delete a church (requires authentication and ownership)
- `DELETE /api/churches/:id/permanent` - Hard delete a church (requires authentication and ownership)
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with MongoDB status

## Setup and Configuration

### Environment Variables

| Variable         | Description                                 | Default Value                  |
|------------------|---------------------------------------------|--------------------------------|
| PORT             | Port for the service to listen on           | 3002                           |
| NODE_ENV         | Environment (development/production)        | development                    |
| SERVICE_NAME     | Name of the service                         | church-service                 |
| MONGO_URI        | MongoDB connection string                   | mongodb://church-db:27017/church |
| JWT_SECRET       | Secret for JWT verification                 | dev_jwt_secret                 |
| JWT_AUDIENCE     | JWT audience claim                          | church-planner-api             |
| JWT_ISSUER       | JWT issuer claim                            | church-planner                 |
| API_GATEWAY_URL  | URL for the API Gateway                     | http://api-gateway:8000        |
| CORS_ORIGIN      | Allowed CORS origins                        | http://localhost:3000          |
| LOG_LEVEL        | Logging level                               | info                           |

## Development

### Prerequisites

- Node.js (v16+)
- MongoDB
- Docker and Docker Compose (for containerized development)

### Local Development

1. Clone the repository
2. Navigate to the service directory:
   ```
   cd services/church-service
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the service in development mode:
   ```
   npm run dev
   ```

### Docker Development

The service can be started as part of the entire application using Docker Compose:

```
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up church-service
```

## Building and Running in Production

### Build the Service

```
npm run build
```

### Run in Production Mode

```
npm start
```

### Docker Production

Build and run the Docker container:

```
docker build -t church-service .
docker run -p 3002:3002 --env-file .env church-service
```

## Testing

Run the test suite:

```
npm test
``` 