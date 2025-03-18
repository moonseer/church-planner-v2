# Shared Code Directory

This directory contains code shared between the client and server applications.

## Directory Structure

- **types/**: TypeScript type definitions shared between client and server
  - Data models (interfaces/types)
  - API request/response types
  - Enums and constants types

- **utils/**: Utility functions used by both client and server
  - Date formatting
  - String manipulation
  - Calculation helpers
  - Pure functions with no side effects

- **constants/**: Shared constant values
  - Configuration values
  - Common strings
  - Lookup tables
  - Enum-like values

- **validation/**: Validation schemas and functions
  - Input validation rules
  - Schema definitions (Zod, Joi, etc.)
  - Common validation functions

- **helpers/**: Helper functions with more complex logic
  - Business logic helpers
  - Data transformation helpers
  - More complex functions that may have dependencies

## Best Practices

1. **Type Safety**:
   - Ensure all shared types are properly defined
   - Use precise types over general ones
   - Keep types in sync with database schemas
   - Document complex types with comments

2. **Code Duplication**:
   - Avoid duplicating logic between client and server
   - Centralize common functionality in shared code
   - Maintain a single source of truth for business rules

3. **Imports**:
   - Use named exports for better tooling support
   - Group related types in logical files
   - Keep import paths clean with index files

4. **Compatibility**:
   - Ensure shared code works in both Node.js and browser environments
   - Avoid using Node.js or browser-specific APIs directly
   - Use environment checks when necessary

5. **Documentation**:
   - Document all public functions and types
   - Include examples for complex functions
   - Keep README files updated with usage instructions 