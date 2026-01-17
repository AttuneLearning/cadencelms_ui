/**
 * Axios HTTP client with interceptors
 * Handles authentication, token refresh, and error handling
 *
 * Authorization Priority:
 * 1. Admin token (if active) - for elevated privileges
 * 2. Access token (fallback) - for normal user operations
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/shared/config/env';
import type { ApiError } from './types';
import type { AccessToken } from '@/shared/types/auth';
import { getAdminToken, hasAdminToken } from '@/shared/utils/adminTokenStorage';
import {
  clearAllTokens,
  getAccessTokenValue,
  setAccessToken as setStoredAccessToken,
} from '@/shared/utils/tokenStorage';

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Clear authentication data from storage (new + legacy)
 */
function clearAuthStorage(): void {
  clearAllTokens();
  try {
    localStorage.removeItem('auth-storage');
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
}

/**
 * Store refreshed access token and return the raw token string
 */
function storeAccessToken(token: AccessToken | string): string {
  if (typeof token === 'string') {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    setStoredAccessToken({
      value: token,
      type: 'Bearer',
      expiresAt,
      scope: [],
    });
    return token;
  }

  setStoredAccessToken(token);
  return token.value;
}

/**
 * Create Axios instance with default configuration
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for refresh token
  });

  return instance;
};

/**
 * Main API client instance
 */
export const client = createAxiosInstance();

/**
 * Flag to prevent multiple simultaneous refresh requests
 */
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh completion
 */
function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers when token refresh completes
 */
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Request interceptor - inject access token with admin token priority
 *
 * Priority order:
 * 1. Admin token (if active) - for elevated admin operations
 * 2. Access token (fallback) - for normal user operations
 */
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth injection for specific endpoints
    const skipAuth = config.headers?.['X-Skip-Auth'] === 'true';
    if (skipAuth) {
      delete config.headers['X-Skip-Auth'];
      return config;
    }

    // Priority 1: Use admin token if active
    if (hasAdminToken()) {
      const adminToken = getAdminToken();
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        console.log('[API Client] Using admin token for request');
        return config;
      }
    }

    // Priority 2: Fall back to regular access token
    const token = getAccessTokenValue();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle errors and token refresh
 */
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle network errors
    if (!error.response) {
      return Promise.reject(
        new ApiClientError(
          'Network error. Please check your internet connection.',
          0,
          'NETWORK_ERROR'
        )
      );
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - attempt token refresh
    if (status === 401 && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      const skipRefresh =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.headers?.['X-Skip-Refresh'] === 'true';

      if (skipRefresh) {
        clearAuthStorage();
        return Promise.reject(
          new ApiClientError(
            data?.message || 'Authentication failed',
            status,
            data?.code
          )
        );
      }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          const response = await axios.post(
            `${env.apiBaseUrl}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                'X-Skip-Auth': 'true',
              },
            }
          );

          const accessTokenPayload =
            response.data?.data?.accessToken ?? response.data?.accessToken;

          if (!accessTokenPayload) {
            throw new ApiClientError('Invalid refresh response', 401, 'TOKEN_REFRESH_INVALID');
          }

          const accessTokenValue = storeAccessToken(accessTokenPayload);
          isRefreshing = false;

          // Notify all waiting requests
          onTokenRefreshed(accessTokenValue);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessTokenValue}`;
          return client(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          clearAuthStorage();

          // Redirect to auth-error page for debugging (skip in test environment)
          // Previously redirected to /login which made debugging auth issues difficult
          if (typeof window !== 'undefined' && env.environment !== 'test') {
            window.location.href = '/auth-error?reason=token-refresh-failed';
          }

          return Promise.reject(
            new ApiClientError('Session expired. Please login again.', 401, 'TOKEN_EXPIRED')
          );
        }
      }

      // Wait for token refresh to complete
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(client(originalRequest));
        });
      });
    }

    // Handle other error responses
    const apiError = new ApiClientError(
      data?.message || 'An error occurred',
      status,
      data?.code,
      data?.errors
    );

    return Promise.reject(apiError);
  }
);

/**
 * Export a factory function for creating new client instances
 * Useful for testing and special use cases
 */
export function createClient(): AxiosInstance {
  return createAxiosInstance();
}
