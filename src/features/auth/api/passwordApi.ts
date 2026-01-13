/**
 * Password API - Phase 6
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * API service for password change operations
 */

import { client } from '@/shared/api/client';

/**
 * Request body for password change operations
 */
export interface ChangePasswordRequest {
  /** Current password for authentication */
  currentPassword: string;
  /** New password to set */
  newPassword: string;
}

/**
 * Response from password change operations
 */
export interface ChangePasswordResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** Human-readable message describing the result */
  message: string;
}

/**
 * Change password for current user
 *
 * Endpoint: POST /api/v2/users/me/password
 *
 * @param data - Password change request containing current and new password
 * @returns Promise resolving to change password response
 * @throws {ApiClientError} If current password is incorrect or validation fails
 *
 * @example
 * ```typescript
 * try {
 *   const result = await changeUserPassword({
 *     currentPassword: 'oldPass123!',
 *     newPassword: 'newPass456!@'
 *   });
 *   console.log(result.message); // "Password changed successfully"
 * } catch (error) {
 *   console.error(error.message); // "Current password is incorrect"
 * }
 * ```
 */
export async function changeUserPassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  const response = await client.post<ChangePasswordResponse>(
    '/users/me/password',
    data
  );
  return response.data;
}

/**
 * Change password for admin session
 *
 * Endpoint: POST /api/v2/admin/me/password
 *
 * @param data - Password change request containing current and new password
 * @returns Promise resolving to change password response
 * @throws {ApiClientError} If current password is incorrect or validation fails
 *
 * @example
 * ```typescript
 * try {
 *   const result = await changeAdminPassword({
 *     currentPassword: 'oldAdminPass!',
 *     newPassword: 'newAdminPass@123'
 *   });
 *   console.log(result.message); // "Admin password changed successfully"
 * } catch (error) {
 *   console.error(error.message); // "Current password is incorrect"
 * }
 * ```
 */
export async function changeAdminPassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  const response = await client.post<ChangePasswordResponse>(
    '/admin/me/password',
    data
  );
  return response.data;
}

/**
 * Validate password strength and requirements
 *
 * Requirements:
 * - At least 8 characters (minLength)
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&*...)
 *
 * A password is considered "valid" if it meets at least 4 requirements AND has minLength.
 *
 * Strength levels:
 * - weak: 0-2 requirements met
 * - fair: 3 requirements met
 * - good: 4 requirements met
 * - strong: All 5 requirements met
 *
 * @param password - The password string to validate
 * @returns Validation result with strength level and individual requirements
 *
 * @example
 * ```typescript
 * const result = validatePasswordStrength('MyPass123!');
 * console.log(result.strength); // "strong"
 * console.log(result.isValid); // true
 * console.log(result.requirements.minLength); // true
 * console.log(result.requirements.hasUppercase); // true
 * ```
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
} {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  const isValid = metCount >= 4 && requirements.minLength;

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (metCount === 5) {
    strength = 'strong';
  } else if (metCount === 4) {
    strength = 'good';
  } else if (metCount === 3) {
    strength = 'fair';
  } else {
    strength = 'weak';
  }

  return {
    isValid,
    strength,
    requirements,
  };
}
