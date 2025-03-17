import { describe, it, expect, vi, beforeEach } from 'vitest';
import authApi from './auth';
import apiClient from '../client';

// Mock the apiClient
vi.mock('../client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Auth API', () => {
  const mockUserData = {
    _id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['user'],
    church: {
      _id: 'church123',
      name: 'First Baptist Church',
    },
  };

  const mockLoginResponse = {
    success: true,
    data: {
      token: 'fake-jwt-token',
      user: mockUserData,
    },
  };

  const mockUserResponse = {
    success: true,
    data: {
      user: mockUserData,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('registers a new user', async () => {
      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
      };

      // Mock successful response
      (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockLoginResponse);
      
      const result = await authApi.register(registerData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('login', () => {
    it('logs in a user', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123',
      };

      // Mock successful response
      (apiClient.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockLoginResponse);
      
      const result = await authApi.login(loginData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('gets the current authenticated user', async () => {
      // Mock successful response
      (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockUserResponse);
      
      const result = await authApi.getCurrentUser();
      
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUserResponse);
    });
  });
}); 