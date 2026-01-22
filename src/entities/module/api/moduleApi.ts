/**
 * Module API Client
 * Implements endpoints from api/contracts/api/modules.contract.ts v1.0.0
 *
 * Modules are nested under /courses/:courseId/modules
 */

import { client } from '@/shared/api/client';
import type {
  Module,
  ModulesListResponse,
  ModuleFilters,
  CreateModulePayload,
  UpdateModulePayload,
  ReorderModulesPayload,
  ReorderModulesResponse,
  DeleteModuleResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// LIST MODULES
// =====================

/**
 * GET /courses/:courseId/modules - List all modules in a course
 */
export async function listModules(
  courseId: string,
  filters?: ModuleFilters
): Promise<ModulesListResponse> {
  const response = await client.get<ApiResponse<ModulesListResponse>>(
    `/courses/${courseId}/modules`,
    { params: filters }
  );
  return response.data.data;
}

// =====================
// GET MODULE
// =====================

/**
 * GET /modules/:moduleId - Get module details
 */
export async function getModule(
  moduleId: string,
  includeLearningUnits?: boolean
): Promise<Module> {
  const response = await client.get<ApiResponse<Module>>(
    `/modules/${moduleId}`,
    { params: { includeLearningUnits } }
  );
  return response.data.data;
}

// =====================
// CREATE MODULE
// =====================

/**
 * POST /courses/:courseId/modules - Create a new module
 */
export async function createModule(
  courseId: string,
  payload: CreateModulePayload
): Promise<Module> {
  const response = await client.post<ApiResponse<Module>>(
    `/courses/${courseId}/modules`,
    payload
  );
  return response.data.data;
}

// =====================
// UPDATE MODULE
// =====================

/**
 * PUT /modules/:moduleId - Update an existing module
 */
export async function updateModule(
  moduleId: string,
  payload: UpdateModulePayload
): Promise<Module> {
  const response = await client.put<ApiResponse<Module>>(
    `/modules/${moduleId}`,
    payload
  );
  return response.data.data;
}

// =====================
// DELETE MODULE
// =====================

/**
 * DELETE /modules/:moduleId - Delete a module
 */
export async function deleteModule(
  moduleId: string,
  force?: boolean
): Promise<DeleteModuleResponse> {
  const response = await client.delete<ApiResponse<DeleteModuleResponse>>(
    `/modules/${moduleId}`,
    { params: { force } }
  );
  return response.data.data;
}

// =====================
// REORDER MODULES
// =====================

/**
 * PATCH /courses/:courseId/modules/reorder - Reorder modules within a course
 */
export async function reorderModules(
  courseId: string,
  payload: ReorderModulesPayload
): Promise<ReorderModulesResponse> {
  const response = await client.patch<ApiResponse<ReorderModulesResponse>>(
    `/courses/${courseId}/modules/reorder`,
    payload
  );
  return response.data.data;
}
