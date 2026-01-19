/**
 * Grade Override API Client
 * Implements grade override endpoints for dept-admin users
 *
 * API Endpoints:
 * - PUT /enrollments/:enrollmentId/grades/override
 * - GET /enrollments/:enrollmentId/grades/history
 *
 * Authorization: academic:grades:override access right required
 * Role Required: dept-admin in the course's department
 */

import { client } from '@/shared/api/client';
import type {
  GradeOverridePayload,
  GradeOverrideResponse,
  GradeHistoryEntry,
  GradeHistoryParams,
} from '../model/gradeOverrideTypes';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// GRADE OVERRIDE
// =====================

/**
 * PUT /enrollments/:enrollmentId/grades/override
 * Override a student's grade with mandatory audit logging
 *
 * @param enrollmentId - The enrollment ID to override grade for
 * @param payload - Grade override details with reason
 * @returns Grade override response with change summary
 *
 * @throws 401 - Not authenticated
 * @throws 403 - Missing grades:override permission or not dept-admin in department
 * @throws 404 - Enrollment not found
 * @throws 422 - Validation error (reason too short, invalid grade range, etc.)
 *
 * @example
 * const result = await overrideGrade('enroll-123', {
 *   gradePercentage: 85,
 *   reason: 'Grade appeal approved by academic committee'
 * });
 */
export async function overrideGrade(
  enrollmentId: string,
  payload: GradeOverridePayload
): Promise<GradeOverrideResponse> {
  const response = await client.put<ApiResponse<GradeOverrideResponse>>(
    `/enrollments/${enrollmentId}/grades/override`,
    payload
  );
  return response.data.data;
}

/**
 * GET /enrollments/:enrollmentId/grades/history
 * Get grade change history for an enrollment
 * Returns immutable audit log of all grade overrides
 *
 * @param enrollmentId - The enrollment ID to get history for
 * @param params - Optional date range filters
 * @returns Array of grade change log entries
 *
 * @throws 401 - Not authenticated
 * @throws 403 - Insufficient permissions
 * @throws 404 - Enrollment not found
 *
 * @example
 * const history = await getGradeHistory('enroll-123', {
 *   startDate: '2026-01-01',
 *   endDate: '2026-12-31'
 * });
 */
export async function getGradeHistory(
  enrollmentId: string,
  params?: GradeHistoryParams
): Promise<GradeHistoryEntry[]> {
  const response = await client.get<ApiResponse<GradeHistoryEntry[]>>(
    `/enrollments/${enrollmentId}/grades/history`,
    { params }
  );
  return response.data.data;
}
