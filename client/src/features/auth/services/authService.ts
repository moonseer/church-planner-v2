import { 
  LoginFormData,
  RegisterFormData,
  User,
  AuthResponse,
  PasswordResetRequestFormData,
  PasswordResetFormData
} from '../types';

// API base URL - could be stored in environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Types for API responses
interface AuthApiResponse {
  token?: string;
  user?: User;
  error?: string;
  success?: boolean;
}

// Register user data
export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

const API_BASE_URL = '/api/auth';

/**
 * Service for handling authentication-related API requests
 */
export const authService = {
  /**
   * Login a user
   */
  async login(credentials: LoginFormData): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data: AuthResponse = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  async register(userData: RegisterFormData): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data: AuthResponse = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        localStorage.removeItem('token');
        return null;
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('token');
      return null;
    }
  },
  
  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('token');
  },
  
  /**
   * Request a password reset
   */
  async requestPasswordReset(data: PasswordResetRequestFormData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  },
  
  /**
   * Reset password
   */
  async resetPassword(data: PasswordResetFormData): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  },
  
  /**
   * Get the token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  },
};

class AuthService {
  /**
   * Get current user profile
   */
  async getCurrentUser(token: string): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user');
      }

      return {
        user: data.data.user,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthApiResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}

export default new AuthService(); 