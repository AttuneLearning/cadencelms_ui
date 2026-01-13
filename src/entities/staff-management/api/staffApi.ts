/**
 * Staff Management API Client
 * Implements endpoints from staff.contract.ts
 */

import { client } from '@/shared/api/client';
import type {
  Staff,
  StaffListParams,
  StaffListResponse,
  RegisterStaffPayload,
  UpdateStaffPayload,
  UpdateDepartmentsPayload,
  DeleteStaffResponse,
  UpdateDepartmentsResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /users/staff - List staff users
 * Supports filtering, pagination, search, and sorting
 */
export async function listStaff(params?: StaffListParams): Promise<StaffListResponse> {
  const response = await client.get<ApiResponse<StaffListResponse>>(
    '/users/staff',
    { params }
  );
  return response.data.data;
}

/**
 * POST /users/staff - Register new staff user
 * Creates a new staff account with department assignments
 */
export async function registerStaff(payload: RegisterStaffPayload): Promise<Staff> {
  const response = await client.post<ApiResponse<Staff>>(
    '/users/staff',
    payload
  );
  return response.data.data;
}

/**
 * GET /users/staff/:id - Get staff user by ID
 * Returns detailed staff profile including metadata
 */
export async function getStaffById(id: string): Promise<Staff> {
  const response = await client.get<ApiResponse<Staff>>(
    `/users/staff/${id}`
  );
  return response.data.data;
}

/**
 * PUT /users/staff/:id - Update staff user
 * Updates basic profile information (partial update)
 */
export async function updateStaff(
  id: string,
  payload: UpdateStaffPayload
): Promise<Staff> {
  const response = await client.put<ApiResponse<Staff>>(
    `/users/staff/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /users/staff/:id - Soft delete staff user
 * Sets status to withdrawn and disables login
 */
export async function deleteStaff(
  id: string,
  reason?: string
): Promise<DeleteStaffResponse> {
  const response = await client.delete<ApiResponse<DeleteStaffResponse>>(
    `/users/staff/${id}`,
    { params: { reason } }
  );
  return response.data.data;
}

/**
 * PATCH /users/staff/:id/departments - Update department assignments
 * Add, remove, update, or replace department assignments for a staff member
 */
export async function updateStaffDepartments(
  id: string,
  payload: UpdateDepartmentsPayload
): Promise<UpdateDepartmentsResponse> {
  const response = await client.patch<ApiResponse<UpdateDepartmentsResponse>>(
    `/users/staff/${id}/departments`,
    payload
  );
  return response.data.data;
}
