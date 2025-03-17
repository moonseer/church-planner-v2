/**
 * Authentication and User types
 */

// Basic user identification
export interface IUserIdentity {
  id: string;
  name: string;
}

// User role related
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface IUserWithRole extends IUserIdentity {
  role: UserRole;
}

// User with email (for authentication)
export interface IUserWithEmail extends IUserIdentity {
  email: string;
}

// Base User Interface combining identity, email, and role
export interface IUserBase extends IUserWithEmail, IUserWithRole {
  // Combines properties from IUserIdentity, IUserWithEmail and IUserWithRole
}

// Church information (minimal version used in user responses)
export interface IChurchInfo {
  id: string;
  name: string;
}

// User with church association
export interface IUserChurchAssociation {
  church: IChurchInfo | null;
}

// User with church information - complete user profile
export interface IUserWithChurch extends IUserBase, IUserChurchAssociation {
  // Combines all user information with church association
}

// JWT related
export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Authentication credentials
export interface ICredentials {
  email: string;
  password: string;
}

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

// Authentication token response
export interface IAuthTokenResponse {
  token: string;
}

// User data response
export interface IUserDataResponse {
  user: IUserWithChurch;
}

// Login Response
export interface ILoginResponse extends IUserDataResponse, IAuthTokenResponse {
  // Combines user data with authentication token
}

// Register Response
export interface IRegisterResponse extends ILoginResponse {
  // Same structure as login response
}

// Get Current User Response
export interface IUserResponse extends IUserDataResponse {
  // Just contains user data
}

// Authentication context
export interface IAuthContext {
  id: string;
  church?: string;
}

// Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user: IAuthContext;
} 