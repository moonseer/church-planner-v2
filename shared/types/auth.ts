/**
 * Authentication and User-related types for Church Planner Microservices
 */

// User roles enum
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// Base User Model
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Church information (basic)
export interface IChurch {
  _id: string;
  name: string;
}

// User with church association
export interface IUserWithChurch extends IUser {
  church: IChurch | null;
}

// Request/Response Types

// User creation payload
export interface ICreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// User update payload
export interface IUpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

// Login payload
export interface ILoginDto {
  email: string;
  password: string;
}

// Token response
export interface ITokenResponse {
  token: string;
  expiresIn: number;
}

// Password reset request
export interface IForgotPasswordDto {
  email: string;
}

// Password reset payload
export interface IResetPasswordDto {
  resetToken: string;
  password: string;
}

// JWT payload structure
export interface IJwtPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Authentication context (extracted from JWT)
export interface IAuthContext {
  id: string;
  role: UserRole;
}

// Type for authenticated request - to be used with Express
export interface IAuthenticatedRequest {
  user: IAuthContext;
}

// User creation payload
export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// User update payload
export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

// Authentication payload
export interface AuthPayload {
  email: string;
  password: string;
}

// Token response
export interface TokenResponse {
  token: string;
  expiresIn: number;
}

// Password reset payload
export interface PasswordResetPayload {
  resetToken: string;
  password: string;
}

// JWT payload structure
export interface JwtPayload {
  id: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Church information (basic)
export interface IChurchInfo {
  id: string;
  name: string;
}

// User with church association
export interface IUserChurchAssociation {
  church: IChurchInfo | null;
}

// Express request with authenticated user
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: IAuthContext;
}

// Basic user identification
export interface IUserIdentity {
  id: string;
  name: string;
}

// User with email (for authentication)
export interface IUserWithEmail extends IUserIdentity {
  email: string;
}

// User with church information - complete user profile
export interface IUserWithChurch extends IUserBase, IUserChurchAssociation {
  // Combines all user information with church association
}

// Base User Interface combining identity, email, and role
export interface IUserBase extends IUserWithEmail, IUserWithRole {
  // Combines properties from IUserIdentity, IUserWithEmail and IUserWithRole
}

// Alias User to IUserBase for simpler imports
export type User = IUserBase;

// Login Request
export interface ILoginRequest extends ICredentials {
  // Uses the same properties as ICredentials
}

// Registration credentials
export interface IRegistrationCredentials extends ICredentials {
  name: string;
}

// Church information for registration
export interface IChurchRegistrationInfo {
  churchName?: string;
}

// Register Request
export interface IRegisterRequest extends IRegistrationCredentials, IChurchRegistrationInfo {
  // Combines registration credentials with optional church information
}

// User data response
export interface IUserDataResponse {
  user: IUserWithChurch;
}

// Login Response
export interface ILoginResponse extends IUserDataResponse {
  // Just contains user data
}

// Register Response
export interface IRegisterResponse extends IUserDataResponse {
  // Same structure as login response but without token
}

// Get Current User Response
export interface IUserResponse extends IUserDataResponse {
  // Just contains user data
}

// Logout Response
export interface ILogoutResponse {
  message: string;
}

// CSRF Token Response
export interface ICsrfTokenResponse {
  csrfToken: string;
}

// Authentication credentials
export interface ICredentials {
  email: string;
  password: string;
} 