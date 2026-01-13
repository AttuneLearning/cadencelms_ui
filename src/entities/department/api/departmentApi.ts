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
 * GET /departments - List departments with pagination and filtering
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
 * POST /departments - Create a new department
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
 * GET /departments/:id - Get department details by ID
 */
export async function getDepartmentById(id: string): Promise<DepartmentDetails> {
  const response = await client.get<ApiResponse<DepartmentDetails>>(
    `/departments/${id}`
  );
  return response.data.data;
}

/**
 * PUT /departments/:id - Update department information
 */
export async function updateDepartment(
  id: string,
  payload: UpdateDepartmentPayload
): Promise<Department> {
  const response = await client.put<ApiResponse<Department>>(
    `/departments/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /departments/:id - Delete department (soft delete)
 */
export async function deleteDepartment(id: string): Promise<void> {
  await client.delete(`/departments/${id}`);
}

/**
 * GET /departments/:id/hierarchy - Get department tree structure
 */
export async function getDepartmentHierarchy(
  id: string,
  params?: DepartmentHierarchyParams
): Promise<DepartmentHierarchy> {
  const response = await client.get<ApiResponse<DepartmentHierarchy>>(
    `/departments/${id}/hierarchy`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /departments/:id/programs - Get department programs
 */
export async function getDepartmentPrograms(
  id: string,
  params?: DepartmentProgramsParams
): Promise<DepartmentProgramsResponse> {
  const response = await client.get<ApiResponse<DepartmentProgramsResponse>>(
    `/departments/${id}/programs`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /departments/:id/staff - Get department staff members
 */
export async function getDepartmentStaff(
  id: string,
  params?: DepartmentStaffParams
): Promise<DepartmentStaffResponse> {
  const response = await client.get<ApiResponse<DepartmentStaffResponse>>(
    `/departments/${id}/staff`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /departments/:id/stats - Get department statistics
 */
export async function getDepartmentStats(
  id: string,
  params?: DepartmentStatsParams
): Promise<DepartmentStats> {
  const response = await client.get<ApiResponse<DepartmentStats>>(
    `/departments/${id}/stats`,
    { params }
  );
  return response.data.data;
}
