# Code Quality Checks

This document provides instructions on how to run code quality checks locally for the Church Planner application.

## Available Scripts

The Church Planner application has several scripts available for checking code quality:

### Client-side Checks

```bash
# Run ESLint on client code
cd client && npm run lint

# Type check client code
cd client && npm run build
```

### Server-side Checks

```bash
# Run ESLint on server code
cd server && npm run lint

# Type check server code
cd server && npm run build
```

## Running All Checks

You can create a script in the root `package.json` to run all checks at once. Add the following to your scripts section:

```json
"scripts": {
  // ... existing scripts
  "lint:all": "npm run lint:client && npm run lint:server",
  "lint:client": "cd client && npm run lint",
  "lint:server": "cd server && npm run lint",
  "typecheck:all": "npm run typecheck:client && npm run typecheck:server",
  "typecheck:client": "cd client && tsc --noEmit",
  "typecheck:server": "cd server && tsc --noEmit",
  "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
  "format:write": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
  "quality": "npm run lint:all && npm run typecheck:all && npm run format:check"
}
```

After adding these scripts, you can run all quality checks with:

```bash
npm run quality
```

## ESLint Configuration

The ESLint configuration is located in:
- Client: `client/.eslintrc.cjs`
- Server: There's no explicit ESLint config file, so it's likely using default settings

## Prettier Configuration

The Prettier configuration is located in:
- `client/.prettierrc`

## Pre-commit Hooks (Recommended)

Consider setting up pre-commit hooks using Husky and lint-staged to automatically run these checks before each commit:

1. Install the required packages:

```bash
npm install --save-dev husky lint-staged
```

2. Add the following to your package.json:

```json
"husky": {
  "hooks": {
    "pre-commit": "lint-staged"
  }
},
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

3. Initialize Husky:

```bash
npx husky install
```

## Continuous Integration

While GitHub Actions workflows have been removed for now, you can still run these checks locally before pushing your code to ensure it meets quality standards.

## Common Issues and Solutions

### ESLint structuredClone Error

If you encounter an error related to `structuredClone` not being defined, you can:

1. Use Node.js version 18 or higher, which natively supports `structuredClone`
2. Add a polyfill in your ESLint configuration file:

```javascript
// Add this at the top of .eslintrc.cjs
if (typeof structuredClone !== 'function') {
  global.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}
```

### TypeScript Errors in Controller Return Types

If you see errors related to controller return types, check for instances where a function is declared to return `Promise<Response>` but actually returns something else. Update the return type to match the actual return value. 