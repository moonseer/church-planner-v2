# Code Smells and Type Safety Issues Report

Report generated on: 3/15/2025, 9:13:02 PM

Total issues found: 288

## Summary of Issues

| Issue Type | Count | Description |
|------------|-------|-------------|
| Type Assertion Without Validation | 138 | Type assertions (using "as") without runtime validation can lead to runtime errors if the actual type does not match. |
| Nested Nullable Access | 22 | Deeply nested property access without null checks is prone to errors. |
| Explicit Any Types | 43 | Using "any" type bypasses TypeScript's type checking. |
| Equality Without Type Check | 53 | Using == instead of === can lead to unexpected equality results. |
| Unsafe Type Casting | 10 | Type casting using angle brackets can be unsafe without proper validation. |
| Object Literal Type Widening | 3 | Empty object literals with no type annotation are typed as "{}" which can lead to type issues. |
| Implicit Boolean Conversion | 7 | Implicit boolean conversions can be error-prone with falsy values. |
| Index Signature Access Without Check | 1 | Accessing object properties via indexing without checking existence can lead to undefined values. |
| Large File | 11 | Files with too many lines may violate the Single Responsibility Principle. |

## Detailed Findings

### Type Assertion Without Validation

Type assertions (using "as") without runtime validation can lead to runtime errors if the actual type does not match.

**Suggestion:** Add runtime type checking before the assertion or use a type guard function.

*Showing 20 of 138 instances*

| File | Line | Code |
|------|------|------|
| server/src/middleware/auth.ts | 53 | `const decoded = jwt.verify(token, jwtSecret) as JwtPayload;` |
| server/src/middleware/auth.ts | 99 | `if (!roles.includes(user.role as UserRole)) {` |
| server/src/types/express.d.ts | 1 | `import { Request as ExpressRequest, Response as ExpressResponse } from 'express';` |
| server/src/utils/errorHandler.ts | 2 | `import * as Sentry from '@sentry/node';` |
| server/src/utils/typeGuards.ts | 44 | `return isString(value) && Object.values(UserRole).includes(value as UserRole);` |
| server/src/__tests__/authController.test.ts | 97 | `await register(req as Request, res as Response);` |
| server/src/__tests__/authController.test.ts | 150 | `await register(req as Request, res as Response);` |
| server/src/__tests__/authController.test.ts | 173 | `await register(req as Request, res as Response);` |
| server/src/__tests__/authController.test.ts | 214 | `await login(req as Request, res as Response);` |
| server/src/__tests__/authController.test.ts | 244 | `await login(req as Request, res as Response);` |
| server/src/__tests__/authController.test.ts | 267 | `await login(req as Request, res as Response);` |
| server/src/__tests__/authController.test.ts | 295 | `await login(req as Request, res as Response);` |
| server/src/__tests__/authController.test.ts | 334 | `await getCurrentUser(req as RequestWithUser, res as Response);` |
| server/src/__tests__/authController.test.ts | 367 | `await getCurrentUser(req as RequestWithUser, res as Response);` |
| server/src/__tests__/authController.test.ts | 400 | `await getCurrentUser(req as RequestWithUser, res as Response);` |
| server/src/__tests__/eventController.test.ts | 115 | `await getEvents(req as RequestWithUser, res as Response);` |
| server/src/__tests__/eventController.test.ts | 163 | `await getEvents(req as RequestWithUser, res as Response);` |
| server/src/__tests__/eventController.test.ts | 188 | `await getEvents(req as RequestWithUser, res as Response);` |
| server/src/__tests__/eventController.test.ts | 238 | `await getEvent(req as RequestWithUser, res as Response);` |
| server/src/__tests__/eventController.test.ts | 264 | `await getEvent(req as RequestWithUser, res as Response);` |

### Nested Nullable Access

Deeply nested property access without null checks is prone to errors.

**Suggestion:** Use optional chaining (obj?.prop?.subprop) to safely access nested properties.

*Showing 20 of 22 instances*

| File | Line | Code |
|------|------|------|
| server/src/middleware/auth.ts | 38 | `req.headers.authorization.startsWith('Bearer')` |
| server/src/middleware/auth.ts | 41 | `token = req.headers.authorization.split(' ')[1];` |
| server/src/utils/typeGuards.ts | 37 | `return isString(value) && mongoose.Types.ObjectId.isValid(value);` |
| server/src/utils/typeGuards.ts | 83 | `if (isString(value) && mongoose.Types.ObjectId.isValid(value)) {` |
| server/src/models/TeamMember.ts | 13 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/TeamMember.ts | 18 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/EventType.ts | 29 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Team.ts | 23 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Team.ts | 28 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Event.ts | 44 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Event.ts | 49 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Event.ts | 54 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/User.ts | 42 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Service.ts | 47 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Service.ts | 68 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Service.ts | 73 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/models/Service.ts | 78 | `type: mongoose.Schema.Types.ObjectId,` |
| server/src/__tests__/app.test.ts | 9 | `expect(app._router.stack.some((layer: any) =>` |
| server/src/__tests__/app.test.ts | 26 | `expect(app._router.stack.some((layer: any) =>` |
| client/src/api/client.ts | 17 | `baseURL: import.meta.env.VITE_API_URL \|\| '/api',` |

### Explicit Any Types

Using "any" type bypasses TypeScript's type checking.

**Suggestion:** Replace with more specific types, or use "unknown" if the type is truly not known.

*Showing 20 of 43 instances*

| File | Line | Code |
|------|------|------|
| server/src/types/express.d.ts | 18 | `json(data: any): this;` |
| server/src/types/express.d.ts | 19 | `send(body: any): this;` |
| server/src/config/swagger.ts | 50 | `const swaggerDocs = (app: any, port: number) => {` |
| server/src/config/swagger.ts | 55 | `app.get('/api/docs.json', (req: any, res: any) => {` |
| server/src/utils/dbMonitoring.ts | 27 | `schema.pre('save', function(this: any) {` |
| server/src/utils/dbMonitoring.ts | 51 | `schema.post('save', function(this: any) {` |
| server/src/utils/responseUtils.ts | 60 | `(err: any) => err.message` |
| server/src/__tests__/app.test.ts | 9 | `expect(app._router.stack.some((layer: any) =>` |
| server/src/__tests__/app.test.ts | 26 | `expect(app._router.stack.some((layer: any) =>` |
| server/src/__tests__/user.model.test.ts | 69 | `userWithSave.save = jest.fn().mockImplementation(async function(this: any) {` |
| server/src/__tests__/user.model.test.ts | 93 | `userWithSave.save = jest.fn().mockImplementation(async function(this: any) {` |
| server/src/index.ts | 68 | `} catch (error: any) {` |
| server/src/controllers/teamController.ts | 21 | `} catch (error: any) {` |
| server/src/controllers/teamController.ts | 58 | `} catch (error: any) {` |
| server/src/controllers/teamController.ts | 85 | `} catch (error: any) {` |
| server/src/controllers/teamController.ts | 126 | `} catch (error: any) {` |
| server/src/controllers/teamController.ts | 164 | `} catch (error: any) {` |
| server/src/controllers/serviceController.ts | 41 | `} catch (error: any) {` |
| server/src/controllers/serviceController.ts | 79 | `} catch (error: any) {` |
| server/src/controllers/serviceController.ts | 131 | `} catch (error: any) {` |

### Equality Without Type Check

Using == instead of === can lead to unexpected equality results.

**Suggestion:** Use === for strict equality checks.

*Showing 20 of 53 instances*

| File | Line | Code |
|------|------|------|
| server/src/utils/errorHandler.ts | 11 | `tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,` |
| server/src/utils/errorHandler.ts | 75 | `...(process.env.NODE_ENV === 'development' && { stack: err.stack }),` |
| server/src/utils/errorHandler.ts | 90 | `if (process.env.NODE_ENV === 'production') {` |
| server/src/utils/errorHandler.ts | 104 | `if (process.env.NODE_ENV === 'production') {` |
| server/src/utils/typeGuards.ts | 9 | `return typeof value === 'string';` |
| server/src/utils/typeGuards.ts | 16 | `return typeof value === 'number' && !isNaN(value);` |
| server/src/utils/typeGuards.ts | 23 | `return typeof value === 'boolean';` |
| server/src/utils/typeGuards.ts | 52 | `value !== null &&` |
| server/src/utils/typeGuards.ts | 53 | `typeof value === 'object' &&` |
| server/src/utils/typeGuards.ts | 66 | `value !== null &&` |
| server/src/utils/typeGuards.ts | 67 | `typeof value === 'object' &&` |
| server/src/utils/logger.ts | 15 | `const isDevelopment = env === 'development';` |
| server/src/utils/logger.ts | 55 | `if (process.env.NODE_ENV === 'production') {` |
| server/src/utils/responseUtils.ts | 24 | `...(count !== undefined && { count })` |
| server/src/utils/responseUtils.ts | 58 | `if (error.name === 'ValidationError' && 'errors' in (error as any)) {` |
| server/src/utils/responseUtils.ts | 67 | `if (error.name === 'MongoError' && (error as any).code === 11000) {` |
| server/src/utils/responseUtils.ts | 73 | `if (error.name === 'JsonWebTokenError') {` |
| server/src/utils/responseUtils.ts | 79 | `if (error.name === 'TokenExpiredError') {` |
| server/src/__tests__/app.test.ts | 10 | `layer.route && layer.route.path === '/'` |
| server/src/__tests__/serviceController.test.ts | 260 | `if (field === 'createdBy') {` |

### Unsafe Type Casting

Type casting using angle brackets can be unsafe without proper validation.

**Suggestion:** Use "as" syntax with validation or implement proper type guards.

| File | Line | Code |
|------|------|------|
| server/src/models/TeamMember.ts | 42 | `export default mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);` |
| server/src/models/EventType.ts | 39 | `export default mongoose.model<IEventType>('EventType', EventTypeSchema);` |
| server/src/models/Team.ts | 38 | `export default mongoose.model<ITeam>('Team', TeamSchema);` |
| server/src/models/Event.ts | 68 | `export default mongoose.model<IEvent>('Event', EventSchema);` |
| server/src/models/Service.ts | 92 | `export default mongoose.model<IService>('Service', ServiceSchema);` |
| server/src/controllers/authController.ts | 172 | `return sendSuccessResponse<IUserResponse>(res, { user: userData });` |
| client/src/api/endpoints/church.ts | 20 | `return apiClient.get<IChurchDocument>(`/churches/${id}`);` |
| client/src/api/endpoints/event.ts | 31 | `return apiClient.get<IEventDocument>(`/events/${id}`);` |
| client/src/api/endpoints/auth.ts | 40 | `return apiClient.get<IUserResponse>('/auth/me');` |
| client/src/api/hooks/useAuth.ts | 17 | `const [authState, setAuthState] = useState<AuthState>({` |

### Object Literal Type Widening

Empty object literals with no type annotation are typed as "{}" which can lead to type issues.

**Suggestion:** Add a type annotation or initialize with expected properties.

| File | Line | Code |
|------|------|------|
| server/src/__tests__/errorHandler.test.ts | 26 | `req = {};` |
| server/src/__tests__/auth.middleware.test.ts | 37 | `req.headers = {};` |
| server/src/services/baseService.ts | 109 | `const query: any = {};` |

### Implicit Boolean Conversion

Implicit boolean conversions can be error-prone with falsy values.

**Suggestion:** Use explicit boolean checks (=== true, !== null, etc.) for clarity.

| File | Line | Code |
|------|------|------|
| server/src/controllers/serviceController.ts | 25 | `} else if (startDate) {` |
| server/src/controllers/serviceController.ts | 27 | `} else if (endDate) {` |
| server/src/controllers/authController.ts | 65 | `if (userExists) {` |
| server/src/controllers/authController.ts | 72 | `if (churchName) {` |
| server/src/controllers/authController.ts | 93 | `if (user) {` |
| server/src/controllers/teamMemberController.ts | 134 | `if (existingMember) {` |
| client/src/utils/monitoring.ts | 54 | `if (navigationEntries) {` |

### Index Signature Access Without Check

Accessing object properties via indexing without checking existence can lead to undefined values.

**Suggestion:** Use optional chaining or check if the property exists before accessing it.

| File | Line | Code |
|------|------|------|
| server/src/controllers/metricsController.ts | 26 | `user_agent: req.headers['user-agent'],` |

### Large File

Files with too many lines may violate the Single Responsibility Principle.

**Suggestion:** Consider breaking down this file into smaller, more focused modules.

| File | Line | Code |
|------|------|------|
| total | 1 | `This file has 9388 lines of code.` |
| server/src/__tests__/serviceController.test.ts | 1 | `This file has 1070 lines of code.` |
| server/src/__tests__/eventController.test.ts | 1 | `This file has 731 lines of code.` |
| server/src/__tests__/eventTypeController.test.ts | 1 | `This file has 627 lines of code.` |
| server/src/__tests__/teamController.test.ts | 1 | `This file has 592 lines of code.` |
| server/src/__tests__/churchController.test.ts | 1 | `This file has 422 lines of code.` |
| server/src/__tests__/authController.test.ts | 1 | `This file has 411 lines of code.` |
| server/src/routes/serviceRoutes.ts | 1 | `This file has 408 lines of code.` |
| server/src/routes/teamMemberRoutes.ts | 1 | `This file has 301 lines of code.` |
| server/src/controllers/teamMemberController.ts | 1 | `This file has 281 lines of code.` |
| total | 1 | `This file has 701 lines of code.` |

## Recommendations

1. Review type assertions and non-null assertions to ensure proper runtime validation.
2. Replace loose equality (==) with strict equality (===) throughout the codebase.
3. Use optional chaining and nullish coalescing for safer property access.
4. Consider breaking down large files into smaller, more focused modules.
5. Replace string concatenation with template literals for better readability.
6. Add explicit type annotations to functions that return complex types.
7. Implement proper type guards for safer type narrowing.
8. Review enums to ensure they have explicit values rather than relying on positional ordering.
