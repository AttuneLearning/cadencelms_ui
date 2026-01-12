/**
 * Department React Query Hooks
 * Provides hooks for all department-related API operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentHierarchy,
  getDepartmentPrograms,
  getDepartmentStaff,
  getDepartmentStats,
} from '../api/departmentApi';
import { departmentKeys } from './departmentKeys';
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
} from './types';

/**
 * Hook to fetch paginated list of departments (GET /api/v2/departments)
 */
export function useDepartments(
  params?: DepartmentListParams,
  options?: Omit<
    UseQueryOptions<
      DepartmentListResponse,
      Error,
      DepartmentListResponse,
      ReturnType<typeof departmentKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => getDepartments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single department details (GET /api/v2/departments/:id)
 */
export function useDepartment(
  id: string,
  options?: Omit<
    UseQueryOptions<
      DepartmentDetails,
      Error,
      DepartmentDetails,
      ReturnType<typeof departmentKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => getDepartmentById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new department (POST /api/v2/departments)
 */
export function useCreateDepartment(
  options?: UseMutationOptions<Department, Error, CreateDepartmentPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      // Invalidate all department lists and hierarchies
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.hierarchies() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing department (PUT /api/v2/departments/:id)
 */
export function useUpdateDepartment(
  options?: UseMutationOptions<
    Department,
    Error,
    { id: string; payload: UpdateDepartmentPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateDepartment(id, payload),
    onSuccess: (data, variables) => {
      // Update cached detail
      queryClient.setQueryData(departmentKeys.detail(variables.id), data);
      // Invalidate lists and hierarchies
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.hierarchies() });
    },
    ...options,
  });
}

/**
 * Hook to delete a department (DELETE /api/v2/departments/:id)
 */
export function useDeleteDepartment(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: departmentKeys.detail(id) });
      // Invalidate lists and hierarchies
      queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: departmentKeys.hierarchies() });
    },
    ...options,
  });
}

/**
 * Hook to fetch department hierarchy (GET /api/v2/departments/:id/hierarchy)
 */
export function useDepartmentHierarchy(
  id: string,
  params?: DepartmentHierarchyParams,
  options?: Omit<
    UseQueryOptions<
      DepartmentHierarchy,
      Error,
      DepartmentHierarchy,
      ReturnType<typeof departmentKeys.hierarchy>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentKeys.hierarchy(id, params),
    queryFn: () => getDepartmentHierarchy(id, params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch department programs (GET /api/v2/departments/:id/programs)
 */
export function useDepartmentPrograms(
  id: string,
  params?: DepartmentProgramsParams,
  options?: Omit<
    UseQueryOptions<
      DepartmentProgramsResponse,
      Error,
      DepartmentProgramsResponse,
      ReturnType<typeof departmentKeys.departmentPrograms>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentKeys.departmentPrograms(id, params),
    queryFn: () => getDepartmentPrograms(id, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch department staff (GET /api/v2/departments/:id/staff)
 */
export function useDepartmentStaff(
  id: string,
  params?: DepartmentStaffParams,
  options?: Omit<
    UseQueryOptions<
      DepartmentStaffResponse,
      Error,
      DepartmentStaffResponse,
      ReturnType<typeof departmentKeys.departmentStaff>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentKeys.departmentStaff(id, params),
    queryFn: () => getDepartmentStaff(id, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch department statistics (GET /api/v2/departments/:id/stats)
 */
export function useDepartmentStats(
  id: string,
  params?: DepartmentStatsParams,
  options?: Omit<
    UseQueryOptions<
      DepartmentStats,
      Error,
      DepartmentStats,
      ReturnType<typeof departmentKeys.departmentStats>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentKeys.departmentStats(id, params),
    queryFn: () => getDepartmentStats(id, params),
    staleTime: 2 * 60 * 1000, // 2 minutes (stats change more frequently)
    enabled: !!id,
    ...options,
  });
}
