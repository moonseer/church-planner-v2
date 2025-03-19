import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@shared/types/api';

interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
}

/**
 * API client for making network requests
 */
export class ApiClient {
  private baseUrl: string;
  private axios: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    
    // Create Axios instance with configuration
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Always include credentials for cookie-based auth
    });

    // Request interceptor for adding auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling common errors
    this.axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle auth errors (redirect to login)
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          // If not already on login page, redirect
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        // Handle API-specific errors
        if (error.response?.data) {
          return Promise.reject(
            new Error(
              (error.response.data as any).message || 
              (error.response.data as any).error || 
              'An error occurred'
            )
          );
        }
        
        // Handle network errors
        if (error.message === 'Network Error') {
          return Promise.reject(new Error('Unable to connect to the server. Please check your internet connection.'));
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new Error('The request timed out. Please try again.'));
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  public async post<T>(
    endpoint: string,
    data?: unknown,
    config?: { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  public async put<T>(
    endpoint: string,
    data?: unknown,
    config?: { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(
    endpoint: string,
    config?: { headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Create default API client instance
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
}); 