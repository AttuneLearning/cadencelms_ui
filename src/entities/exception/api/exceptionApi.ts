/**
 * Exception API Client
 * Implements learner exception management endpoints
 */

import { client } from '@/shared/api/client';
import type {
  LearnerException,
  ExceptionsListResponse,
  GrantExceptionPayload,
  UpdateExceptionPayload,
  ExceptionFilters,
  GrantExceptionResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// EXCEPTION ENDPOINTS
// =====================

/**
 * GET /exceptions - List exceptions
 */
export async function listExceptions(filters?: ExceptionFilters): Promise<ExceptionsListResponse> {
  const response = await client.get<ApiResponse<ExceptionsListResponse>>('/exceptions', {
    params: filters,
  });
  return response.data.data;
}

/**
 * GET /exceptions/:id - Get exception details
 */
export async function getException(id: string): Promise<LearnerException> {
  const response = await client.get<ApiResponse<{ exception: LearnerException }>>(
    `/exceptions/${id}`
  );
  return response.data.data.exception;
}

/**
 * POST /exceptions - Grant new exception
 */
export async function grantException(payload: GrantExceptionPayload): Promise<LearnerException> {
  const response = await client.post<ApiResponse<GrantExceptionResponse>>('/exceptions', payload);
  return response.data.data.exception;
}

/**
 * PATCH /exceptions/:id - Update exception
 */
export async function updateException(
  id: string,
  payload: UpdateExceptionPayload
): Promise<LearnerException> {
  const response = await client.patch<ApiResponse<{ exception: LearnerException }>>(
    `/exceptions/${id}`,
    payload
  );
  return response.data.data.exception;
}

/**
 * DELETE /exceptions/:id - Revoke exception
 */
export async function revokeException(id: string): Promise<void> {
  await client.delete(`/exceptions/${id}`);
}
