/**
 * Class React Query Hooks
 * Custom hooks for class data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { classKeys } from './classKeys';
import type {
  Class,
  ClassesListResponse,
  CreateClassPayload,
  UpdateClassPayload,
  ClassFilters,
  ClassRoster,
  ClassProgress,
  EnrollLearnersPayload,
  ClassEnrollmentsResponse,
} from './types';
import * as classApi from '../api/classApi';

/**
 * Hook to fetch list of classes
 */
export function useClasses(
  filters?: ClassFilters,
  options?: Omit<UseQueryOptions<ClassesListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: classKeys.list(filters),
    queryFn: () => classApi.listClasses(filters),
    ...options,
  });
}

/**
 * Hook to fetch a single class by ID
 */
export function useClass(
  id: string,
  options?: Omit<UseQueryOptions<Class>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classApi.getClass(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch class roster
 */
export function useClassRoster(
  id: string,
  params?: {
    includeProgress?: boolean;
    status?: 'active' | 'withdrawn' | 'completed';
  },
  options?: Omit<UseQueryOptions<ClassRoster>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: classKeys.roster(id, params),
    queryFn: () => classApi.getClassRoster(id, params),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch class enrollments
 */
export function useClassEnrollments(
  id: string,
  params?: {
    status?: 'active' | 'withdrawn' | 'completed';
    page?: number;
    limit?: number;
  },
  options?: Omit<UseQueryOptions<ClassEnrollmentsResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: classKeys.enrollments(id, params),
    queryFn: () => classApi.getClassEnrollments(id, params),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch class progress
 */
export function useClassProgress(
  id: string,
  options?: Omit<UseQueryOptions<ClassProgress>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: classKeys.progress(id),
    queryFn: () => classApi.getClassProgress(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to fetch class stats
 */
export function useClassStats(
  id: string,
  options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof classApi.getClassStats>>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: classKeys.stats(id),
    queryFn: () => classApi.getClassStats(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new class
 */
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClassPayload) => classApi.createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

/**
 * Hook to update a class
 */
export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClassPayload }) =>
      classApi.updateClass(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

/**
 * Hook to delete a class
 */
export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      classApi.deleteClass(id, force),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
}

/**
 * Hook to enroll learners in a class
 */
export function useEnrollLearners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EnrollLearnersPayload }) =>
      classApi.addLearnersToClass(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.roster(variables.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.enrollments(variables.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.stats(variables.id) });
    },
  });
}

/**
 * Hook to drop a learner from a class
 */
export function useDropLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enrollmentId, reason }: { id: string; enrollmentId: string; reason?: string }) =>
      classApi.removeLearnerFromClass(id, enrollmentId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.roster(variables.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.enrollments(variables.id) });
      queryClient.invalidateQueries({ queryKey: classKeys.stats(variables.id) });
    },
  });
}
