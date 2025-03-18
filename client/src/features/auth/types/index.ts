/**
 * Authentication Types
 */

// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  churches: string[];
  createdAt: string;
  updatedAt: string;
}

// Login form data
export interface LoginFormData {
  email: string;
  password: string;
}

// Register form data
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Password reset request form data
export interface PasswordResetRequestFormData {
  email: string;
}

// Password reset form data
export interface PasswordResetFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Authentication response
export interface AuthResponse {
  user: User;
  token: string;
}

// Login response
export interface LoginResponse {
  user: User;
  token: string;
}

// Register response
export interface RegisterResponse {
  user: User;
  token: string;
}

// Authentication context
export interface AuthContextState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<User | null>;
  register: (data: RegisterFormData) => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (data: PasswordResetFormData) => Promise<boolean>;
  requestPasswordReset: (data: PasswordResetRequestFormData) => Promise<boolean>;
} 