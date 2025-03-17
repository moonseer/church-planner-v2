import { ApiResponse, ApiError } from '@shared/types/api';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  csrfToken?: string;
}

interface ApiClientConfig {
  baseUrl: string;
}

/**
 * API client for making network requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
  }

  /**
   * Make an API request
   */
  public async request<T>(
    endpoint: string,
    options: RequestOptions
  ): Promise<T> {
    const { method, headers = {}, body, csrfToken } = options;
    const url = `${this.baseUrl}${endpoint}`;

    // Set up headers with content type and CSRF token if provided
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add CSRF token if provided
    if (csrfToken) {
      requestHeaders['CSRF-Token'] = csrfToken;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Always include credentials for cookie-based auth
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || 'An error occurred'
        );
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data as T;
      }

      // For non-JSON responses
      const text = await response.text();
      return { message: text } as unknown as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string, csrfToken?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', csrfToken });
  }

  /**
   * Make a POST request
   */
  public async post<T>(
    endpoint: string,
    data?: unknown,
    csrfToken?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
      csrfToken,
    });
  }

  /**
   * Make a PUT request
   */
  public async put<T>(
    endpoint: string,
    data?: unknown,
    csrfToken?: string
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
      csrfToken,
    });
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(endpoint: string, csrfToken?: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', csrfToken });
  }
}

// Create default API client instance
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
}); 