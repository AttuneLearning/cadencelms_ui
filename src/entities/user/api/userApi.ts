/**
 * User API Client
 * Handles user-related API calls for admin operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { User, UserListItem, UserFormData, UserFilters } from '../model/types';

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export const userApi = {
  /**
   * Get paginated list of users with filters
   */
  list: async (params?: {
    page?: number;
    pageSize?: number;
    filters?: UserFilters;
  }): Promise<UserListResponse> => {
    const response = await client.get(endpoints.admin.users.list, { params });
    return response.data;
  },

  /**
   * Get single user by ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await client.get(endpoints.admin.users.byId(id));
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (data: UserFormData): Promise<User> => {
    const response = await client.post(endpoints.admin.users.create, data);
    return response.data;
  },

  /**
   * Update existing user
   */
  update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const response = await client.put(endpoints.admin.users.update(id), data);
    return response.data;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    await client.delete(endpoints.admin.users.delete(id));
  },

  /**
   * Bulk delete users
   */
  bulkDelete: async (ids: string[]): Promise<void> => {
    await client.post(`${endpoints.admin.users.list}/bulk-delete`, { ids });
  },
};
