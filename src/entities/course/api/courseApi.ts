/**
 * Course API Client
 * Implements endpoints from courses.contract.ts v1.0.0
 *
 * Covers all 14 course management endpoints
 */

import { client } from '@/shared/api/client';
import type {
  Course,
  CoursesListResponse,
  CourseFilters,
  CreateCoursePayload,
  UpdateCoursePayload,
  PatchCoursePayload,
  PublishCoursePayload,
  UnpublishCoursePayload,
  ArchiveCoursePayload,
  DuplicateCoursePayload,
  DuplicateCourseResponse,
  ExportCourseResponse,
  ExportFormat,
  MoveDepartmentPayload,
  AssignProgramPayload,
  CourseStatusResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// COURSES
// =====================

/**
 * GET /api/v2/courses - List all courses
 */
export async function listCourses(filters?: CourseFilters): Promise<CoursesListResponse> {
  const response = await client.get<ApiResponse<CoursesListResponse>>(
    '/api/v2/courses',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/courses/:id - Get course details
 */
export async function getCourse(id: string): Promise<Course> {
  const response = await client.get<ApiResponse<Course>>(`/api/v2/courses/${id}`);
  return response.data.data;
}

/**
 * POST /api/v2/courses - Create new course
 */
export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const response = await client.post<ApiResponse<Course>>('/api/v2/courses', payload);
  return response.data.data;
}

/**
 * PUT /api/v2/courses/:id - Update course (full)
 */
export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
  const response = await client.put<ApiResponse<Course>>(`/api/v2/courses/${id}`, payload);
  return response.data.data;
}

/**
 * PATCH /api/v2/courses/:id - Update course (partial)
 */
export async function patchCourse(id: string, payload: PatchCoursePayload): Promise<Course> {
  const response = await client.patch<ApiResponse<Course>>(`/api/v2/courses/${id}`, payload);
  return response.data.data;
}

/**
 * DELETE /api/v2/courses/:id - Delete course
 */
export async function deleteCourse(id: string): Promise<void> {
  await client.delete(`/api/v2/courses/${id}`);
}

/**
 * POST /api/v2/courses/:id/publish - Publish course
 */
export async function publishCourse(
  id: string,
  payload?: PublishCoursePayload
): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/api/v2/courses/${id}/publish`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /api/v2/courses/:id/unpublish - Unpublish course
 */
export async function unpublishCourse(
  id: string,
  payload?: UnpublishCoursePayload
): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/api/v2/courses/${id}/unpublish`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /api/v2/courses/:id/archive - Archive course
 */
export async function archiveCourse(
  id: string,
  payload?: ArchiveCoursePayload
): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/api/v2/courses/${id}/archive`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /api/v2/courses/:id/unarchive - Unarchive course
 */
export async function unarchiveCourse(id: string): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/api/v2/courses/${id}/unarchive`,
    {}
  );
  return response.data.data;
}

/**
 * POST /api/v2/courses/:id/duplicate - Duplicate course
 */
export async function duplicateCourse(
  id: string,
  payload: DuplicateCoursePayload
): Promise<DuplicateCourseResponse> {
  const response = await client.post<ApiResponse<DuplicateCourseResponse>>(
    `/api/v2/courses/${id}/duplicate`,
    payload
  );
  return response.data.data;
}

/**
 * GET /api/v2/courses/:id/export - Export course
 */
export async function exportCourse(
  id: string,
  format?: ExportFormat,
  includeModules: boolean = true,
  includeAssessments: boolean = true
): Promise<ExportCourseResponse> {
  const response = await client.get<ApiResponse<ExportCourseResponse>>(
    `/api/v2/courses/${id}/export`,
    {
      params: {
        format,
        includeModules,
        includeAssessments,
      },
    }
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/courses/:id/department - Move course to different department
 */
export async function moveDepartment(
  id: string,
  payload: MoveDepartmentPayload
): Promise<{ id: string; department: { id: string; name: string } }> {
  const response = await client.patch<
    ApiResponse<{ id: string; department: { id: string; name: string } }>
  >(`/api/v2/courses/${id}/department`, payload);
  return response.data.data;
}

/**
 * PATCH /api/v2/courses/:id/program - Assign course to program
 */
export async function assignProgram(
  id: string,
  payload: AssignProgramPayload
): Promise<{ id: string; program: { id: string; name: string } | null }> {
  const response = await client.patch<
    ApiResponse<{ id: string; program: { id: string; name: string } | null }>
  >(`/api/v2/courses/${id}/program`, payload);
  return response.data.data;
}
