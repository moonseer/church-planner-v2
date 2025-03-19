import { apiClient } from '../client';
import { ILoginRequest, IRegisterRequest, ILoginResponse, IRegisterResponse, IUserResponse } from '@shared/types/auth';

// Define a local interface that extends ILoginResponse to include the token
interface LoginResponseWithToken extends ILoginResponse {
  token?: string;
}

/**
 * Authentication API service for interacting with the Auth Service via the API Gateway
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
  async login(credentials: ILoginRequest): Promise<LoginResponseWithToken> {
    const response = await apiClient.post<LoginResponseWithToken>('/auth/login', credentials);
    
    // Store the token in localStorage if returned from the API
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    
    // Remove the token from localStorage
    localStorage.removeItem('token');
    
    return response;
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<IUserResponse> {
    return apiClient.get<IUserResponse>('/auth/me');
  },

  /**
   * Update user details
   */
  async updateDetails(userData: Partial<IUserResponse>): Promise<IUserResponse> {
    return apiClient.put<IUserResponse>('/auth/updatedetails', userData);
  },

  /**
   * Update user password
   */
  async updatePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>('/auth/updatepassword', passwordData);
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgotpassword', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(resetToken: string, password: string): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(`/auth/resetpassword/${resetToken}`, { password });
  },

  /**
   * Get a CSRF token
   */
  async getCsrfToken(): Promise<{ csrfToken: string }> {
    return apiClient.get<{ csrfToken: string }>('/csrf-token');
  }
}; 