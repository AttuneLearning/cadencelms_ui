/**
 * Staff User API Client
 * Handles staff user-related API calls for admin operations
 * 
 * Endpoints:
 * - List (paginated): GET /api/v2/users/staff?page=&limit=&search=&department=&role=&status=&sort=
 * - Create: POST /api/v2/users/staff (requires escalation)
 * - Update: PUT /api/v2/users/staff/:id (requires escalation)
 * - Delete (soft): DELETE /api/v2/users/staff/:id (requires escalation + system-admin)
 * - Dept roles update: PATCH /api/v2/users/staff/:id/departments
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { User, UserListItem, UserFormData } from '../model/types';
import type { DataShapeWarningDetails } from '@/shared/types/data-shape-warning';

export interface StaffListParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  sort?: string;
}

export interface StaffListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  shapeWarning?: DataShapeWarningDetails;
}

export interface DepartmentRoleUpdate {
  departmentId: string;
  roles: string[];
  isPrimary?: boolean;
}

let hasLoggedStaffShapeWarning = false;

export const staffApi = {
  /**
   * Get paginated list of staff users with filters
   * GET /users/staff?page=&limit=&search=&department=&role=&status=&sort=
   */
  list: async (params?: StaffListParams): Promise<StaffListResponse> => {
    console.log('[staffApi.list] Making request to:', endpoints.admin.staff.list);
    try {
      const response = await client.get(endpoints.admin.staff.list, { params });
      console.log('[staffApi.list] Raw response:', response);
      console.log('[staffApi.list] Response data:', response.data);
      // API returns { success, data: { staff, pagination } }
      // Transform to our expected format
      const apiData = response.data?.data ?? response.data ?? {};
      console.log('[staffApi.list] apiData:', apiData);
      const normalizedData = apiData?.data ?? apiData;
      console.log('[staffApi.list] normalizedData:', normalizedData);
      let shapeWarning: DataShapeWarningDetails | undefined;
      const staffList = Array.isArray(normalizedData?.staff)
        ? normalizedData.staff
        : Array.isArray(normalizedData?.users)
          ? normalizedData.users
          : Array.isArray(normalizedData?.items)
            ? normalizedData.items
            : Array.isArray(normalizedData?.results)
              ? normalizedData.results
              : [];
      console.log('[staffApi.list] staffList:', staffList);

      // Transform API response: map 'id' to '_id' for frontend compatibility
      const users = staffList.map((staff: any) => ({
        ...staff,
        _id: staff.id || staff._id,  // Ensure _id is set
      // Map roles if present (API returns 'role' singular, we expect 'roles' array)
      roles: staff.roles || (staff.role ? [staff.role] : []),
    }));

    if (
      !Array.isArray(normalizedData?.staff) &&
      !Array.isArray(normalizedData?.users) &&
      !Array.isArray(normalizedData?.items) &&
      !Array.isArray(normalizedData?.results)
    ) {
      if (!hasLoggedStaffShapeWarning) {
        console.warn('[staffApi] Unexpected list response shape', {
          data: normalizedData,
        });
        hasLoggedStaffShapeWarning = true;
      }
      shapeWarning = {
        endpoint: '/users/staff',
        method: 'GET',
        expected: 'data.staff: UserListItem[] (or data.users/items/results)',
        received: normalizedData,
      };
    }

    const pagination = normalizedData?.pagination ?? normalizedData?.meta ?? {};
    const total =
      normalizedData?.total ??
      normalizedData?.totalCount ??
      pagination?.total ??
      pagination?.totalCount ??
      users.length;
    const page = normalizedData?.page ?? pagination?.page ?? 1;
    const limit = normalizedData?.limit ?? normalizedData?.pageSize ?? pagination?.limit ?? 10;
    const totalPages =
      normalizedData?.totalPages ??
      pagination?.totalPages ??
      (limit > 0 ? Math.ceil(total / limit) : 1);
    
    const result = {
      users,
      total,
      page,
      limit,
      totalPages,
      shapeWarning,
    };
    console.log('[staffApi.list] Returning:', result);
    return result;
    } catch (err) {
      console.error('[staffApi.list] Error:', err);
      throw err;
    }
  },

  /**
   * Get single staff user by ID
   * GET /users/staff/:id
   */
  getById: async (id: string): Promise<User> => {
    const response = await client.get(endpoints.admin.staff.byId(id));
    return response.data;
  },

  /**
   * Create new staff user (requires escalation)
   * POST /users/staff
   */
  create: async (data: UserFormData): Promise<User> => {
    const response = await client.post(endpoints.admin.staff.create, data);
    return response.data;
  },

  /**
   * Update existing staff user (requires escalation)
   * PUT /users/staff/:id
   */
  update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const response = await client.put(endpoints.admin.staff.update(id), data);
    return response.data;
  },

  /**
   * Delete staff user - soft delete (requires escalation + system-admin)
   * DELETE /users/staff/:id
   */
  delete: async (id: string): Promise<void> => {
    await client.delete(endpoints.admin.staff.delete(id));
  },

  /**
   * Update department roles for a staff user
   * PATCH /users/staff/:id/departments
   */
  updateDepartments: async (id: string, departments: DepartmentRoleUpdate[]): Promise<User> => {
    const response = await client.patch(endpoints.admin.staff.updateDepartments(id), { departments });
    return response.data;
  },

  /**
   * Bulk delete staff users (requires escalation + system-admin)
   */
  bulkDelete: async (ids: string[]): Promise<void> => {
    // Note: May need to implement individual deletes if bulk endpoint doesn't exist
    await Promise.all(ids.map(id => client.delete(endpoints.admin.staff.delete(id))));
  },
};
