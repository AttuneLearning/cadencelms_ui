/**
 * Content Attempt API Client
 * API methods for content attempt operations
 */

import { client } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import type {
  ListAttemptsParams,
  ListAttemptsResponse,
  ContentAttempt,
  CreateAttemptRequest,
  CreateAttemptResponse,
  UpdateAttemptRequest,
  UpdateAttemptResponse,
  CompleteAttemptRequest,
  CompleteAttemptResponse,
  ScormCmiData,
  UpdateCmiDataRequest,
  UpdateCmiDataResponse,
  SuspendAttemptRequest,
  SuspendAttemptResponse,
  ResumeAttemptResponse,
  DeleteAttemptResponse,
} from '../model/types';

const BASE_PATH = '/content-attempts';

export const contentAttemptApi = {
  /**
   * List content attempts with optional filters
   */
  listAttempts: async (params?: ListAttemptsParams): Promise<ListAttemptsResponse> => {
    const response = await client.get<ApiResponse<ListAttemptsResponse>>(BASE_PATH, {
      params,
    });
    return response.data.data;
  },

  /**
   * Get a single attempt by ID
   */
  getAttemptById: async (id: string, includeCmi = false): Promise<ContentAttempt> => {
    const response = await client.get<ApiResponse<ContentAttempt>>(`${BASE_PATH}/${id}`, {
      params: { includeCmi },
    });
    return response.data.data;
  },

  /**
   * Create a new content attempt
   */
  createAttempt: async (data: CreateAttemptRequest): Promise<CreateAttemptResponse> => {
    const response = await client.post<ApiResponse<CreateAttemptResponse>>(BASE_PATH, data);
    return response.data.data;
  },

  /**
   * Update an attempt's progress and tracking data
   */
  updateAttempt: async (
    id: string,
    data: UpdateAttemptRequest
  ): Promise<UpdateAttemptResponse> => {
    const response = await client.patch<ApiResponse<UpdateAttemptResponse>>(
      `${BASE_PATH}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Complete an attempt with final score
   */
  completeAttempt: async (
    id: string,
    data: CompleteAttemptRequest
  ): Promise<CompleteAttemptResponse> => {
    const response = await client.post<ApiResponse<CompleteAttemptResponse>>(
      `${BASE_PATH}/${id}/complete`,
      data
    );
    return response.data.data;
  },

  /**
   * Get SCORM CMI data for an attempt
   */
  getCmiData: async (id: string): Promise<ScormCmiData> => {
    const response = await client.get<ApiResponse<ScormCmiData>>(`${BASE_PATH}/${id}/cmi`);
    return response.data.data;
  },

  /**
   * Update SCORM CMI data
   */
  updateCmiData: async (
    id: string,
    data: UpdateCmiDataRequest
  ): Promise<UpdateCmiDataResponse> => {
    const response = await client.put<ApiResponse<UpdateCmiDataResponse>>(
      `${BASE_PATH}/${id}/cmi`,
      data
    );
    return response.data.data;
  },

  /**
   * Suspend an in-progress attempt
   */
  suspendAttempt: async (
    id: string,
    data: SuspendAttemptRequest
  ): Promise<SuspendAttemptResponse> => {
    const response = await client.post<ApiResponse<SuspendAttemptResponse>>(
      `${BASE_PATH}/${id}/suspend`,
      data
    );
    return response.data.data;
  },

  /**
   * Resume a suspended attempt
   */
  resumeAttempt: async (id: string): Promise<ResumeAttemptResponse> => {
    const response = await client.post<ApiResponse<ResumeAttemptResponse>>(
      `${BASE_PATH}/${id}/resume`,
      {}
    );
    return response.data.data;
  },

  /**
   * Delete an attempt (admin only)
   */
  deleteAttempt: async (id: string, permanent = false): Promise<DeleteAttemptResponse> => {
    const response = await client.delete<ApiResponse<DeleteAttemptResponse>>(
      `${BASE_PATH}/${id}`,
      {
        params: { permanent },
      }
    );
    return response.data.data;
  },
};
