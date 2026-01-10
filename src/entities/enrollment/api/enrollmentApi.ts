/**
 * Enrollment API Client
 * Implements endpoints from enrollments.contract.ts v1.0.0
 *
 * Covers all enrollment management endpoints
 */

import { client } from '@/shared/api/client';
import type {
  Enrollment,
  EnrollmentsListResponse,
  EnrollmentFilters,
  EnrollProgramPayload,
  EnrollCoursePayload,
  EnrollClassPayload,
  UpdateEnrollmentStatusPayload,
  WithdrawEnrollmentPayload,
  ProgramEnrollment,
  CourseEnrollment,
  ClassEnrollment,
  UpdateStatusResponse,
  WithdrawResponse,
  ProgramEnrollmentsResponse,
  CourseEnrollmentsResponse,
  ClassEnrollmentsResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// ENROLLMENTS
// =====================

/**
 * GET /enrollments - List all enrollments
 */
export async function listEnrollments(
  filters?: EnrollmentFilters
): Promise<EnrollmentsListResponse> {
  const response = await client.get<ApiResponse<EnrollmentsListResponse>>(
    '/enrollments',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /enrollments/:id - Get enrollment details
 */
export async function getEnrollment(id: string): Promise<Enrollment> {
  const response = await client.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
  return response.data.data;
}

/**
 * POST /enrollments/program - Enroll in program
 */
export async function enrollInProgram(
  payload: EnrollProgramPayload
): Promise<ProgramEnrollment> {
  const response = await client.post<ApiResponse<{ enrollment: ProgramEnrollment }>>(
    '/enrollments/program',
    payload
  );
  return response.data.data.enrollment;
}

/**
 * POST /enrollments/course - Enroll in course
 */
export async function enrollInCourse(payload: EnrollCoursePayload): Promise<CourseEnrollment> {
  const response = await client.post<ApiResponse<{ enrollment: CourseEnrollment }>>(
    '/enrollments/course',
    payload
  );
  return response.data.data.enrollment;
}

/**
 * POST /enrollments/class - Enroll in class
 */
export async function enrollInClass(payload: EnrollClassPayload): Promise<ClassEnrollment> {
  const response = await client.post<ApiResponse<{ enrollment: ClassEnrollment }>>(
    '/enrollments/class',
    payload
  );
  return response.data.data.enrollment;
}

/**
 * PATCH /enrollments/:id/status - Update enrollment status
 */
export async function updateEnrollmentStatus(
  id: string,
  payload: UpdateEnrollmentStatusPayload
): Promise<UpdateStatusResponse> {
  const response = await client.patch<ApiResponse<UpdateStatusResponse>>(
    `/enrollments/${id}/status`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /enrollments/:id - Withdraw from enrollment
 */
export async function withdrawFromEnrollment(
  id: string,
  payload?: WithdrawEnrollmentPayload
): Promise<WithdrawResponse> {
  const response = await client.delete<ApiResponse<WithdrawResponse>>(
    `/enrollments/${id}`,
    { data: payload }
  );
  return response.data.data;
}

/**
 * GET /enrollments/program/:programId - List program enrollments
 */
export async function listProgramEnrollments(
  programId: string,
  filters?: { page?: number; limit?: number; status?: string; sort?: string }
): Promise<ProgramEnrollmentsResponse> {
  const response = await client.get<ApiResponse<ProgramEnrollmentsResponse>>(
    `/enrollments/program/${programId}`,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /enrollments/course/:courseId - List course enrollments
 */
export async function listCourseEnrollments(
  courseId: string,
  filters?: { page?: number; limit?: number; status?: string; sort?: string }
): Promise<CourseEnrollmentsResponse> {
  const response = await client.get<ApiResponse<CourseEnrollmentsResponse>>(
    `/enrollments/course/${courseId}`,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /enrollments/class/:classId - List class enrollments
 */
export async function listClassEnrollments(
  classId: string,
  filters?: { page?: number; limit?: number; status?: string; sort?: string }
): Promise<ClassEnrollmentsResponse> {
  const response = await client.get<ApiResponse<ClassEnrollmentsResponse>>(
    `/enrollments/class/${classId}`,
    { params: filters }
  );
  return response.data.data;
}
