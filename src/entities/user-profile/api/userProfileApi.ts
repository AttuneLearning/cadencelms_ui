/**
 * User Profile API Client
 * Implements endpoints from users.contract.ts
 */

import { client } from '@/shared/api/client';
import type { UserProfile, UpdateProfilePayload, UserDepartment } from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /users/me - Get current authenticated user profile
 * Unified endpoint for all roles
 */
export async function getUserProfile(): Promise<UserProfile> {
  const response = await client.get<ApiResponse<UserProfile>>('/users/me');
  return response.data.data;
}

/**
 * PUT /users/me - Update current user profile
 * Users can modify: firstName, lastName, phone, profileImage
 */
export async function updateUserProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const response = await client.put<ApiResponse<UserProfile>>(
    '/users/me',
    payload
  );
  return response.data.data;
}

/**
 * GET /users/me/departments - Get departments assigned to current user
 * Staff-only endpoint
 */
export async function getUserDepartments(): Promise<UserDepartment[]> {
  const response = await client.get<ApiResponse<UserDepartment[]>>(
    '/users/me/departments'
  );
  return response.data.data;
}
