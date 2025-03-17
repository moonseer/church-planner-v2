# Type Safety in Church Planner

This documentation outlines the type-safe patterns implemented in the Church Planner application to ensure code quality and reduce runtime errors.

## Table of Contents

1. [TypeScript Fundamentals](#typescript-fundamentals)
2. [Type Segregation and Organization](#type-segregation-and-organization)
3. [Runtime Type Validation](#runtime-type-validation)
4. [Type Guards](#type-guards)
5. [Type-Safe API Client](#type-safe-api-client)
6. [Type-Safe State Management](#type-safe-state-management)
7. [Code Quality Checks](#code-quality-checks)

## TypeScript Fundamentals

The Church Planner application uses TypeScript to provide static type checking. This helps catch type-related errors at compile time rather than runtime.

Key features used:
- **Strict Type Checking**: Enabled with `"strict": true` in `tsconfig.json`
- **No Implicit Any**: Prevents variables from having an implicit `any` type
- **No Unsafe Member Access**: Prevents accessing properties of objects that might be `null` or `undefined`

## Type Segregation and Organization

Our types are organized following the interface segregation principle:

- **Base Types**: Minimal interfaces containing only essential properties
- **Extended Types**: Build upon base types with additional properties
- **Segregated Interfaces**: Split large interfaces into smaller, focused ones based on functionality

### Example: User Types Segregation

```typescript
// Base user properties
interface IUserBase {
  name: string;
  email: string;
}

// Authentication-specific properties
interface IUserAuth extends IUserBase {
  password: string;
  role: UserRole;
}

// Database-specific properties
interface IUserDocument extends IUserBase {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## Runtime Type Validation

While TypeScript provides compile-time type checking, we also implement runtime type validation using Zod:

```typescript
// Zod schema for user registration
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  churchName: z.string().min(2),
});
```

### Validation Usage Patterns

We have standardized validation patterns for different contexts:

1. **API Request Validation**: Middleware that validates incoming requests
2. **Data Transformation**: Schemas that safely transform data between formats
3. **Service Layer Validation**: Validation before data persistence

```typescript
// Example middleware usage
router.post('/register', 
  validateRequest(registerSchema), 
  authController.register
);
```

## Type Guards

Type guards are functions that perform runtime checks and narrow types:

```typescript
export const isUserDocument = (value: unknown): value is IUserDocument => {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_id' in value &&
    'name' in value &&
    'email' in value
  );
};
```

### Type Assertion Functions

We also use assertion functions to validate types at runtime:

```typescript
const assertIsUserDocument = (value: unknown): asserts value is IUserDocument => {
  if (!isUserDocument(value)) {
    throw new Error(`Expected user document but got: ${JSON.stringify(value)}`);
  }
};
```

## Type-Safe API Client

Our API client uses a type-safe approach to ensure requests and responses match expected types:

```typescript
export const login = async (
  credentials: ILoginRequest
): ApiResponsePromise<IUserWithChurch> => {
  return apiClient.post('/auth/login', credentials);
};
```

## Type-Safe State Management

For React components, we use type-safe state management patterns:

```typescript
// Type-safe custom hook
export function useAuth(): AuthState {
  const [user, setUser] = useState<IUserWithChurch | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Rest of the hook implementation
}
```

## Code Quality Checks

We have automated tools to maintain code quality and type safety:

1. **TypeScript Linting**: ESLint rules specific to TypeScript
2. **Type Coverage Reports**: Ensures high percentage of code is properly typed
3. **Code Smell Detection**: Identifies type-related code smells
4. **Performance Monitoring**: Type-safe monitoring for both client and server

### Running Code Quality Checks

```bash
npm run quality:check   # Run all code quality checks
npm run quality:lint    # Run just the linter
npm run quality:smells  # Check for code smells
```

The reports are generated in the `/reports` directory. 