/**
 * Demographics API Client
 *
 * Client for Demographics v2.0 API endpoints.
 * Handles sensitive demographic data for compliance and reporting.
 *
 * Endpoints:
 * - GET /api/v2/users/me/demographics - Get current user's demographics data
 * - PUT /api/v2/users/me/demographics - Update current user's demographics data
 *
 * IMPORTANT: All demographic data is optional and requires explicit user consent.
 */

import { client } from './client';
import type {
  IDemographicsResponse,
  IDemographicsUpdateRequest,
} from '@/shared/types/person';

/**
 * Type alias for API responses
 */
export type DemographicsApiResponse = IDemographicsResponse;

/**
 * Demographics API client
 */
export const demographicsApi = {
  /**
   * Get current user's demographics data
   *
   * All fields are optional - users control what they share.
   *
   * @returns Promise with demographics data
   * @throws ApiClientError on failure
   */
  async getMyDemographics(): Promise<DemographicsApiResponse> {
    const response = await client.get<DemographicsApiResponse>(
      '/api/v2/users/me/demographics'
    );
    return response.data;
  },

  /**
   * Update current user's demographics data
   *
   * Partial updates supported. All fields are optional.
   * UI must include clear consent checkboxes for allowReporting and allowResearch.
   *
   * @param data - Partial demographics data to update
   * @returns Promise with updated demographics data
   * @throws ApiClientError on validation or auth errors
   */
  async updateMyDemographics(
    data: IDemographicsUpdateRequest
  ): Promise<DemographicsApiResponse & { message?: string }> {
    const response = await client.put<DemographicsApiResponse & { message?: string }>(
      '/api/v2/users/me/demographics',
      data
    );
    return response.data;
  },
};
