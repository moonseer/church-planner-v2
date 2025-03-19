/**
 * Shared API types for Church Planner Microservices
 */

// Standard API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | string[];
  count?: number;
  pagination?: Pagination;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Query parameters
export interface QueryParams {
  select?: string;
  sort?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Generic CRUD operations
export interface CrudOperations<T> {
  getAll(query?: QueryParams): Promise<ApiResponse<T[]>>;
  getById(id: string): Promise<ApiResponse<T>>;
  create(data: Partial<T>): Promise<ApiResponse<T>>;
  update(id: string, data: Partial<T>): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

// Success response with data
export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

// Error response
export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: string | string[];
}

// Paginated response
export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  count: number;
  pagination: Pagination;
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