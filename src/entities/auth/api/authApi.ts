/**
 * Authentication API
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Handles all authentication-related API calls
 * Following V2 backend contracts with GNAP token structure
 *
 * Endpoints:
 * - POST /auth/login - Login with credentials
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/logout - Logout and invalidate tokens
 * - GET /auth/verify - Verify token validity
 * - POST /auth/escalate - Escalate to admin (global-admin only)
 * - POST /auth/switch-department - Switch department context
 * - GET /auth/me - Get current user with role hierarchy
 */

import { client } from '@/shared/api/client';
import type {
  LoginCredentials,
  LoginResponse,
  RefreshTokenRequest,
  RefreshResponse,
  VerifyTokenResponse,
  EscalationCredentials,
  EscalateResponse,
  SwitchDepartmentRequest,
  SwitchDepartmentResponse,
  MyRolesResponse,
} from '@/shared/types/auth';

// ============================================================================
// API Endpoints
// ============================================================================

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/verify',
  ESCALATE: '/auth/escalate',
  SWITCH_DEPARTMENT: '/auth/switch-department',
  ME: '/auth/me',
} as const;

// ============================================================================
// Login
// ============================================================================

/**
 * Login with email and password
 * Returns GNAP token grant with user profile and role hierarchy
 *
 * @param credentials - Email and password
 * @returns Promise<LoginResponse> containing token grant
 * @throws ApiClientError on authentication failure
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await client.post<LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials,
      {
        headers: {
          'X-Skip-Auth': 'true', // Don't inject auth token for login
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('[AuthAPI] Login failed:', error);
    throw error;
  }
}

// ============================================================================
// Token Refresh
// ============================================================================

/**
 * Refresh access token using refresh token
 * Returns new access token and updated role hierarchy
 *
 * Note: Refresh token should be sent via httpOnly cookie
 * If not using cookies, pass refreshToken in request body
 *
 * @param request - Optional: refresh token if not using cookies
 * @returns Promise<RefreshResponse> with new access token
 * @throws ApiClientError if refresh fails
 */
export async function refreshAccessToken(
  request?: RefreshTokenRequest
): Promise<RefreshResponse> {
  try {
    const response = await client.post<RefreshResponse>(
      AUTH_ENDPOINTS.REFRESH,
      request || {},
      {
        headers: {
          'X-Skip-Auth': 'true', // Don't inject auth token for refresh
          'X-Skip-Refresh': 'true', // Prevent infinite refresh loop
        },
        withCredentials: true, // Include cookies for refresh token
      }
    );

    return response.data;
  } catch (error) {
    console.error('[AuthAPI] Token refresh failed:', error);
    throw error;
  }
}

// ============================================================================
// Logout
// ============================================================================

/**
 * Logout and invalidate tokens
 * Clears server-side session and invalidates refresh token
 *
 * @returns Promise<void>
 */
export async function logout(): Promise<void> {
  try {
    await client.post(AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    console.error('[AuthAPI] Logout failed:', error);
    // Don't throw - allow client-side cleanup even if API fails
  }
}

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify current access token is valid
 * Useful for checking auth status on app initialization
 *
 * @returns Promise<VerifyTokenResponse> with validation result
 */
export async function verifyToken(): Promise<VerifyTokenResponse> {
  try {
    const response = await client.get<VerifyTokenResponse>(AUTH_ENDPOINTS.VERIFY);
    return response.data;
  } catch (error) {
    console.error('[AuthAPI] Token verification failed:', error);
    return { valid: false };
  }
}

// ============================================================================
// Admin Escalation (NEW IN V2)
// ============================================================================

/**
 * Escalate to admin dashboard
 * Requires:
 * - User must have 'global-admin' userType
 * - Valid escalation password (separate from login password)
 *
 * Returns admin token (store in MEMORY ONLY, never persist)
 * Admin session times out after configured period (default: 15 minutes)
 *
 * @param credentials - Escalation password
 * @returns Promise<EscalateResponse> with admin session token
 * @throws ApiClientError if escalation fails or user not authorized
 */
export async function escalateToAdmin(
  credentials: EscalationCredentials
): Promise<EscalateResponse> {
  try {
    const response = await client.post<EscalateResponse>(
      AUTH_ENDPOINTS.ESCALATE,
      credentials
    );

    return response.data;
  } catch (error) {
    console.error('[AuthAPI] Admin escalation failed:', error);
    throw error;
  }
}

// ============================================================================
// Department Switching
// ============================================================================

/**
 * Switch current department context
 * Updates user's active department and returns roles/permissions for that department
 *
 * Also updates lastSelectedDepartment on user record for persistence
 *
 * @param request - Department ID to switch to
 * @returns Promise<SwitchDepartmentResponse> with department roles and permissions
 * @throws ApiClientError if user not a member of department
 */
export async function switchDepartment(
  request: SwitchDepartmentRequest
): Promise<SwitchDepartmentResponse> {
  try {
    const response = await client.post<SwitchDepartmentResponse>(
      AUTH_ENDPOINTS.SWITCH_DEPARTMENT,
      request
    );

    return response.data;
  } catch (error) {
    console.error('[AuthAPI] Department switch failed:', error);
    throw error;
  }
}

// ============================================================================
// Get Current User with Role Hierarchy
// ============================================================================

/**
 * Get current authenticated user with full role hierarchy
 * Useful for:
 * - Session restoration on app load
 * - Refreshing user data after role changes
 * - Checking current permissions
 *
 * @returns Promise<MyRolesResponse> with user, roles, and permissions
 * @throws ApiClientError if not authenticated
 */
export async function getCurrentUser(): Promise<MyRolesResponse> {
  try {
    const response = await client.get<MyRolesResponse>(AUTH_ENDPOINTS.ME);
    return response.data;
  } catch (error) {
    console.error('[AuthAPI] Get current user failed:', error);
    throw error;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if user can escalate to admin
 * Convenience function that checks userTypes from current user
 *
 * @returns Promise<boolean> true if user has global-admin userType
 */
export async function canUserEscalateToAdmin(): Promise<boolean> {
  try {
    const response = await getCurrentUser();
    return response.data.canEscalateToAdmin;
  } catch (error) {
    console.error('[AuthAPI] Failed to check admin escalation capability:', error);
    return false;
  }
}

/**
 * Get user's available departments
 * Extracts department list from current user data
 *
 * @returns Promise<DepartmentMembership[]> list of departments user is member of
 */
export async function getUserDepartments() {
  try {
    const response = await getCurrentUser();
    return response.data.departmentMemberships;
  } catch (error) {
    console.error('[AuthAPI] Failed to get user departments:', error);
    return [];
  }
}

// ============================================================================
// Export all functions
// ============================================================================

export const authApi = {
  login,
  refreshAccessToken,
  logout,
  verifyToken,
  escalateToAdmin,
  switchDepartment,
  getCurrentUser,
  canUserEscalateToAdmin,
  getUserDepartments,
} as const;

export default authApi;
