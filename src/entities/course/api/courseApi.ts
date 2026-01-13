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
 * GET /courses - List all courses
 */
export async function listCourses(filters?: CourseFilters): Promise<CoursesListResponse> {
  const response = await client.get<ApiResponse<CoursesListResponse>>(
    '/courses',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /courses/:id - Get course details
 */
export async function getCourse(id: string): Promise<Course> {
  const response = await client.get<ApiResponse<Course>>(`/courses/${id}`);
  return response.data.data;
}

/**
 * POST /courses - Create new course
 */
export async function createCourse(payload: CreateCoursePayload): Promise<Course> {
  const response = await client.post<ApiResponse<Course>>('/courses', payload);
  return response.data.data;
}

/**
 * PUT /courses/:id - Update course (full)
 */
export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<Course> {
  const response = await client.put<ApiResponse<Course>>(`/courses/${id}`, payload);
  return response.data.data;
}

/**
 * PATCH /courses/:id - Update course (partial)
 */
export async function patchCourse(id: string, payload: PatchCoursePayload): Promise<Course> {
  const response = await client.patch<ApiResponse<Course>>(`/courses/${id}`, payload);
  return response.data.data;
}

/**
 * DELETE /courses/:id - Delete course
 */
export async function deleteCourse(id: string): Promise<void> {
  await client.delete(`/courses/${id}`);
}

/**
 * POST /courses/:id/publish - Publish course
 */
export async function publishCourse(
  id: string,
  payload?: PublishCoursePayload
): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/courses/${id}/publish`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /courses/:id/unpublish - Unpublish course
 */
export async function unpublishCourse(
  id: string,
  payload?: UnpublishCoursePayload
): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/courses/${id}/unpublish`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /courses/:id/archive - Archive course
 */
export async function archiveCourse(
  id: string,
  payload?: ArchiveCoursePayload
): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/courses/${id}/archive`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /courses/:id/unarchive - Unarchive course
 */
export async function unarchiveCourse(id: string): Promise<CourseStatusResponse> {
  const response = await client.post<ApiResponse<CourseStatusResponse>>(
    `/courses/${id}/unarchive`,
    {}
  );
  return response.data.data;
}

/**
 * POST /courses/:id/duplicate - Duplicate course
 */
export async function duplicateCourse(
  id: string,
  payload: DuplicateCoursePayload
): Promise<DuplicateCourseResponse> {
  const response = await client.post<ApiResponse<DuplicateCourseResponse>>(
    `/courses/${id}/duplicate`,
    payload
  );
  return response.data.data;
}

/**
 * GET /courses/:id/export - Export course
 */
export async function exportCourse(
  id: string,
  format?: ExportFormat,
  includeModules: boolean = true,
  includeAssessments: boolean = true
): Promise<ExportCourseResponse> {
  const response = await client.get<ApiResponse<ExportCourseResponse>>(
    `/courses/${id}/export`,
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
 * PATCH /courses/:id/department - Move course to different department
 */
export async function moveDepartment(
  id: string,
  payload: MoveDepartmentPayload
): Promise<{ id: string; department: { id: string; name: string } }> {
  const response = await client.patch<
    ApiResponse<{ id: string; department: { id: string; name: string } }>
  >(`/courses/${id}/department`, payload);
  return response.data.data;
}

/**
 * PATCH /courses/:id/program - Assign course to program
 */
export async function assignProgram(
  id: string,
  payload: AssignProgramPayload
): Promise<{ id: string; program: { id: string; name: string } | null }> {
  const response = await client.patch<
    ApiResponse<{ id: string; program: { id: string; name: string } | null }>
  >(`/courses/${id}/program`, payload);
  return response.data.data;
}
