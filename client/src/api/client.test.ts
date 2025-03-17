import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { ApiClient } from './client';

// Define HttpStatus enum locally to avoid import issues
enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

// Use vi.hoisted to declare mock functions that work with vi.mock hoisting
const mockAxiosInstance = vi.hoisted(() => ({
  get: vi.fn().mockResolvedValue({ data: { success: true } }),
  post: vi.fn().mockResolvedValue({ data: { success: true } }),
  put: vi.fn().mockResolvedValue({ data: { success: true } }),
  delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  }
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}));

describe('ApiClient', () => {
  let apiClient: ApiClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage for token retrieval
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn().mockReturnValue('fake-token'),
      },
      writable: true,
    });
    
    apiClient = new ApiClient();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('constructor', () => {
    it('creates an axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
    
    it('adds request and response interceptors', () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(1);
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('HTTP methods', () => {
    it('makes a GET request', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { success: true } });
      
      const result = await apiClient.get('/users');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', undefined);
      expect(result).toEqual({ success: true });
    });
    
    it('makes a POST request with data', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({ data: { success: true } });
      
      const data = { name: 'John' };
      const result = await apiClient.post('/users', data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/users', data, undefined);
      expect(result).toEqual({ success: true });
    });
    
    it('makes a PUT request with data', async () => {
      mockAxiosInstance.put.mockResolvedValueOnce({ data: { success: true } });
      
      const data = { id: 1, name: 'John' };
      const result = await apiClient.put('/users/1', data);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/1', data, undefined);
      expect(result).toEqual({ success: true });
    });
    
    it('makes a DELETE request', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: { success: true } });
      
      const result = await apiClient.delete('/users/1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/users/1', undefined);
      expect(result).toEqual({ success: true });
    });
  });
  
  describe('error handling', () => {
    it('adds auth token to request if available', () => {
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      
      const mockConfig = { headers: { Authorization: '' } };
      
      const result = requestInterceptor(mockConfig);
      
      expect(result.headers.Authorization).toBe('Bearer fake-token');
    });
    
    it('handles API error responses correctly', async () => {
      const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const apiError = {
        response: {
          data: {
            success: false,
            message: 'Invalid input',
            errors: ['Field is required'],
          },
          status: 400,
        },
      };
      
      await expect(responseErrorHandler(apiError)).rejects.toEqual({
        success: false,
        message: 'Invalid input',
        errors: ['Field is required'],
      });
    });
    
    it('handles network errors correctly', async () => {
      const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const networkError = {
        message: 'Network Error',
        request: {},
      };
      
      await expect(responseErrorHandler(networkError)).rejects.toEqual({
        success: false,
        error: 'No response from server',
        statusCode: 503,
      });
    });
    
    it('handles other errors correctly', async () => {
      const responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      
      const otherError = new Error('Something went wrong');
      
      await expect(responseErrorHandler(otherError)).rejects.toEqual({
        success: false,
        error: 'Something went wrong',
        statusCode: 500,
      });
    });
  });
}); 