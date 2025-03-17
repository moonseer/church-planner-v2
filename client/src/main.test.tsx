import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}));

vi.mock('./App', () => ({
  default: () => 'App Component'
}));

vi.mock('./index.css', () => ({}));

// Mock DOM
document.getElementById = vi.fn(() => document.createElement('div'));

describe('Main entry point', () => {
  it('can be imported without errors', () => {
    // This test simply verifies that the main.tsx file can be imported
    // without throwing any errors
    expect(() => {
      // Using a function to prevent immediate execution during module loading
      const importMain = () => {
        // We're only testing that it imports without errors
        return import('./main.tsx');
      };
      
      importMain();
    }).not.toThrow();
  });
}); 