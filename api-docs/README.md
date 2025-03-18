# API Documentation

This directory contains documentation for the Church Planner v2 API.

## Directory Structure

- **swagger/**: OpenAPI (Swagger) specification files
  - `openapi.yaml`: Main OpenAPI specification
  - `paths/`: API endpoint definitions
  - `components/`: Reusable schema components

- **examples/**: Example API requests and responses
  - Organized by endpoint category (auth, events, etc.)
  - Contains sample payloads in JSON format

- **schemas/**: JSON Schema definitions
  - Data models used in the API
  - Validation schemas

## OpenAPI Specification

The API is documented using the [OpenAPI 3.0](https://swagger.io/specification/) specification. The main file is `swagger/openapi.yaml`, which references other files in the `paths` and `components` directories.

### Viewing the Documentation

When the server is running, you can access the Swagger UI at:

```
http://localhost:8080/api/docs
```

## API Endpoints

The API is organized around the following resources:

- **Authentication**: User registration, login, password reset
- **Churches**: Church creation, retrieval, updating, deletion
- **Events**: Event creation, retrieval, updating, deletion
- **Teams**: Team management
- **Services**: Service planning and scheduling

## Request Formats

All requests should be in JSON format, with the `Content-Type` header set to `application/json`.

Example:

```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "mypassword"
}
```

## Response Formats

All responses are in JSON format. Successful responses typically have the following structure:

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

Error responses have the following structure:

```json
{
  "status": "error",
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

## Authentication

Most API endpoints require authentication. To authenticate, include the JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

When rate-limited, the API will respond with a 429 status code.

## Versioning

The API is versioned using URL path versioning. The current version is v1:

```
/api/v1/resource
```

## Contributing to the Documentation

When adding new endpoints or modifying existing ones, please update the corresponding documentation:

1. Update the OpenAPI specification in `swagger/`
2. Add example requests/responses in `examples/`
3. Update any affected schemas in `schemas/` 