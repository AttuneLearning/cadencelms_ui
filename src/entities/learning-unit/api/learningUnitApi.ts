/**
 * Learning Unit API Client
 * Implements endpoints from api/contracts/api/learning-units.contract.ts v1.0.0
 *
 * Learning units are nested under /modules/:moduleId/learning-units
 */

import { client } from '@/shared/api/client';
import type {
  LearningUnit,
  LearningUnitsListResponse,
  LearningUnitFilters,
  CreateLearningUnitPayload,
  UpdateLearningUnitPayload,
  ReorderLearningUnitsPayload,
  ReorderLearningUnitsResponse,
  MoveLearningUnitPayload,
  MoveLearningUnitResponse,
  DeleteLearningUnitResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// LIST LEARNING UNITS
// =====================

/**
 * GET /modules/:moduleId/learning-units - List all learning units in a module
 */
export async function listLearningUnits(
  moduleId: string,
  filters?: LearningUnitFilters
): Promise<LearningUnitsListResponse> {
  const response = await client.get<ApiResponse<LearningUnitsListResponse>>(
    `/modules/${moduleId}/learning-units`,
    { params: filters }
  );
  return response.data.data;
}

// =====================
// GET LEARNING UNIT
// =====================

/**
 * GET /learning-units/:learningUnitId - Get learning unit details
 */
export async function getLearningUnit(learningUnitId: string): Promise<LearningUnit> {
  const response = await client.get<ApiResponse<LearningUnit>>(
    `/learning-units/${learningUnitId}`
  );
  return response.data.data;
}

// =====================
// CREATE LEARNING UNIT
// =====================

/**
 * POST /modules/:moduleId/learning-units - Create a new learning unit
 */
export async function createLearningUnit(
  moduleId: string,
  payload: CreateLearningUnitPayload
): Promise<LearningUnit> {
  const response = await client.post<ApiResponse<LearningUnit>>(
    `/modules/${moduleId}/learning-units`,
    payload
  );
  return response.data.data;
}

// =====================
// UPDATE LEARNING UNIT
// =====================

/**
 * PUT /learning-units/:learningUnitId - Update an existing learning unit
 */
export async function updateLearningUnit(
  learningUnitId: string,
  payload: UpdateLearningUnitPayload
): Promise<LearningUnit> {
  const response = await client.put<ApiResponse<LearningUnit>>(
    `/learning-units/${learningUnitId}`,
    payload
  );
  return response.data.data;
}

// =====================
// DELETE LEARNING UNIT
// =====================

/**
 * DELETE /learning-units/:learningUnitId - Delete a learning unit
 */
export async function deleteLearningUnit(
  learningUnitId: string,
  force?: boolean
): Promise<DeleteLearningUnitResponse> {
  const response = await client.delete<ApiResponse<DeleteLearningUnitResponse>>(
    `/learning-units/${learningUnitId}`,
    { params: { force } }
  );
  return response.data.data;
}

// =====================
// REORDER LEARNING UNITS
// =====================

/**
 * PATCH /modules/:moduleId/learning-units/reorder - Reorder learning units within a module
 */
export async function reorderLearningUnits(
  moduleId: string,
  payload: ReorderLearningUnitsPayload
): Promise<ReorderLearningUnitsResponse> {
  const response = await client.patch<ApiResponse<ReorderLearningUnitsResponse>>(
    `/modules/${moduleId}/learning-units/reorder`,
    payload
  );
  return response.data.data;
}

// =====================
// MOVE LEARNING UNIT
// =====================

/**
 * POST /learning-units/:learningUnitId/move - Move learning unit to another module
 */
export async function moveLearningUnit(
  learningUnitId: string,
  payload: MoveLearningUnitPayload
): Promise<MoveLearningUnitResponse> {
  const response = await client.post<ApiResponse<MoveLearningUnitResponse>>(
    `/learning-units/${learningUnitId}/move`,
    payload
  );
  return response.data.data;
}
