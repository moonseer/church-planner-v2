import { apiClient } from '../client';
import { ILoginRequest, IRegisterRequest, ILoginResponse, IRegisterResponse, IUserResponse } from '@shared/types/auth';

/**
 * Authentication API service
 */
export const authAPI = {
  /**
   * Register a new user
   */
  async register(userData: IRegisterRequest): Promise<IRegisterResponse> {
    return apiClient.post<IRegisterResponse>('/auth/register', userData);
  },

  /**
   * Login a user
   */
  async login(credentials: ILoginRequest): Promise<ILoginResponse> {
    return apiClient.post<ILoginResponse>('/auth/login', credentials);
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/logout');
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<IUserResponse> {
    return apiClient.get<IUserResponse>('/auth/me');
  },

  /**
   * Get a CSRF token
   */
  async getCsrfToken(): Promise<{ csrfToken: string }> {
    return apiClient.get<{ csrfToken: string }>('/csrf-token');
  }
}; 