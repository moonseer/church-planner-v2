/**
 * Utility types for common patterns in the application
 */

/**
 * Makes specified properties in T optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specified properties in T required
 */
export type Required<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: T[P];
};

/**
 * Creates a type with only the specified properties from T
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Removes specified properties from T
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Creates a type with all properties of T nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Creates a type for a result object commonly used in service methods
 */
export type Result<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Creates a type for paginated results
 */
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Creates a type for filtering and sorting options
 */
export type QueryOptions<T> = {
  filter?: Partial<T>;
  sort?: {
    [K in keyof T]?: 'asc' | 'desc';
  };
  page?: number;
  pageSize?: number;
};

/**
 * Type for a callback function that returns a value
 */
export type ValueCallback<T> = () => T;

/**
 * Type for a callback function that returns a promise
 */
export type AsyncValueCallback<T> = () => Promise<T>;

/**
 * Type for a callback function that returns a result object
 */
export type ResultCallback<T> = () => Result<T>;

/**
 * Type for a callback function that returns a promise of a result object
 */
export type AsyncResultCallback<T> = () => Promise<Result<T>>;

/**
 * Type for mapping over an object
 */
export type Mapped<T, U> = {
  [K in keyof T]: U;
};

/**
 * Type for deep partial - all properties and nested properties become optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}; 