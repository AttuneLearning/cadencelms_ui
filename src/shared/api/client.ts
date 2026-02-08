/**
 * Axios HTTP client with interceptors
 * Handles authentication, token refresh, and error handling
 *
 * Authorization:
 * - Access token is always used in Authorization header
 * - Admin token (if active) is sent via X-Admin-Token header
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
  getRefreshToken,
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
    public errors?: Record<string, string[]>,
    public requestId?: string
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

function getAuthRedirectDelayMs(): number {
  if (typeof window === 'undefined') return 0;
  const params = new URLSearchParams(window.location.search);
  const delayParam = params.get('authRedirectDelayMs');
  if (!delayParam) return 0;
  const parsed = Number(delayParam);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
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
    baseURL: env.apiFullUrl,
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
 * Request interceptor - inject access token and optional admin token
 *
 * Access token is the only bearer token accepted by auth middleware.
 * Admin token is provided via X-Admin-Token when escalation is active.
 */
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth injection for specific endpoints
    const skipAuth = config.headers?.['X-Skip-Auth'] === 'true';
    if (skipAuth) {
      delete config.headers['X-Skip-Auth'];
      return config;
    }

    // Always use the normal access token for Authorization
    const token = getAccessTokenValue();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Send admin token separately when escalation is active
    if (hasAdminToken()) {
      const adminToken = getAdminToken();
      if (adminToken) {
        config.headers['X-Admin-Token'] = adminToken;
      }
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
    const responseHeaders = error.response.headers as Record<string, string | undefined>;
    const requestId =
      responseHeaders?.['x-request-id'] ||
      responseHeaders?.['X-Request-Id'] ||
      (data as unknown as Record<string, unknown>)?.requestId as string | undefined ||
      (data as unknown as Record<string, unknown>)?.request_id as string | undefined;

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
              data?.code,
              data?.errors,
              requestId
            )
          );
        }

      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          const refreshToken = getRefreshToken();
          const refreshPayload = refreshToken?.value
            ? { refreshToken: refreshToken.value }
            : {};

          const response = await axios.post(
            `${env.apiFullUrl}/auth/refresh`,
            refreshPayload,
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
            const delayMs = getAuthRedirectDelayMs();
            const target = '/auth-error?reason=token-refresh-failed';
            if (delayMs > 0) {
              console.warn(`[API Client] Redirecting to ${target} in ${delayMs}ms (debug delay).`);
            }
            window.setTimeout(() => {
              window.location.href = target;
            }, delayMs);
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
      data?.errors,
      requestId
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
