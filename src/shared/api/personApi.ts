/**
 * Person API Client
 *
 * Client for Person v2.0 API endpoints.
 * Handles basic person data (IPerson) and extended person data (IPersonExtended).
 *
 * Endpoints:
 * - GET /api/v2/users/me/person - Get current user's person data
 * - PUT /api/v2/users/me/person - Update current user's person data
 * - GET /api/v2/users/me/person/extended - Get extended person data (role-specific)
 * - PUT /api/v2/users/me/person/extended - Update extended person data
 */

import { client } from './client';
import type {
  IPersonResponse,
  IPersonExtendedResponse,
  IPersonUpdateRequest,
  ILearnerPersonExtendedUpdateRequest,
  IStaffPersonExtendedUpdateRequest,
} from '@/shared/types/person';

/**
 * Type alias for API responses
 */
export type PersonApiResponse = IPersonResponse;
export type PersonExtendedApiResponse = IPersonExtendedResponse;

/**
 * Type for extended person update requests (union of learner and staff)
 */
export type PersonExtendedUpdateRequest =
  | ILearnerPersonExtendedUpdateRequest
  | IStaffPersonExtendedUpdateRequest
  | Record<string, any>;

/**
 * Person API client
 */
export const personApi = {
  /**
   * Get current user's person data
   *
   * @returns Promise with person data
   * @throws ApiClientError on failure
   */
  async getMyPerson(): Promise<PersonApiResponse> {
    const response = await client.get<PersonApiResponse>('/api/v2/users/me/person');
    return response.data;
  },

  /**
   * Update current user's person data
   *
   * @param data - Partial person data to update
   * @returns Promise with updated person data
   * @throws ApiClientError on validation or auth errors
   */
  async updateMyPerson(
    data: IPersonUpdateRequest
  ): Promise<PersonApiResponse & { message?: string }> {
    const response = await client.put<PersonApiResponse & { message?: string }>(
      '/api/v2/users/me/person',
      data
    );
    return response.data;
  },

  /**
   * Get current user's extended person data (role-specific)
   *
   * Returns ILearnerPersonExtended for learners or IStaffPersonExtended for staff.
   *
   * @returns Promise with extended person data
   * @throws ApiClientError on failure
   */
  async getMyPersonExtended(): Promise<PersonExtendedApiResponse> {
    const response = await client.get<PersonExtendedApiResponse>(
      '/api/v2/users/me/person/extended'
    );
    return response.data;
  },

  /**
   * Update current user's extended person data
   *
   * Request shape depends on user role (learner vs staff).
   *
   * @param data - Partial extended person data to update
   * @returns Promise with updated extended person data
   * @throws ApiClientError on validation or auth errors
   */
  async updateMyPersonExtended(
    data: PersonExtendedUpdateRequest
  ): Promise<PersonExtendedApiResponse & { message?: string }> {
    const response = await client.put<PersonExtendedApiResponse & { message?: string }>(
      '/api/v2/users/me/person/extended',
      data
    );
    return response.data;
  },
};
