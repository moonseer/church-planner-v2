# Directory Structure Implementation Plan

This document outlines the phased approach to implementing the new directory structure for Church Planner v2.

## Phase 1: Initial Setup (Completed)

✅ Created new directory structures:
- Client: src/{assets,components,features,hooks,pages,services,store,types,utils}
- Server: src/features/{auth,church,event,team,service}/{controllers,routes,services,models}
- Shared: {types,utils,constants,validation,helpers}
- Testing: client/tests and server/tests
- Configuration: config/{docker,environments}
- CI/CD: .github/{workflows,ISSUE_TEMPLATE}
- Localization: locales/{en,es}
- API docs: api-docs/{swagger,examples,schemas}
- Migrations: server/src/migrations

✅ Created README files for each major directory to document structure and best practices

## Phase 2: Authentication Feature Migration (1-2 weeks)

Begin with migrating the authentication feature as a proof of concept:

1. Create feature module structure for authentication:
   ```
   client/src/features/auth/
   ├── components/       # Auth-specific components
   │   ├── LoginForm.tsx
   │   ├── RegisterForm.tsx
   │   └── PasswordReset.tsx
   ├── hooks/            # Auth-specific hooks
   │   └── useAuth.ts
   ├── services/         # Auth API services
   │   └── authService.ts
   ├── types/            # Auth-specific types
   │   └── index.ts
   └── index.ts          # Exports for the feature
   ```

2. Migrate server auth code to new structure:
   - Move authController.ts to server/src/features/auth/controllers/
   - Move auth routes to server/src/features/auth/routes/
   - Create auth service in server/src/features/auth/services/
   - Move User model to server/src/features/auth/models/

3. Update imports in all affected files
4. Create unit tests for the auth feature
5. Verify functionality works as expected

## Phase 3: Migrate Remaining Features (2-3 weeks per feature)

After successfully migrating auth, proceed with other features in this order:

1. Church feature (1-2 weeks)
2. Event feature (1-2 weeks)
3. Team feature (1-2 weeks)
4. Service feature (1-2 weeks)

For each feature:
1. Create feature directory structure on client and server
2. Move related components, hooks, services, and types
3. Refactor imports and dependencies
4. Add/update tests
5. Verify functionality

## Phase 4: Shared Code Reorganization (1 week)

1. Reorganize shared types based on domains
2. Move utility functions to appropriate directories
3. Create shared constants for configuration values
4. Add validation schemas for API requests/responses
5. Update imports in all client/server code

## Phase 5: Testing Infrastructure (1-2 weeks)

1. Set up unit test configuration for client and server
2. Add testing utilities and helpers
3. Create fixtures for common test data
4. Set up integration and e2e testing infrastructure
5. Update CI/CD pipeline to run tests

## Phase 6: Configuration and Build System (1 week)

1. Move Docker configurations to config/docker
2. Reorganize environment variables and configuration files
3. Update build scripts for the new directory structure
4. Ensure development and production builds work correctly

## Phase 7: Documentation and Cleanup (1 week)

1. Update project READMEs with new structure
2. Update API documentation
3. Remove deprecated files and directories
4. Final validation of all features and functionality

## Migration Strategy

For each file being moved:

1. **Copy, don't move** - Keep the original file until the new one is confirmed working
2. **Incremental testing** - Test each component after migration
3. **Feature flags** - Use feature flags to gradually enable new code
4. **Parallel structure** - Maintain parallel structures during transition
5. **Documentation** - Update documentation as you migrate

## Rollback Plan

In case of issues:

1. Keep git branch with old structure
2. Maintain ability to deploy from old structure
3. Document dependencies between old and new structure
4. Create scripts to revert to old structure if needed

## Success Criteria

The migration will be considered successful when:

1. All features work as expected in the new structure
2. All tests pass
3. Build process works correctly
4. No regression in functionality or performance
5. Documentation is updated
6. Code quality metrics are maintained or improved 