/**
 * Program Level API Client
 * Implements endpoints from program-levels.contract.ts v1.0.0
 */

import { client } from '@/shared/api/client';
import type {
  ProgramLevel,
  UpdateProgramLevelPayload,
  ReorderProgramLevelPayload,
  ReorderProgramLevelResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /program-levels/:id - Get program level details by ID
 */
export async function getProgramLevel(id: string): Promise<ProgramLevel> {
  const response = await client.get<ApiResponse<ProgramLevel>>(
    `/program-levels/${id}`
  );
  return response.data.data;
}

/**
 * PUT /program-levels/:id - Update program level details
 */
export async function updateProgramLevel(
  id: string,
  payload: UpdateProgramLevelPayload
): Promise<ProgramLevel> {
  const response = await client.put<ApiResponse<ProgramLevel>>(
    `/program-levels/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /program-levels/:id - Delete program level (soft delete)
 */
export async function deleteProgramLevel(id: string): Promise<void> {
  await client.delete(`/program-levels/${id}`);
}

/**
 * PATCH /program-levels/:id/reorder - Reorder level within program sequence
 */
export async function reorderProgramLevel(
  id: string,
  payload: ReorderProgramLevelPayload
): Promise<ReorderProgramLevelResponse> {
  const response = await client.patch<ApiResponse<ReorderProgramLevelResponse>>(
    `/program-levels/${id}/reorder`,
    payload
  );
  return response.data.data;
}
