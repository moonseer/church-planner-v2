import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../index';
import { ILoginRequest, IRegisterRequest, IUserWithChurch } from '@shared/types/auth';
import { ApiErrorResponse } from '@shared/types/api';

interface AuthState {
  user: IUserWithChurch | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for authentication
 */
export default function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Load user from API
   */
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.getCurrentUser();
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorResponse = error as ApiErrorResponse;
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorResponse.error as string,
      });
    }
  }, []);

  /**
   * Load user on mount
   */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Register a new user
   */
  const register = async (userData: IRegisterRequest) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.register(userData);
      localStorage.setItem('token', response.data.token);
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      const errorResponse = error as ApiErrorResponse;
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorResponse.error as string,
      }));
      throw error;
    }
  };

  /**
   * Login a user
   */
  const login = async (credentials: ILoginRequest) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.data.token);
      setAuthState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response.data;
    } catch (error) {
      const errorResponse = error as ApiErrorResponse;
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorResponse.error as string,
      }));
      throw error;
    }
  };

  /**
   * Logout a user
   */
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...authState,
    register,
    login,
    logout,
    loadUser,
  };
} 