/**
 * React Query hooks for Staff entity
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  bulkDeleteStaff,
} from '../api/staffApi';
import type { StaffFormData, StaffFilters } from '../model/types';

export const STAFF_KEYS = {
  all: ['staff'] as const,
  lists: () => [...STAFF_KEYS.all, 'list'] as const,
  list: (params?: { page?: number; pageSize?: number; filters?: StaffFilters }) =>
    [...STAFF_KEYS.lists(), params] as const,
  details: () => [...STAFF_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...STAFF_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all staff with pagination and filters
 */
export function useStaffList(params?: {
  page?: number;
  pageSize?: number;
  filters?: StaffFilters;
}) {
  return useQuery({
    queryKey: STAFF_KEYS.list(params),
    queryFn: () => getStaff(params),
  });
}

/**
 * Hook to fetch a single staff member by ID
 */
export function useStaffDetail(id: string) {
  return useQuery({
    queryKey: STAFF_KEYS.detail(id),
    queryFn: () => getStaffById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new staff member
 */
export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffFormData) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
    },
  });
}

/**
 * Hook to update a staff member
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaffFormData> }) =>
      updateStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
    },
  });
}

/**
 * Hook to delete a staff member
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
    },
  });
}

/**
 * Hook to bulk delete staff members
 */
export function useBulkDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteStaff(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.lists() });
    },
  });
}
