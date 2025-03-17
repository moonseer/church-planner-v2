import { describe, it, expect } from 'vitest';
import { useAuth } from './index';

describe('API Hooks Index', () => {
  it('exports useAuth hook', () => {
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });
}); 