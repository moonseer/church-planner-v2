# Docker Setup for Church Planner

This document provides instructions for running the Church Planner application using Docker. Docker allows you to run the application in isolated containers, making it easier to set up and run consistently across different environments.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

The easiest way to get started is by using the included helper script:

```bash
# Make the helper script executable (if not already)
chmod +x docker-helper.sh

# Show available commands
./docker-helper.sh help

# Start development environment
./docker-helper.sh start-dev
```

## Docker Environments

The Church Planner application has two Docker environments:

### Development Environment

The development environment is optimized for development, with features like:

- Hot reloading of code changes
- Volume mapping for real-time code updates
- Development-specific environment variables
- Exposed debug ports

To start the development environment:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- Client (React) on http://localhost:3000
- Server (Node.js) on http://localhost:8080
- MongoDB on port 27017
- MongoDB Express (web UI) on http://localhost:8081

### Production Environment

The production environment is optimized for performance and security, with features like:

- Multi-stage builds for smaller images
- Production-specific optimizations
- Non-root user execution
- Health checks for all services

To start the production environment:

```bash
docker-compose up -d
```

This will start:
- Client (React) on http://localhost:80
- Server (Node.js) on http://localhost:8080
- MongoDB on port 27017
- MongoDB Express (web UI) on http://localhost:8081

## Docker Files

The Church Planner application uses the following Docker files:

- `docker-compose.yml` - Production Docker Compose configuration
- `docker-compose.dev.yml` - Development Docker Compose configuration
- `client/Dockerfile` - Production Dockerfile for the client
- `client/Dockerfile.dev` - Development Dockerfile for the client
- `server/Dockerfile` - Production Dockerfile for the server
- `server/Dockerfile.dev` - Development Dockerfile for the server
- `client/nginx.conf` - Nginx configuration for the client

## Helper Script

The included `docker-helper.sh` script provides convenient commands for working with Docker:

- `./docker-helper.sh start-dev` - Start development environment
- `./docker-helper.sh stop-dev` - Stop development environment
- `./docker-helper.sh start-prod` - Start production environment
- `./docker-helper.sh stop-prod` - Stop production environment
- `./docker-helper.sh build-dev` - Build development containers
- `./docker-helper.sh build-prod` - Build production containers
- `./docker-helper.sh logs [service]` - View logs for a service
- `./docker-helper.sh clean` - Remove all containers, volumes, and images
- `./docker-helper.sh status` - Show container status
- `./docker-helper.sh help` - Show help message

## Environment Variables

The Docker Compose files include environment variables for various services. For security reasons, you should not use the default values in production. You can override them by:

1. Using a `.env` file in the same directory as the Docker Compose file
2. Setting environment variables before running Docker Compose
3. Editing the Docker Compose file directly (not recommended)

Example `.env` file:

```
MONGO_USERNAME=admin
MONGO_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret
```

## Common Tasks

### Accessing Container Shell

```bash
# For the server container
docker-compose exec server sh

# For the client container
docker-compose exec client sh

# For the MongoDB container
docker-compose exec mongodb bash
```

### Viewing Logs

```bash
# Using the helper script
./docker-helper.sh logs server

# Or using Docker Compose directly
docker-compose logs -f server
```

### Database Backup and Restore

```bash
# Backup
docker-compose exec mongodb sh -c 'mongodump --uri="mongodb://admin:password@localhost:27017/church_planner?authSource=admin" --archive' > backup.archive

# Restore
cat backup.archive | docker-compose exec -T mongodb sh -c 'mongorestore --uri="mongodb://admin:password@localhost:27017/church_planner?authSource=admin" --archive'
```

## Troubleshooting

### Port Conflicts

If you encounter port conflicts, you can change the mapped ports in the Docker Compose files:

```yaml
ports:
  - "8081:8081"  # Change the first number to a different port
```

### Container Not Starting

Check the logs for error messages:

```bash
docker-compose logs server
```

### Clearing Docker Data

If you need to start from scratch:

```bash
./docker-helper.sh clean
```

## Security Considerations

1. Change default passwords in production environments
2. Use Docker secrets for sensitive information
3. Keep Docker and all images updated
4. Use non-root users in containers (already configured)
5. Set resource limits for containers in production

## Performance Tuning

For production deployments, consider:

1. Setting resource limits for containers
2. Using a dedicated MongoDB instance
3. Implementing a Redis cache
4. Setting up load balancing for multiple instances

## Next Steps

1. Set up continuous integration for Docker builds
2. Implement Docker image versioning
3. Configure container orchestration (Kubernetes/ECS)
4. Set up monitoring and logging solutions 