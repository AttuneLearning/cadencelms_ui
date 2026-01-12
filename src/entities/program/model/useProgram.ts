/**
 * Program React Query Hooks
 * Provides hooks for all program-related API operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  listPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  publishProgram,
  unpublishProgram,
  duplicateProgram,
  getProgramLevels,
  getProgramEnrollments,
} from '../api/programApi';
import { programKeys } from './programKeys';
import type {
  ProgramsListResponse,
  ProgramFilters,
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
  ProgramLevelsResponse,
  ProgramEnrollmentsResponse,
  ProgramEnrollmentFilters,
} from './types';

/**
 * Hook to fetch paginated list of programs (GET /api/v2/programs)
 */
export function usePrograms(
  filters?: ProgramFilters,
  options?: Omit<
    UseQueryOptions<
      ProgramsListResponse,
      Error,
      ProgramsListResponse,
      ReturnType<typeof programKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programKeys.list(filters),
    queryFn: () => listPrograms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single program details (GET /api/v2/programs/:id)
 */
export function useProgram(
  id: string,
  options?: Omit<
    UseQueryOptions<
      Program,
      Error,
      Program,
      ReturnType<typeof programKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => getProgram(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch program levels (GET /api/v2/programs/:id/levels)
 */
export function useProgramLevels(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ProgramLevelsResponse,
      Error,
      ProgramLevelsResponse,
      ReturnType<typeof programKeys.programLevels>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programKeys.programLevels(id),
    queryFn: () => getProgramLevels(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch program enrollments (GET /api/v2/programs/:id/enrollments)
 */
export function useProgramEnrollments(
  id: string,
  filters?: ProgramEnrollmentFilters,
  options?: Omit<
    UseQueryOptions<
      ProgramEnrollmentsResponse,
      Error,
      ProgramEnrollmentsResponse,
      ReturnType<typeof programKeys.programEnrollments>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programKeys.programEnrollments(id, filters),
    queryFn: () => getProgramEnrollments(id, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (enrollment data changes more frequently)
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new program (POST /api/v2/programs)
 */
export function useCreateProgram(
  options?: UseMutationOptions<Program, Error, CreateProgramPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgram,
    onSuccess: () => {
      // Invalidate all program lists
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing program (PUT /api/v2/programs/:id)
 */
export function useUpdateProgram(
  options?: UseMutationOptions<
    Program,
    Error,
    { id: string; payload: UpdateProgramPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateProgram(id, payload),
    onSuccess: (data, variables) => {
      // Update cached detail
      queryClient.setQueryData(programKeys.detail(variables.id), data);
      // Invalidate lists to reflect updated data
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a program (DELETE /api/v2/programs/:id)
 */
export function useDeleteProgram(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProgram,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: programKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to publish a program
 */
export function usePublishProgram(
  options?: UseMutationOptions<Program, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishProgram,
    onSuccess: (data, id) => {
      // Update cached detail
      queryClient.setQueryData(programKeys.detail(id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to unpublish a program
 */
export function useUnpublishProgram(
  options?: UseMutationOptions<Program, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpublishProgram,
    onSuccess: (data, id) => {
      // Update cached detail
      queryClient.setQueryData(programKeys.detail(id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to duplicate a program
 */
export function useDuplicateProgram(
  options?: UseMutationOptions<Program, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateProgram,
    onSuccess: () => {
      // Invalidate lists to show new program
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    ...options,
  });
}
