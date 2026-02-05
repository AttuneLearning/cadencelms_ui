/**
 * Course Version API Client
 * Implements versioning endpoints from API-ISS-014, API-ISS-015
 *
 * Endpoint base: /api/v2/courses/:id/versions, /api/v2/course-versions/:id
 */

import { client } from '@/shared/api/client';
import type {
  CourseVersion,
  CourseVersionDetail,
  CourseVersionsListResponse,
  CreateCourseVersionPayload,
  CreateCourseVersionResponse,
  UpdateCourseVersionPayload,
  PublishCourseVersionPayload,
  PublishCourseVersionResponse,
  LockCourseVersionPayload,
  CourseVersionModule,
  CourseVersionModuleItem,
  ModuleEditLockResponse,
} from '../model/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// =====================
// COURSE VERSIONS
// =====================

/**
 * POST /api/v2/courses/:id/versions - Create new draft version from published course
 */
export async function createVersion(
  canonicalCourseId: string,
  payload?: CreateCourseVersionPayload
): Promise<CreateCourseVersionResponse> {
  const response = await client.post<ApiResponse<CreateCourseVersionResponse>>(
    `/api/v2/courses/${canonicalCourseId}/versions`,
    payload || {}
  );
  return response.data.data;
}

/**
 * GET /api/v2/courses/:id/versions - List all versions of a course
 */
export async function listVersions(canonicalCourseId: string): Promise<CourseVersionsListResponse> {
  const response = await client.get<ApiResponse<CourseVersionsListResponse>>(
    `/api/v2/courses/${canonicalCourseId}/versions`
  );
  return response.data.data;
}

/**
 * GET /api/v2/course-versions/:id - Get version details
 */
export async function getVersion(versionId: string): Promise<CourseVersionDetail> {
  const response = await client.get<ApiResponse<CourseVersionDetail>>(
    `/api/v2/course-versions/${versionId}`
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/course-versions/:id - Update draft version
 */
export async function updateVersion(
  versionId: string,
  payload: UpdateCourseVersionPayload
): Promise<CourseVersion> {
  const response = await client.patch<ApiResponse<CourseVersion>>(
    `/api/v2/course-versions/${versionId}`,
    payload
  );
  return response.data.data;
}

/**
 * POST /api/v2/course-versions/:id/publish - Publish version
 */
export async function publishVersion(
  versionId: string,
  payload?: PublishCourseVersionPayload
): Promise<PublishCourseVersionResponse> {
  const response = await client.post<ApiResponse<PublishCourseVersionResponse>>(
    `/api/v2/course-versions/${versionId}/publish`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /api/v2/course-versions/:id/lock - Lock version manually
 */
export async function lockVersion(
  versionId: string,
  payload?: LockCourseVersionPayload
): Promise<CourseVersion> {
  const response = await client.post<ApiResponse<CourseVersion>>(
    `/api/v2/course-versions/${versionId}/lock`,
    payload || {}
  );
  return response.data.data;
}

// =====================
// VERSION MODULES
// =====================

/**
 * GET /api/v2/course-versions/:id/modules - List modules in version
 */
export async function listVersionModules(versionId: string): Promise<CourseVersionModuleItem[]> {
  const response = await client.get<ApiResponse<CourseVersionModuleItem[]>>(
    `/api/v2/course-versions/${versionId}/modules`
  );
  return response.data.data;
}

/**
 * POST /api/v2/course-versions/:id/modules - Add module to version
 */
export async function addModuleToVersion(
  versionId: string,
  payload: {
    moduleId: string;
    order?: number;
    isRequired?: boolean;
    availableFrom?: string;
    availableUntil?: string;
  }
): Promise<CourseVersionModule> {
  const response = await client.post<ApiResponse<CourseVersionModule>>(
    `/api/v2/course-versions/${versionId}/modules`,
    payload
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/course-versions/:id/modules/reorder - Reorder modules
 */
export async function reorderVersionModules(
  versionId: string,
  moduleOrder: string[]
): Promise<void> {
  await client.patch(`/api/v2/course-versions/${versionId}/modules/reorder`, {
    moduleOrder,
  });
}

/**
 * PATCH /api/v2/course-versions/:id/modules/:moduleId - Update module settings
 */
export async function updateVersionModule(
  versionId: string,
  moduleId: string,
  payload: {
    isRequired?: boolean;
    availableFrom?: string | null;
    availableUntil?: string | null;
  }
): Promise<CourseVersionModule> {
  const response = await client.patch<ApiResponse<CourseVersionModule>>(
    `/api/v2/course-versions/${versionId}/modules/${moduleId}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/course-versions/:id/modules/:moduleId - Remove module from version
 */
export async function removeModuleFromVersion(
  versionId: string,
  moduleId: string
): Promise<void> {
  await client.delete(`/api/v2/course-versions/${versionId}/modules/${moduleId}`);
}

// =====================
// MODULE EDIT LOCKS
// =====================

/**
 * POST /api/v2/modules/:id/edit-lock - Acquire edit lock
 */
export async function acquireModuleEditLock(moduleId: string): Promise<ModuleEditLockResponse> {
  const response = await client.post<ApiResponse<ModuleEditLockResponse>>(
    `/api/v2/modules/${moduleId}/edit-lock`
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/modules/:id/edit-lock - Refresh lock (heartbeat)
 */
export async function refreshModuleEditLock(
  moduleId: string
): Promise<{ moduleId: string; expiresAt: string }> {
  const response = await client.patch<
    ApiResponse<{ moduleId: string; expiresAt: string }>
  >(`/api/v2/modules/${moduleId}/edit-lock`);
  return response.data.data;
}

/**
 * DELETE /api/v2/modules/:id/edit-lock - Release lock
 */
export async function releaseModuleEditLock(moduleId: string): Promise<void> {
  await client.delete(`/api/v2/modules/${moduleId}/edit-lock`);
}

/**
 * GET /api/v2/modules/:id/edit-lock - Check lock status
 */
export async function getModuleEditLockStatus(moduleId: string): Promise<ModuleEditLockResponse> {
  const response = await client.get<ApiResponse<ModuleEditLockResponse>>(
    `/api/v2/modules/${moduleId}/edit-lock`
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/modules/:id/edit-lock/force - Force release (admin)
 */
export async function forceReleaseModuleEditLock(moduleId: string): Promise<void> {
  await client.delete(`/api/v2/modules/${moduleId}/edit-lock/force`);
}
