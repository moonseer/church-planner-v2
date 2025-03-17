import { useState, useEffect } from 'react';
import { User } from '@shared/types/auth';
import { authAPI } from '../services/authAPI';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * Hook for authentication management
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Function to get CSRF token
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include' // Important for cookies
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  // Check user authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));
        
        // Get current user with credentials
        const response = await authAPI.getCurrentUser();
        
        if (response.user) {
          setState({
            user: response.user,
            loading: false,
            error: null,
            isAuthenticated: true,
          });
          
          // Get CSRF token after successful auth
          await fetchCsrfToken();
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: 'Authentication failed',
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await authAPI.login({ email, password });
      
      if (response.user) {
        setState({
          user: response.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        
        // Get CSRF token after login
        await fetchCsrfToken();
        
        return { success: true };
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Login failed',
        }));
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    churchName?: string
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      
      const response = await authAPI.register({
        name: `${firstName} ${lastName}`,
        email,
        password,
        churchName,
      });
      
      if (response.user) {
        setState({
          user: response.user,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
        
        // Get CSRF token after registration
        await fetchCsrfToken();
        
        return { success: true };
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Registration failed',
        }));
        return { success: false, error: 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
      
      setCsrfToken(null);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    login,
    register,
    logout,
    csrfToken,
    refreshCsrfToken: fetchCsrfToken
  };
}; 