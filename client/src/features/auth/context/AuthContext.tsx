import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  LoginFormData, 
  RegisterFormData, 
  PasswordResetFormData, 
  PasswordResetRequestFormData, 
  AuthContextState 
} from '../types';
import { authService } from '../services/authService';

// Create context with a default value
export const AuthContext = createContext<AuthContextState>({
  user: null,
  isLoading: false,
  error: null,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  resetPassword: async () => false,
  requestPasswordReset: async () => false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Authentication error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login function
  const login = async (data: LoginFormData): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user } = await authService.login(data);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterFormData): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { user } = await authService.register(data);
      setUser(user);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    authService.logout();
    setUser(null);
  };

  // Request password reset
  const requestPasswordReset = async (data: PasswordResetRequestFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await authService.requestPasswordReset(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request password reset';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (data: PasswordResetFormData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await authService.resetPassword(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextState = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 