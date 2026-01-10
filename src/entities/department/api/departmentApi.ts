/**
 * Department API Client
 * Implements endpoints from departments.contract.ts v1.0.0
 */

import { client } from '@/shared/api/client';
import type {
  DepartmentListResponse,
  DepartmentListParams,
  DepartmentDetails,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  Department,
  DepartmentHierarchy,
  DepartmentHierarchyParams,
  DepartmentProgramsResponse,
  DepartmentProgramsParams,
  DepartmentStaffResponse,
  DepartmentStaffParams,
  DepartmentStats,
  DepartmentStatsParams,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /api/v2/departments - List departments with pagination and filtering
 */
export async function getDepartments(
  params?: DepartmentListParams
): Promise<DepartmentListResponse> {
  const response = await client.get<ApiResponse<DepartmentListResponse>>(
    '/departments',
    { params }
  );
  return response.data.data;
}

/**
 * POST /api/v2/departments - Create a new department
 */
export async function createDepartment(
  payload: CreateDepartmentPayload
): Promise<Department> {
  const response = await client.post<ApiResponse<Department>>(
    '/departments',
    payload
  );
  return response.data.data;
}

/**
 * GET /api/v2/departments/:id - Get department details by ID
 */
export async function getDepartmentById(id: string): Promise<DepartmentDetails> {
  const response = await client.get<ApiResponse<DepartmentDetails>>(
    `/api/v2/departments/${id}`
  );
  return response.data.data;
}

/**
 * PUT /api/v2/departments/:id - Update department information
 */
export async function updateDepartment(
  id: string,
  payload: UpdateDepartmentPayload
): Promise<Department> {
  const response = await client.put<ApiResponse<Department>>(
    `/api/v2/departments/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/departments/:id - Delete department (soft delete)
 */
export async function deleteDepartment(id: string): Promise<void> {
  await client.delete(`/api/v2/departments/${id}`);
}

/**
 * GET /api/v2/departments/:id/hierarchy - Get department tree structure
 */
export async function getDepartmentHierarchy(
  id: string,
  params?: DepartmentHierarchyParams
): Promise<DepartmentHierarchy> {
  const response = await client.get<ApiResponse<DepartmentHierarchy>>(
    `/api/v2/departments/${id}/hierarchy`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /api/v2/departments/:id/programs - Get department programs
 */
export async function getDepartmentPrograms(
  id: string,
  params?: DepartmentProgramsParams
): Promise<DepartmentProgramsResponse> {
  const response = await client.get<ApiResponse<DepartmentProgramsResponse>>(
    `/api/v2/departments/${id}/programs`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /api/v2/departments/:id/staff - Get department staff members
 */
export async function getDepartmentStaff(
  id: string,
  params?: DepartmentStaffParams
): Promise<DepartmentStaffResponse> {
  const response = await client.get<ApiResponse<DepartmentStaffResponse>>(
    `/api/v2/departments/${id}/staff`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /api/v2/departments/:id/stats - Get department statistics
 */
export async function getDepartmentStats(
  id: string,
  params?: DepartmentStatsParams
): Promise<DepartmentStats> {
  const response = await client.get<ApiResponse<DepartmentStats>>(
    `/api/v2/departments/${id}/stats`,
    { params }
  );
  return response.data.data;
}
