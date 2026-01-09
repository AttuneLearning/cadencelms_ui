/**
 * Learner API Client
 * Handles learner-related API calls
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { Learner, LearnerListItem, LearnerFormData, LearnerFilters } from '../model/types';
import type { ApiResponse, PaginatedResponse } from '@/shared/api/types';

/**
 * Get paginated list of learners with filters
 */
export async function getLearners(params?: {
  page?: number;
  pageSize?: number;
  filters?: LearnerFilters;
}): Promise<PaginatedResponse<LearnerListItem>> {
  const response = await client.get<ApiResponse<PaginatedResponse<LearnerListItem>>>(
    endpoints.admin.learners.list,
    { params }
  );
  return response.data.data;
}

/**
 * Get single learner by ID
 */
export async function getLearnerById(id: string): Promise<Learner> {
  const response = await client.get<ApiResponse<Learner>>(endpoints.admin.learners.byId(id));
  return response.data.data;
}

/**
 * Create new learner
 */
export async function createLearner(data: LearnerFormData): Promise<Learner> {
  const response = await client.post<ApiResponse<Learner>>(endpoints.admin.learners.create, data);
  return response.data.data;
}

/**
 * Update existing learner
 */
export async function updateLearner(id: string, data: Partial<LearnerFormData>): Promise<Learner> {
  const response = await client.put<ApiResponse<Learner>>(
    endpoints.admin.learners.update(id),
    data
  );
  return response.data.data;
}

/**
 * Delete learner
 */
export async function deleteLearner(id: string): Promise<void> {
  await client.delete(endpoints.admin.learners.delete(id));
}

/**
 * Bulk delete learners
 */
export async function bulkDeleteLearners(ids: string[]): Promise<void> {
  await client.post(`${endpoints.admin.learners.list}/bulk-delete`, { ids });
}
