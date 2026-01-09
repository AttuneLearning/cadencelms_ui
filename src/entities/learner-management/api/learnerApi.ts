/**
 * Learner API Client
 * Implements endpoints from learners.contract.ts
 */

import { client } from '@/shared/api/client';
import type {
  ListLearnersParams,
  ListLearnersResponse,
  RegisterLearnerPayload,
  LearnerResponse,
  LearnerDetails,
  UpdateLearnerPayload,
  DeleteLearnerResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /api/v2/users/learners - List all learners with filtering and pagination
 * Requires: staff or admin permissions
 */
export async function listLearners(
  params?: ListLearnersParams
): Promise<ListLearnersResponse> {
  const response = await client.get<ApiResponse<ListLearnersResponse>>(
    '/api/v2/users/learners',
    { params }
  );
  return response.data.data;
}

/**
 * POST /api/v2/users/learners - Register a new learner account
 * Requires: staff or admin permissions
 */
export async function registerLearner(
  payload: RegisterLearnerPayload
): Promise<LearnerResponse> {
  const response = await client.post<ApiResponse<{ learner: LearnerResponse }>>(
    '/api/v2/users/learners',
    payload
  );
  return response.data.data.learner;
}

/**
 * GET /api/v2/users/learners/:id - Get detailed learner profile by ID
 * Requires: staff or admin permissions
 */
export async function getLearnerById(id: string): Promise<LearnerDetails> {
  const response = await client.get<ApiResponse<LearnerDetails>>(
    `/api/v2/users/learners/${id}`
  );
  return response.data.data;
}

/**
 * PUT /api/v2/users/learners/:id - Update learner profile information
 * Requires: staff or admin permissions
 */
export async function updateLearner(
  id: string,
  payload: UpdateLearnerPayload
): Promise<LearnerResponse> {
  const response = await client.put<ApiResponse<{ learner: LearnerResponse }>>(
    `/api/v2/users/learners/${id}`,
    payload
  );
  return response.data.data.learner;
}

/**
 * DELETE /api/v2/users/learners/:id - Soft delete learner account
 * Requires: admin permissions only
 */
export async function deleteLearner(
  id: string,
  reason?: string
): Promise<DeleteLearnerResponse> {
  const params = reason ? { reason } : undefined;
  const response = await client.delete<ApiResponse<DeleteLearnerResponse>>(
    `/api/v2/users/learners/${id}`,
    { params }
  );
  return response.data.data;
}
