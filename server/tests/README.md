# Server Testing Directory

This directory contains tests for the server-side application.

## Directory Structure

- **unit/**: Unit tests for individual functions, services, and utilities
  - Tests for controllers (mocking services)
  - Tests for services (mocking models)
  - Tests for utility functions
  - File naming convention: `component.test.ts` (e.g., `authController.test.ts`)

- **integration/**: Integration tests for APIs and database operations
  - API endpoint testing
  - Database interaction testing
  - Testing multiple components working together
  - May use an in-memory MongoDB or test database

- **e2e/**: End-to-end tests for complete server functionality
  - Full request-response cycle testing
  - Database operations in a real/staging environment
  - API workflow testing (e.g., user registration -> login -> data access)

- **fixtures/**: Test data for use in tests
  - Mock request payloads
  - Sample database documents
  - Expected response objects
  - Other test artifacts

## Running Tests

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Best Practices

1. **Test Isolation**:
   - Tests should not depend on each other
   - Clean up after tests (e.g., database cleanup)
   - Use beforeEach/afterEach for setup and teardown

2. **Database Testing**:
   - Use an in-memory MongoDB for tests
   - Seed test data before tests
   - Clean up after tests
   - Don't test with production databases

3. **Authentication Testing**:
   - Test protected routes with and without valid tokens
   - Test token expiration and refresh
   - Test role-based access control

4. **Error Handling**:
   - Test error cases thoroughly
   - Ensure proper error responses
   - Test validation errors

5. **Test Coverage**:
   - Aim for high coverage of controllers and services
   - Test edge cases and error conditions
   - Focus on testing complex business logic 