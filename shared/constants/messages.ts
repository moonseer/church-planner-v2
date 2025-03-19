/**
 * Common messages constants for Church Planner Microservices
 */

// Error Messages
export const ErrorMessages = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  NOT_AUTHENTICATED: 'You are not authenticated',
  NOT_AUTHORIZED: 'You are not authorized to access this resource',
  TOKEN_EXPIRED: 'Authentication token expired',
  TOKEN_INVALID: 'Invalid authentication token',
  
  // User
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User with this email already exists',
  INVALID_PASSWORD: 'Password must be at least 6 characters long',
  PASSWORD_RESET_EXPIRED: 'Password reset token is expired',
  PASSWORD_RESET_INVALID: 'Password reset token is invalid',
  
  // Church
  CHURCH_NOT_FOUND: 'Church not found',
  CHURCH_EXISTS: 'Church with this name already exists',
  NOT_CHURCH_ADMIN: 'You are not an admin of this church',
  
  // Members
  MEMBER_NOT_FOUND: 'Church member not found',
  MEMBER_EXISTS: 'Member with this email already exists',
  
  // Events
  EVENT_NOT_FOUND: 'Event not found',
  
  // Generic
  INVALID_ID: 'Invalid ID format',
  SERVER_ERROR: 'Server error occurred',
  VALIDATION_ERROR: 'Validation error',
  RESOURCE_NOT_FOUND: 'Resource not found',
  MISSING_REQUIRED_FIELDS: 'Please provide all required fields'
};

// Success Messages
export const SuccessMessages = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET_SENT: 'Password reset email has been sent',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  
  // User
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  
  // Church
  CHURCH_CREATED: 'Church created successfully',
  CHURCH_UPDATED: 'Church updated successfully',
  CHURCH_DELETED: 'Church deleted successfully',
  
  // Members
  MEMBER_CREATED: 'Church member created successfully',
  MEMBER_UPDATED: 'Church member updated successfully',
  MEMBER_DELETED: 'Church member deleted successfully',
  
  // Events
  EVENT_CREATED: 'Event created successfully',
  EVENT_UPDATED: 'Event updated successfully',
  EVENT_DELETED: 'Event deleted successfully'
}; 