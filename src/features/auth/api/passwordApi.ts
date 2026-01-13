/**
 * Password API - Phase 6
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * API service for password change operations
 */

import { apiClient } from '@/shared/api/apiClient';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Change password for current user
 * POST /api/v2/users/me/password
 */
export async function changeUserPassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ChangePasswordResponse>(
    '/users/me/password',
    data
  );
  return response.data;
}

/**
 * Change password for admin session
 * POST /api/v2/admin/me/password
 */
export async function changeAdminPassword(
  data: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ChangePasswordResponse>(
    '/admin/me/password',
    data
  );
  return response.data;
}

/**
 * Validate password strength
 * Returns validation result with requirements check
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
