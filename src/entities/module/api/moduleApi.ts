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
  ModuleLibraryItem,
  ModuleLibraryResponse,
  ModuleLibraryFilters,
  ModuleUsage,
  ModuleEditLockStatus,
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

// =====================
// MODULE LIBRARY (v2 API)
// =====================

interface ApiResponseV2<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

/**
 * GET /api/v2/modules/library - Browse module library
 */
export async function listModuleLibrary(
  filters?: ModuleLibraryFilters
): Promise<ModuleLibraryResponse> {
  const response = await client.get<ApiResponseV2<ModuleLibraryResponse>>(
    '/api/v2/modules/library',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/modules/:id - Get module from library
 */
export async function getModuleFromLibrary(
  moduleId: string
): Promise<ModuleLibraryItem> {
  const response = await client.get<ApiResponseV2<ModuleLibraryItem>>(
    `/api/v2/modules/${moduleId}`
  );
  return response.data.data;
}

/**
 * GET /api/v2/modules/:id/usage - Get where module is used
 */
export async function getModuleUsage(
  moduleId: string
): Promise<ModuleUsage> {
  const response = await client.get<ApiResponseV2<ModuleUsage>>(
    `/api/v2/modules/${moduleId}/usage`
  );
  return response.data.data;
}

// =====================
// MODULE EDIT LOCKS (v2 API)
// =====================

/**
 * POST /api/v2/modules/:id/edit-lock - Acquire edit lock
 */
export async function acquireEditLock(
  moduleId: string
): Promise<ModuleEditLockStatus> {
  const response = await client.post<ApiResponseV2<ModuleEditLockStatus>>(
    `/api/v2/modules/${moduleId}/edit-lock`
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/modules/:id/edit-lock - Refresh lock (heartbeat)
 */
export async function refreshEditLock(
  moduleId: string
): Promise<{ moduleId: string; expiresAt: string }> {
  const response = await client.patch<ApiResponseV2<{ moduleId: string; expiresAt: string }>>(
    `/api/v2/modules/${moduleId}/edit-lock`
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/modules/:id/edit-lock - Release lock
 */
export async function releaseEditLock(moduleId: string): Promise<void> {
  await client.delete(`/api/v2/modules/${moduleId}/edit-lock`);
}

/**
 * GET /api/v2/modules/:id/edit-lock - Check lock status
 */
export async function getEditLockStatus(
  moduleId: string
): Promise<ModuleEditLockStatus> {
  const response = await client.get<ApiResponseV2<ModuleEditLockStatus>>(
    `/api/v2/modules/${moduleId}/edit-lock`
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/modules/:id/edit-lock/force - Force release (admin)
 */
export async function forceReleaseEditLock(moduleId: string): Promise<void> {
  await client.delete(`/api/v2/modules/${moduleId}/edit-lock/force`);
}
