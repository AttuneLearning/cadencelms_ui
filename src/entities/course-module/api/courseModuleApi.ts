/**
 * Course Module API
 * API methods for course module operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse } from '@/shared/api/types';
import type {
  CourseModule,
  CourseModulesListResponse,
  CreateCourseModulePayload,
  UpdateCourseModulePayload,
  CourseModuleFilters,
  ReorderCourseModulesPayload,
  ReorderCourseModulesResponse,
  DeleteCourseModuleResponse,
} from '../model/types';

/**
 * List all course modules for a course
 */
export async function listCourseModules(
  courseId: string,
  filters?: CourseModuleFilters
): Promise<CourseModulesListResponse> {
  const response = await client.get<ApiResponse<CourseModulesListResponse>>(
    endpoints.courseModules.list(courseId),
    { params: filters }
  );
  return response.data.data;
}

/**
 * Get a single course module by ID
 */
export async function getCourseModule(
  courseId: string,
  moduleId: string
): Promise<CourseModule> {
  const response = await client.get<ApiResponse<CourseModule>>(
    endpoints.courseModules.byId(courseId, moduleId)
  );
  return response.data.data;
}

/**
 * Create a new course module
 */
export async function createCourseModule(
  courseId: string,
  payload: CreateCourseModulePayload
): Promise<CourseModule> {
  const response = await client.post<ApiResponse<CourseModule>>(
    endpoints.courseModules.create(courseId),
    payload
  );
  return response.data.data;
}

/**
 * Update an existing course module
 */
export async function updateCourseModule(
  courseId: string,
  moduleId: string,
  payload: UpdateCourseModulePayload
): Promise<CourseModule> {
  const response = await client.put<ApiResponse<CourseModule>>(
    endpoints.courseModules.update(courseId, moduleId),
    payload
  );
  return response.data.data;
}

/**
 * Delete a course module
 */
export async function deleteCourseModule(
  courseId: string,
  moduleId: string,
  force?: boolean
): Promise<DeleteCourseModuleResponse> {
  const response = await client.delete<ApiResponse<DeleteCourseModuleResponse>>(
    endpoints.courseModules.delete(courseId, moduleId),
    { params: { force } }
  );
  return response.data.data;
}

/**
 * Reorder course modules
 */
export async function reorderCourseModules(
  courseId: string,
  payload: ReorderCourseModulesPayload
): Promise<ReorderCourseModulesResponse> {
  const response = await client.patch<ApiResponse<ReorderCourseModulesResponse>>(
    endpoints.courseModules.reorder(courseId),
    payload
  );
  return response.data.data;
}

/**
 * Link content to a course module
 */
export interface LinkContentToModulePayload {
  contentId: string;
  contentType?: 'scorm' | 'video' | 'document' | 'audio' | 'image';
}

export interface LinkContentToModuleResponse {
  moduleId: string;
  contentId: string;
  contentType: string;
  linkedAt: string;
  message: string;
}

export async function linkContentToModule(
  courseId: string,
  moduleId: string,
  payload: LinkContentToModulePayload
): Promise<LinkContentToModuleResponse> {
  const response = await client.post<ApiResponse<LinkContentToModuleResponse>>(
    `${endpoints.courseModules.byId(courseId, moduleId)}/link-content`,
    payload
  );
  return response.data.data;
}
