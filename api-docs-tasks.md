# API Documentation Tasks

## Completed Tasks
- [x] Set up Swagger/OpenAPI for API documentation
- [x] Document Authentication API endpoints
- [x] Document Church API endpoints
- [x] Document Event Type API endpoints
- [x] Document Event API endpoints
- [x] Document Team API endpoints
- [x] Document Team Member API endpoints
- [x] Document Service API endpoints
- [x] Update README with API documentation information

## Remaining Tasks
- [ ] Fix TypeScript linter errors in controller return types
  - [ ] Research proper TypeScript types for Express route handlers
  - [ ] Update controller function signatures to match expected return types
  - [ ] Ensure consistent return patterns across all controllers
  - [ ] Add proper type definitions for request and response objects

- [ ] Implement API versioning strategy
  - [ ] Research API versioning approaches (URL path, query parameter, header)
  - [ ] Select and implement a versioning strategy
  - [ ] Update Swagger documentation to reflect versioning
  - [ ] Create documentation for version migration

- [ ] Document rate limiting and security measures
  - [ ] Implement rate limiting middleware
  - [ ] Add CSRF protection
  - [ ] Document security best practices for API consumers
  - [ ] Add security information to Swagger documentation

## Notes on TypeScript Linter Errors

The current TypeScript linter errors are related to the return types in the controller functions. The main error pattern is:

```
Type 'Promise<Response<any, Record<string, any>> | undefined>' is not assignable to type 'void | Promise<void>'
```

This occurs because the Express route handlers expect functions that return void or Promise<void>, but our controller functions are returning Response objects.

### Potential Solutions:

1. **Update the controller function signatures**:
   ```typescript
   // From:
   const getUsers = async (req: Request, res: Response): Promise<Response | undefined> => {
     // ...
     return res.status(200).json({ success: true, data: users });
   };

   // To:
   const getUsers = async (req: Request, res: Response): Promise<void> => {
     // ...
     res.status(200).json({ success: true, data: users });
   };
   ```

2. **Create custom type definitions** for the Express request handlers that allow for returning Response objects.

3. **Use a middleware approach** that wraps the controller functions and handles the return types appropriately.

The solution should be implemented consistently across all controller files to maintain code quality and consistency. 