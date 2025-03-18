# Client Directory Structure

This directory contains the frontend React application for Church Planner v2.

## Directory Structure

- **assets/**: Static assets like images, fonts, and other resources
  
- **components/**: Reusable UI components that are shared across multiple features
  - Example: Button, Card, Modal, Form inputs
  
- **features/**: Feature-based modules organized by domain functionality
  - Each feature folder contains its own components, hooks, services, and types
  - Example: `features/auth`, `features/calendar`, `features/teams`
  
- **hooks/**: Custom React hooks shared across the application
  - Example: `useForm`, `useLocalStorage`, `useOutsideClick`
  
- **pages/**: Top-level page components that represent routes in the application
  - Example: `Dashboard.tsx`, `Login.tsx`, `TeamDetail.tsx`
  
- **services/**: API services and data fetching logic
  - Example: `authService.ts`, `teamService.ts`, `eventService.ts`
  
- **store/**: State management (Context API, Redux, etc.)
  - Example: Global state, reducers, actions
  
- **types/**: TypeScript type definitions specific to the client
  - Example: Component prop types, client-specific interfaces
  
- **utils/**: Utility functions and helper methods
  - Example: Date formatting, string manipulation, validation helpers

## Best Practices

1. **Component Organization**:
   - Keep components small and focused
   - Use proper naming conventions: PascalCase for components, camelCase for files

2. **Feature Modules**:
   - Each feature should be self-contained with its own components, hooks, etc.
   - Cross-feature components should be moved to the shared components directory

3. **Code Reuse**:
   - Prefer composition over inheritance
   - Extract common logic into hooks or utility functions

4. **Imports**:
   - Use absolute imports with path aliases
   - Organize imports: React, external libraries, internal modules

5. **TypeScript**:
   - Use proper typing for all components and functions
   - Avoid `any` types when possible 