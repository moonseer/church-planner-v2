# Test Coverage Documentation

This document provides information about test coverage for the Church Planner application.

## Overview

Test coverage is a measure of how much of your code is executed during your tests. It helps identify areas of your codebase that lack proper testing. The Church Planner application uses the following tools for test coverage:

- **Server**: Jest with ts-jest
- **Client**: Vitest with c8 (for coverage)

## Coverage Thresholds

We've set the following coverage thresholds for the application:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

These thresholds ensure that a significant portion of the codebase is covered by tests.

## Running Coverage Reports

### Combined Coverage

To run coverage reports for both client and server:

```bash
npm run test:coverage
```

### Client Coverage

To run coverage reports for the client only:

```bash
npm run test:coverage:client
```

This will generate coverage reports in the `client/coverage` directory.

### Server Coverage

To run coverage reports for the server only:

```bash
npm run test:coverage:server
```

This will generate coverage reports in the `server/coverage` directory.

## Coverage Reports

The coverage reports are generated in multiple formats:

- **Text**: Console output showing coverage percentages
- **HTML**: Interactive HTML reports for detailed analysis
- **LCOV**: Standard format for integration with coverage tools
- **JSON**: Machine-readable format for custom processing

## Viewing HTML Reports

After running the coverage commands, you can view the HTML reports:

- **Client**: Open `client/coverage/index.html` in your browser
- **Server**: Open `server/coverage/lcov-report/index.html` in your browser

## Improving Coverage

To improve test coverage:

1. Focus on testing critical business logic first
2. Write tests for edge cases and error handling
3. Use the HTML reports to identify untested code
4. Prioritize testing components with complex logic
5. Ensure all API endpoints have corresponding tests

## Continuous Integration

In a CI environment, coverage reports can be used to:

- Fail builds if coverage drops below thresholds
- Generate trend reports to track coverage over time
- Integrate with code quality tools

## Dependencies

To use the test coverage functionality, you need to install the following dependencies:

### Server

```bash
cd server
npm install --save-dev jest ts-jest @types/jest
```

### Client

```bash
cd client
npm install --save-dev vitest @vitest/coverage-c8 @testing-library/react @testing-library/jest-dom
```

## Configuration Files

- **Server**: `server/jest.config.js`
- **Client**: `client/vitest.config.ts` 