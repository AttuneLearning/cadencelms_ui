/**
 * User Profile API Client
 * Implements endpoints from users.contract.ts
 */

import { client } from '@/shared/api/client';
import type {
  UserProfile,
  UpdateProfilePayload,
  UserDepartment,
  UserProfileContext,
  IStaffPersonExtended,
  ILearnerPersonExtended,
  IDemographics,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const getContextHeaders = (context?: UserProfileContext) => {
  return context ? { 'X-User-Type-Context': context } : undefined;
};

/**
 * GET /users/me - Get current authenticated user profile
 * Unified endpoint for all roles
 */
export async function getUserProfile(context?: UserProfileContext): Promise<UserProfile> {
  const response = await client.get<ApiResponse<UserProfile>>('/users/me', {
    headers: getContextHeaders(context),
  });
  return response.data.data;
}

/**
 * PUT /users/me - Update current user profile
 * Users can modify: firstName, lastName, phone, profileImage
 */
export async function updateUserProfile(
  payload: UpdateProfilePayload,
  context?: UserProfileContext
): Promise<UserProfile> {
  const response = await client.put<ApiResponse<UserProfile>>(
    '/users/me',
    payload,
    {
      headers: getContextHeaders(context),
    }
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

// ============================================================================
// ISS-010: PersonExtended & Demographics API Functions
// ============================================================================

/**
 * GET /users/me/person/extended - Get extended person data (context-aware)
 * Returns IStaffPersonExtended or ILearnerPersonExtended based on X-User-Type-Context header
 */
export async function getPersonExtended<T extends IStaffPersonExtended | ILearnerPersonExtended>(
  context: UserProfileContext
): Promise<T> {
  const response = await client.get<ApiResponse<T>>(
    '/users/me/person/extended',
    {
      headers: getContextHeaders(context),
    }
  );
  return response.data.data;
}

/**
 * PUT /users/me/person/extended - Update extended person data
 * Context determines which extended profile to update (staff or learner)
 */
export async function updatePersonExtended<T extends IStaffPersonExtended | ILearnerPersonExtended>(
  payload: Partial<T>,
  context: UserProfileContext
): Promise<T> {
  const response = await client.put<ApiResponse<T>>(
    '/users/me/person/extended',
    payload,
    {
      headers: getContextHeaders(context),
    }
  );
  return response.data.data;
}

/**
 * GET /users/me/demographics - Get demographics data
 * Returns context-specific demographics (staff or learner)
 */
export async function getDemographics(): Promise<IDemographics> {
  const response = await client.get<ApiResponse<IDemographics>>(
    '/users/me/demographics'
  );
  return response.data.data;
}

/**
 * PUT /users/me/demographics - Update demographics data
 * Partial updates supported
 */
export async function updateDemographics(
  payload: Partial<IDemographics>
): Promise<IDemographics> {
  const response = await client.put<ApiResponse<IDemographics>>(
    '/users/me/demographics',
    payload
  );
  return response.data.data;
}
