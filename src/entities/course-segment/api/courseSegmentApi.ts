/**
 * Course Segment API
 * API methods for course segment (module) operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse } from '@/shared/api/types';
import type {
  CourseSegment,
  CourseSegmentsListResponse,
  CreateCourseSegmentPayload,
  UpdateCourseSegmentPayload,
  CourseSegmentFilters,
  ReorderCourseSegmentsPayload,
  ReorderCourseSegmentsResponse,
  DeleteCourseSegmentResponse,
} from '../model/types';

/**
 * List all course segments (modules) for a course
 */
export async function listCourseSegments(
  courseId: string,
  filters?: CourseSegmentFilters
): Promise<CourseSegmentsListResponse> {
  const response = await client.get<ApiResponse<CourseSegmentsListResponse>>(
    endpoints.courseSegments.list(courseId),
    { params: filters }
  );
  return response.data.data;
}

/**
 * Get a single course segment by ID
 */
export async function getCourseSegment(
  courseId: string,
  moduleId: string
): Promise<CourseSegment> {
  const response = await client.get<ApiResponse<CourseSegment>>(
    endpoints.courseSegments.byId(courseId, moduleId)
  );
  return response.data.data;
}

/**
 * Create a new course segment
 */
export async function createCourseSegment(
  courseId: string,
  payload: CreateCourseSegmentPayload
): Promise<CourseSegment> {
  const response = await client.post<ApiResponse<CourseSegment>>(
    endpoints.courseSegments.create(courseId),
    payload
  );
  return response.data.data;
}

/**
 * Update an existing course segment
 */
export async function updateCourseSegment(
  courseId: string,
  moduleId: string,
  payload: UpdateCourseSegmentPayload
): Promise<CourseSegment> {
  const response = await client.put<ApiResponse<CourseSegment>>(
    endpoints.courseSegments.update(courseId, moduleId),
    payload
  );
  return response.data.data;
}

/**
 * Delete a course segment
 */
export async function deleteCourseSegment(
  courseId: string,
  moduleId: string,
  force?: boolean
): Promise<DeleteCourseSegmentResponse> {
  const response = await client.delete<ApiResponse<DeleteCourseSegmentResponse>>(
    endpoints.courseSegments.delete(courseId, moduleId),
    { params: { force } }
  );
  return response.data.data;
}

/**
 * Reorder course segments
 */
export async function reorderCourseSegments(
  courseId: string,
  payload: ReorderCourseSegmentsPayload
): Promise<ReorderCourseSegmentsResponse> {
  const response = await client.patch<ApiResponse<ReorderCourseSegmentsResponse>>(
    endpoints.courseSegments.reorder(courseId),
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
    `${endpoints.courseSegments.byId(courseId, moduleId)}/link-content`,
    payload
  );
  return response.data.data;
}
