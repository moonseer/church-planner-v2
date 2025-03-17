import { describe, it, expect } from 'vitest';
import api, { apiClient, authApi, churchApi, eventApi } from './index';

describe('API Index', () => {
  it('exports default api object with all endpoints', () => {
    expect(api).toBeDefined();
    expect(api.auth).toBe(authApi);
    expect(api.church).toBe(churchApi);
    expect(api.event).toBe(eventApi);
  });

  it('exports apiClient and all individual API endpoints', () => {
    expect(apiClient).toBeDefined();
    expect(authApi).toBeDefined();
    expect(churchApi).toBeDefined();
    expect(eventApi).toBeDefined();
  });
}); 