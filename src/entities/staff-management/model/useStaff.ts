/**
 * Staff Management React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listStaff,
  registerStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updateStaffDepartments,
} from '../api/staffApi';
import { staffKeys } from './staffKeys';
import type {
  Staff,
  StaffListParams,
  StaffListResponse,
  UpdateStaffPayload,
  UpdateDepartmentsPayload,
} from './types';

/**
 * Hook to list staff users (GET /api/v2/users/staff)
 * Supports filtering, pagination, search, and sorting
 */
export function useStaffList(
  params?: StaffListParams,
  options?: Omit<
    UseQueryOptions<StaffListResponse, Error, StaffListResponse, ReturnType<typeof staffKeys.list>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: () => listStaff(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to get staff user by ID (GET /api/v2/users/staff/:id)
 * Returns detailed profile including metadata
 */
export function useStaff(
  id: string,
  options?: Omit<
    UseQueryOptions<Staff, Error, Staff, ReturnType<typeof staffKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => getStaffById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to register new staff user (POST /api/v2/users/staff)
 * Creates a new staff account with department assignments
 */
export function useRegisterStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerStaff,
    onSuccess: () => {
      // Invalidate staff lists to show the new staff member
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

/**
 * Hook to update staff user (PUT /api/v2/users/staff/:id)
 * Updates basic profile information
 */
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStaffPayload }) =>
      updateStaff(id, payload),
    onSuccess: (data, variables) => {
      // Update cached staff detail
      queryClient.setQueryData(staffKeys.detail(variables.id), data);
      // Invalidate staff lists to reflect changes
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

/**
 * Hook to delete staff user (DELETE /api/v2/users/staff/:id)
 * Soft deletes by setting status to withdrawn
 */
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      deleteStaff(id, reason),
    onSuccess: (_data, variables) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: staffKeys.detail(variables.id) });
      // Invalidate staff lists
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

/**
 * Hook to update staff department assignments (PATCH /api/v2/users/staff/:id/departments)
 * Add, remove, update, or replace department assignments
 */
export function useUpdateStaffDepartments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentsPayload }) =>
      updateStaffDepartments(id, payload),
    onSuccess: (data, variables) => {
      // Update cached staff detail with new departments and permissions
      queryClient.setQueryData(staffKeys.detail(variables.id), (oldData: Staff | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          departments: data.departments,
          permissions: data.permissions,
          updatedAt: data.updatedAt,
        };
      });
      // Invalidate staff lists to reflect changes
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}
