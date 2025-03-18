# Feature-Based Server Directory Structure

This directory contains feature-based modules for the Church Planner v2 backend.

## Directory Structure

Each feature directory is organized as follows:

```
features/
├── auth/                  # Authentication feature
│   ├── controllers/       # Route controllers for auth endpoints
│   ├── routes/            # Express routes for auth
│   ├── services/          # Business logic for auth
│   └── models/            # Database models related to auth
├── church/                # Church management feature
├── event/                 # Event management feature
├── team/                  # Team management feature
└── service/               # Service planning feature
```

## Feature Modules

Each feature module contains:

1. **Controllers**: Handle HTTP requests and responses
   - Validate request data
   - Call appropriate services
   - Format and return responses

2. **Routes**: Define API endpoints
   - Route paths
   - HTTP methods
   - Middleware chains
   - Controller binding

3. **Services**: Implement business logic
   - Data processing
   - Interaction with models
   - External service integration

4. **Models**: Define data structures
   - MongoDB schemas
   - Validation
   - Methods and statics

## Best Practices

1. **Separation of Concerns**:
   - Controllers should not contain business logic
   - Routes should only define endpoints and middleware
   - Services should contain all business logic
   - Models should focus on data structure and validation

2. **Error Handling**:
   - Use consistent error handling patterns
   - Return standardized error responses
   - Log errors appropriately

3. **Middleware Usage**:
   - Use middleware for cross-cutting concerns
   - Apply authentication/authorization at the route level
   - Keep middleware functions small and focused

4. **Testing**:
   - Test each layer independently
   - Mock dependencies for unit tests
   - Use integration tests for API endpoints

5. **Documentation**:
   - Document API endpoints with Swagger/OpenAPI
   - Include JSDoc comments for functions
   - Keep README files updated 