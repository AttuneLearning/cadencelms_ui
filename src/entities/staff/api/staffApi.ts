/**
 * Staff API Client
 * Handles staff-related API calls
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { Staff, StaffListItem, StaffFormData, StaffFilters } from '../model/types';
import type { ApiResponse, PaginatedResponse } from '@/shared/api/types';

/**
 * Get paginated list of staff with filters
 */
export async function getStaff(params?: {
  page?: number;
  pageSize?: number;
  filters?: StaffFilters;
}): Promise<PaginatedResponse<StaffListItem>> {
  const response = await client.get<ApiResponse<PaginatedResponse<StaffListItem>>>(
    endpoints.admin.staff.list,
    { params }
  );
  return response.data.data;
}

/**
 * Get single staff by ID
 */
export async function getStaffById(id: string): Promise<Staff> {
  const response = await client.get<ApiResponse<Staff>>(endpoints.admin.staff.byId(id));
  return response.data.data;
}

/**
 * Create new staff
 */
export async function createStaff(data: StaffFormData): Promise<Staff> {
  const response = await client.post<ApiResponse<Staff>>(endpoints.admin.staff.create, data);
  return response.data.data;
}

/**
 * Update existing staff
 */
export async function updateStaff(id: string, data: Partial<StaffFormData>): Promise<Staff> {
  const response = await client.put<ApiResponse<Staff>>(endpoints.admin.staff.update(id), data);
  return response.data.data;
}

/**
 * Delete staff
 */
export async function deleteStaff(id: string): Promise<void> {
  await client.delete(endpoints.admin.staff.delete(id));
}

/**
 * Bulk delete staff
 */
export async function bulkDeleteStaff(ids: string[]): Promise<void> {
  await client.post(`${endpoints.admin.staff.list}/bulk-delete`, { ids });
}
