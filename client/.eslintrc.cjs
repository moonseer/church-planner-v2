// Add this at the top of the file if it exists, or create the file if it doesn't
// Polyfill for structuredClone if not available
if (typeof structuredClone !== 'function') {
  global.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}

// ... rest of the existing ESLint configuration 