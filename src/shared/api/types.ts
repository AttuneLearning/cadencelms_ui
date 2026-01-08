/**
 * Common API response types
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

/**
 * API error response structure
 */
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query parameters for filtered requests
 */
export interface FilterParams {
  search?: string;
  filters?: Record<string, string | number | boolean>;
}

/**
 * Combined query parameters
 */
export type QueryParams = PaginationParams & FilterParams;

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Request configuration with custom options
 */
export interface RequestConfig {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  onUploadProgress?: UploadProgressCallback;
}
