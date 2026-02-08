/**
 * Exception API Client
 * Implements enrollment-scoped exception management endpoints
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  LearnerException,
  ExceptionsListResponse,
  GrantExceptionPayload,
  UpdateExceptionPayload,
  ExceptionFilters,
  GrantExceptionResponse,
  ExceptionType,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// HELPER
// =====================

function getEndpointForType(enrollmentId: string, type: ExceptionType): string {
  switch (type) {
    case 'extra_attempts':
      return endpoints.exceptions.extraAttempts(enrollmentId);
    case 'extended_access':
      return endpoints.exceptions.extendedAccess(enrollmentId);
    case 'module_unlock':
      return endpoints.exceptions.moduleUnlock(enrollmentId);
    case 'grade_override':
      return endpoints.exceptions.gradeOverride(enrollmentId);
    case 'excused_content':
      return endpoints.exceptions.excusedContent(enrollmentId);
  }
}

// =====================
// EXCEPTION ENDPOINTS
// =====================

/**
 * GET /enrollments/:enrollmentId/exceptions - List exceptions for an enrollment
 */
export async function getEnrollmentExceptions(
  enrollmentId: string,
  filters?: ExceptionFilters
): Promise<ExceptionsListResponse> {
  const response = await client.get<ApiResponse<ExceptionsListResponse>>(
    endpoints.exceptions.byEnrollment(enrollmentId),
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /enrollments/:enrollmentId/exceptions/:id - Get exception details
 */
export async function getException(enrollmentId: string, id: string): Promise<LearnerException> {
  const response = await client.get<ApiResponse<{ exception: LearnerException }>>(
    endpoints.exceptions.byId(enrollmentId, id)
  );
  return response.data.data.exception;
}

/**
 * POST /enrollments/:enrollmentId/exceptions/:type - Grant new exception
 * Routes to the type-specific endpoint based on the type field
 */
export async function grantException(payload: GrantExceptionPayload): Promise<LearnerException> {
  const { enrollmentId, type, ...body } = payload;
  const endpoint = getEndpointForType(enrollmentId, type);
  const response = await client.post<ApiResponse<GrantExceptionResponse>>(endpoint, {
    type,
    ...body,
  });
  return response.data.data.exception;
}

/**
 * PATCH /enrollments/:enrollmentId/exceptions/:id - Update exception
 */
export async function updateException(
  enrollmentId: string,
  id: string,
  payload: UpdateExceptionPayload
): Promise<LearnerException> {
  const response = await client.patch<ApiResponse<{ exception: LearnerException }>>(
    endpoints.exceptions.byId(enrollmentId, id),
    payload
  );
  return response.data.data.exception;
}

/**
 * PUT /enrollments/:enrollmentId/exceptions/:id/revoke - Revoke exception
 */
export async function revokeException(enrollmentId: string, id: string): Promise<void> {
  await client.put(endpoints.exceptions.byId(enrollmentId, id), { isActive: false });
}
