import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiSuccessResponse, ApiErrorResponse, HttpStatus } from '@shared/types/api';

/**
 * Configuration for the API client
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Default configuration for the API client
 */
const defaultConfig: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API client for making type-safe requests
 */
class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig = defaultConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || defaultConfig.timeout,
      headers: { ...defaultConfig.headers, ...config.headers },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => this.handleError(error)
    );
  }

  /**
   * Handle API error responses
   */
  private handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const status = error.response.status;
      
      // Handle authentication errors
      if (status === HttpStatus.UNAUTHORIZED) {
        // Clear token if authentication fails
        localStorage.removeItem('token');
      }

      // Convert error response to ApiErrorResponse
      const errorResponse = error.response.data as ApiErrorResponse;
      
      return Promise.reject(errorResponse);
    }
    
    if (error.request) {
      // The request was made but no response was received
      return Promise.reject({
        success: false,
        error: 'No response from server',
        statusCode: 503, // Service Unavailable
      } as ApiErrorResponse);
    }
    
    // Something happened in setting up the request
    return Promise.reject({
      success: false,
      error: error.message || 'Unknown error occurred',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    } as ApiErrorResponse);
  }

  /**
   * Make a GET request
   */
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.get<ApiSuccessResponse<T>>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.post<ApiSuccessResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.put<ApiSuccessResponse<T>>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    const response = await this.client.delete<ApiSuccessResponse<T>>(url, config);
    return response.data;
  }
}

// Create a singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient }; 