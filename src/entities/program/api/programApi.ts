/**
 * Program API Client
 * Implements endpoints from programs.contract.ts v1.0.0
 */

import { client } from '@/shared/api/client';
import type {
  ProgramsListResponse,
  ProgramFilters,
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
  ProgramLevelsResponse,
  ProgramEnrollmentsResponse,
  ProgramEnrollmentFilters,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /api/v2/programs - List programs with filtering and pagination
 */
export async function listPrograms(
  filters?: ProgramFilters
): Promise<ProgramsListResponse> {
  const response = await client.get<ApiResponse<ProgramsListResponse>>(
    '/api/v2/programs',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/programs/:id - Get program details by ID
 */
export async function getProgram(id: string): Promise<Program> {
  const response = await client.get<ApiResponse<Program>>(
    `/api/v2/programs/${id}`
  );
  return response.data.data;
}

/**
 * POST /api/v2/programs - Create a new program
 */
export async function createProgram(
  payload: CreateProgramPayload
): Promise<Program> {
  const response = await client.post<ApiResponse<Program>>(
    '/api/v2/programs',
    payload
  );
  return response.data.data;
}

/**
 * PUT /api/v2/programs/:id - Update program information
 */
export async function updateProgram(
  id: string,
  payload: UpdateProgramPayload
): Promise<Program> {
  const response = await client.put<ApiResponse<Program>>(
    `/api/v2/programs/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/programs/:id - Delete program (soft delete)
 */
export async function deleteProgram(id: string): Promise<void> {
  await client.delete(`/api/v2/programs/${id}`);
}

/**
 * POST /api/v2/programs/:id/publish - Publish program
 * Note: This is implemented via the update endpoint with isPublished=true
 */
export async function publishProgram(id: string): Promise<Program> {
  return updateProgram(id, { isPublished: true });
}

/**
 * POST /api/v2/programs/:id/unpublish - Unpublish program
 * Note: This is implemented via the update endpoint with isPublished=false
 */
export async function unpublishProgram(id: string): Promise<Program> {
  return updateProgram(id, { isPublished: false });
}

/**
 * POST /api/v2/programs/:id/duplicate - Duplicate a program
 * Note: This is implemented by fetching the program and creating a new one
 */
export async function duplicateProgram(id: string): Promise<Program> {
  const original = await getProgram(id);
  const payload: CreateProgramPayload = {
    name: `${original.name} (Copy)`,
    code: `${original.code}-COPY`,
    description: original.description,
    department: original.department.id,
    credential: original.credential,
    duration: original.duration,
    durationUnit: original.durationUnit,
    isPublished: false,
  };
  return createProgram(payload);
}

/**
 * GET /api/v2/programs/:id/levels - Get all levels for a program
 */
export async function getProgramLevels(id: string): Promise<ProgramLevelsResponse> {
  const response = await client.get<ApiResponse<ProgramLevelsResponse>>(
    `/api/v2/programs/${id}/levels`
  );
  return response.data.data;
}

/**
 * GET /api/v2/programs/:id/enrollments - Get all enrollments for a program
 */
export async function getProgramEnrollments(
  id: string,
  filters?: ProgramEnrollmentFilters
): Promise<ProgramEnrollmentsResponse> {
  const response = await client.get<ApiResponse<ProgramEnrollmentsResponse>>(
    `/api/v2/programs/${id}/enrollments`,
    { params: filters }
  );
  return response.data.data;
}
