/**
 * Token Storage Utilities
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Handles secure storage and retrieval of authentication tokens
 * Following GNAP token structure and security best practices
 *
 * Security Strategy:
 * - Access tokens: sessionStorage (cleared on tab close)
 * - Refresh tokens: localStorage (persistent across sessions)
 * - Admin tokens: MEMORY ONLY (never persisted)
 */

import type { AccessToken, RefreshToken } from '@/shared/types/auth';

// ============================================================================
// Storage Keys
// ============================================================================

const ACCESS_TOKEN_KEY = 'lms_access_token';
const REFRESH_TOKEN_KEY = 'lms_refresh_token';

// ============================================================================
// Access Token Management (sessionStorage)
// ============================================================================

/**
 * Store access token in sessionStorage
 * Session storage is cleared when tab closes, providing better security
 *
 * @param token - AccessToken object with value, type, and expiration
 */
export function setAccessToken(token: AccessToken): void {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(token));
  } catch (error) {
    console.error('[TokenStorage] Failed to set access token:', error);
    throw new Error('Failed to store access token');
  }
}

/**
 * Get access token from sessionStorage
 * Automatically checks for expiration and removes expired tokens
 *
 * @returns AccessToken object or null if not found/expired
 */
export function getAccessToken(): AccessToken | null {
  try {
    const stored = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    if (!stored) {
      return null;
    }

    const token = JSON.parse(stored) as AccessToken;

    // Check if token is expired
    if (isTokenExpired(token.expiresAt)) {
      removeAccessToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('[TokenStorage] Failed to get access token:', error);
    removeAccessToken(); // Clean up corrupted data
    return null;
  }
}

/**
 * Remove access token from sessionStorage
 */
export function removeAccessToken(): void {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Failed to remove access token:', error);
  }
}

/**
 * Check if access token exists and is valid
 *
 * @returns true if valid token exists, false otherwise
 */
export function hasValidAccessToken(): boolean {
  const token = getAccessToken();
  return token !== null;
}

// ============================================================================
// Refresh Token Management (localStorage)
// ============================================================================

/**
 * Store refresh token in localStorage
 * Persistent across browser sessions for better UX
 *
 * @param token - RefreshToken object with value and expiration
 */
export function setRefreshToken(token: RefreshToken): void {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify(token));
  } catch (error) {
    console.error('[TokenStorage] Failed to set refresh token:', error);
    throw new Error('Failed to store refresh token');
  }
}

/**
 * Get refresh token from localStorage
 * Automatically checks for expiration and removes expired tokens
 *
 * @returns RefreshToken object or null if not found/expired
 */
export function getRefreshToken(): RefreshToken | null {
  try {
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!stored) {
      return null;
    }

    const token = JSON.parse(stored) as RefreshToken;

    // Check if token is expired
    if (isTokenExpired(token.expiresAt)) {
      removeRefreshToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('[TokenStorage] Failed to get refresh token:', error);
    removeRefreshToken(); // Clean up corrupted data
    return null;
  }
}

/**
 * Remove refresh token from localStorage
 */
export function removeRefreshToken(): void {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Failed to remove refresh token:', error);
  }
}

/**
 * Check if refresh token exists and is valid
 *
 * @returns true if valid token exists, false otherwise
 */
export function hasValidRefreshToken(): boolean {
  const token = getRefreshToken();
  return token !== null;
}

// ============================================================================
// Token Expiration Checking
// ============================================================================

/**
 * Check if a token is expired based on its expiresAt timestamp
 *
 * @param expiresAt - ISO 8601 timestamp string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(expiresAt: string): boolean {
  try {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    return expirationDate <= now;
  } catch (error) {
    console.error('[TokenStorage] Failed to check token expiration:', error);
    return true; // Assume expired on error
  }
}

/**
 * Get time remaining until token expires
 *
 * @param expiresAt - ISO 8601 timestamp string
 * @returns milliseconds until expiration, or 0 if expired
 */
export function getTimeUntilExpiration(expiresAt: string): number {
  try {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const timeRemaining = expirationDate.getTime() - now.getTime();
    return Math.max(0, timeRemaining);
  } catch (error) {
    console.error('[TokenStorage] Failed to calculate time until expiration:', error);
    return 0;
  }
}

/**
 * Check if token will expire soon (within specified minutes)
 *
 * @param expiresAt - ISO 8601 timestamp string
 * @param minutesThreshold - Number of minutes to consider "soon" (default: 5)
 * @returns true if token expires within threshold
 */
export function isTokenExpiringSoon(expiresAt: string, minutesThreshold: number = 5): boolean {
  const timeRemaining = getTimeUntilExpiration(expiresAt);
  const thresholdMs = minutesThreshold * 60 * 1000;
  return timeRemaining > 0 && timeRemaining <= thresholdMs;
}

// ============================================================================
// Clear All Auth Data
// ============================================================================

/**
 * Clear all authentication data from storage
 * Call this on logout or when switching users
 */
export function clearAllTokens(): void {
  removeAccessToken();
  removeRefreshToken();
}

// ============================================================================
// Legacy Support (for migration from old storage format)
// ============================================================================

/**
 * Migrate from old token storage format if needed
 * This can be removed after all users have migrated
 */
export function migrateLegacyTokenStorage(): void {
  try {
    // Check for old format in localStorage (if you had a different format before)
    const oldAccessToken = localStorage.getItem('accessToken');
    const oldRefreshToken = localStorage.getItem('refreshToken');

    if (oldAccessToken || oldRefreshToken) {
      console.warn('[TokenStorage] Found legacy token format, migrating...');

      // Clean up old format
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Note: Cannot migrate without expiration data
      // User will need to log in again
      console.warn('[TokenStorage] Legacy tokens cleared, user needs to log in again');
    }
  } catch (error) {
    console.error('[TokenStorage] Failed to migrate legacy tokens:', error);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get raw access token value (just the JWT string)
 * Useful for Authorization headers
 *
 * @returns token string or null
 */
export function getAccessTokenValue(): string | null {
  const token = getAccessToken();
  return token?.value || null;
}

/**
 * Get raw refresh token value (just the token string)
 *
 * @returns token string or null
 */
export function getRefreshTokenValue(): string | null {
  const token = getRefreshToken();
  return token?.value || null;
}

/**
 * Debug utility: Get storage status
 * Useful for development and troubleshooting
 *
 * @returns Object with storage status information
 */
export function getStorageStatus(): {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  accessTokenExpired: boolean;
  refreshTokenExpired: boolean;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
} {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  return {
    hasAccessToken: accessToken !== null,
    hasRefreshToken: refreshToken !== null,
    accessTokenExpired: accessToken ? isTokenExpired(accessToken.expiresAt) : true,
    refreshTokenExpired: refreshToken ? isTokenExpired(refreshToken.expiresAt) : true,
    accessTokenExpiresIn: accessToken ? getTimeUntilExpiration(accessToken.expiresAt) : undefined,
    refreshTokenExpiresIn: refreshToken ? getTimeUntilExpiration(refreshToken.expiresAt) : undefined,
  };
}

// ============================================================================
// Storage Event Handling (for multi-tab synchronization)
// ============================================================================

/**
 * Callback type for storage change events
 */
export type StorageChangeCallback = (event: {
  type: 'access-token' | 'refresh-token';
  action: 'set' | 'removed';
}) => void;

let storageChangeCallbacks: StorageChangeCallback[] = [];

/**
 * Listen for storage changes in other tabs
 * Useful for multi-tab logout synchronization
 *
 * @param callback - Function to call when storage changes
 * @returns Cleanup function to remove listener
 */
export function onStorageChange(callback: StorageChangeCallback): () => void {
  storageChangeCallbacks.push(callback);

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === ACCESS_TOKEN_KEY) {
      callback({
        type: 'access-token',
        action: e.newValue ? 'set' : 'removed',
      });
    } else if (e.key === REFRESH_TOKEN_KEY) {
      callback({
        type: 'refresh-token',
        action: e.newValue ? 'set' : 'removed',
      });
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    storageChangeCallbacks = storageChangeCallbacks.filter((cb) => cb !== callback);
  };
}
