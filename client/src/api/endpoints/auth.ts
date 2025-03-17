import apiClient from '../client';
import {
  ILoginRequest,
  IRegisterRequest,
  ILoginResponse,
  IRegisterResponse,
  IUserResponse,
} from '@shared/types/auth';

/**
 * Authentication API endpoints
 */
const authApi = {
  /**
   * Register a new user
   * @param userData User registration data
   */
  register: (userData: IRegisterRequest) => {
    return apiClient.post<IRegisterResponse, IRegisterRequest>(
      '/auth/register',
      userData
    );
  },

  /**
   * Login a user
   * @param credentials User login credentials
   */
  login: (credentials: ILoginRequest) => {
    return apiClient.post<ILoginResponse, ILoginRequest>(
      '/auth/login',
      credentials
    );
  },

  /**
   * Get current user profile
   */
  getCurrentUser: () => {
    return apiClient.get<IUserResponse>('/auth/me');
  },
};

export default authApi; 