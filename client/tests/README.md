# Client Testing Directory

This directory contains tests for the client-side application.

## Directory Structure

- **unit/**: Unit tests for individual components, hooks, and utilities
  - Tests should be small, focused, and isolated
  - Components should be tested in isolation with mocked dependencies
  - File naming convention: `ComponentName.test.tsx` or `utilityName.test.ts`

- **integration/**: Integration tests for multiple components working together
  - Tests interactions between components
  - May involve partial rendering of the app
  - May use mocked API responses but test real component interactions

- **e2e/**: End-to-end tests using Playwright, Cypress, or similar tools
  - Tests complete user flows
  - Uses real browser environment
  - May use mock API responses or test against a test environment

- **fixtures/**: Test data for use in tests
  - Mock API responses
  - Test user data
  - Sample form data
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
```

## Best Practices

1. **Test Organization**:
   - Keep tests close to the code they're testing
   - Use descriptive test names: `describe('ComponentName', () => { it('should do X when Y', () => {}) })`
   - Group related tests together

2. **Test Coverage**:
   - Aim for high coverage of core functionality
   - Focus on testing business logic and user interactions
   - Don't just test for coverage numbers; test for quality

3. **Mocking**:
   - Mock external dependencies to isolate tests
   - Use Jest mocks for services, API calls, etc.
   - Consider using MSW (Mock Service Worker) for API mocking

4. **Test Maintenance**:
   - Keep tests simple and focused
   - Refactor tests when refactoring code
   - Create helper functions for common test operations

5. **Assertions**:
   - Use clear and specific assertions
   - Test for what the user would see/experience
   - Prefer Testing Library's user-centric assertions 