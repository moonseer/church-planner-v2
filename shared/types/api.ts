/**
 * Shared types for API responses
 */

// Base interface for all API responses
export interface ApiResponse {
  success: boolean;
  error?: string | string[];
}

// Generic success response with data
export interface ApiSuccessResponse<T> extends ApiResponse {
  success: true;
  data: T;
  count?: number; // For paginated responses or collections
}

// Error response
export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: string | string[];
  statusCode?: number;
}

// Pagination metadata
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}

// Common HTTP status codes
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429, // Rate limiting or account locking
  INTERNAL_SERVER_ERROR = 500
}

// Helper type for controller functions
export type ApiResponsePromise<T> = Promise<ApiSuccessResponse<T> | ApiErrorResponse>; 