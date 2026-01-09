/**
 * React Query hooks for User entity
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/userApi';
import type { UserFormData, UserFilters } from '../model/types';

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (params?: { page?: number; pageSize?: number; filters?: UserFilters }) =>
    [...USER_KEYS.lists(), params] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all users with pagination and filters
 */
export function useUserList(params?: {
  page?: number;
  pageSize?: number;
  filters?: UserFilters;
}) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => userApi.list(params),
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUserDetail(id: string) {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserFormData) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) =>
      userApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
}

/**
 * Hook to bulk delete users
 */
export function useBulkDeleteUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => userApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
}
