/**
 * React Query hooks for Module Access
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  recordModuleAccess,
  getModuleAccessByEnrollment,
  getModuleAccessByModule,
  getCourseModuleAccessSummary,
  markLearningUnitStarted,
  updateModuleAccessProgress,
} from '../api/moduleAccessApi';
import { moduleAccessKeys } from './moduleAccessKeys';
import type {
  RecordAccessPayload,
  RecordAccessResponse,
  EnrollmentModuleAccessResponse,
  ModuleAccessAnalyticsResponse,
  CourseModuleAccessSummaryResponse,
  ModuleAccessFilters,
  CourseSummaryFilters,
  MarkLearningUnitStartedResponse,
  UpdateProgressPayload,
  UpdateProgressResponse,
} from './types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch module access for an enrollment
 */
export function useModuleAccessByEnrollment(
  enrollmentId: string,
  options?: Omit<
    UseQueryOptions<EnrollmentModuleAccessResponse, Error, EnrollmentModuleAccessResponse, ReturnType<typeof moduleAccessKeys.byEnrollment>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleAccessKeys.byEnrollment(enrollmentId),
    queryFn: () => getModuleAccessByEnrollment(enrollmentId),
    enabled: !!enrollmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes (progress data changes more frequently)
    ...options,
  });
}

/**
 * Hook to fetch module access analytics (staff only)
 */
export function useModuleAccessByModule(
  moduleId: string,
  filters?: ModuleAccessFilters,
  options?: Omit<
    UseQueryOptions<ModuleAccessAnalyticsResponse, Error, ModuleAccessAnalyticsResponse, ReturnType<typeof moduleAccessKeys.byModule>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleAccessKeys.byModule(moduleId, filters),
    queryFn: () => getModuleAccessByModule(moduleId, filters),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch course module access summary (staff only)
 */
export function useCourseModuleAccessSummary(
  courseId: string,
  filters?: CourseSummaryFilters,
  options?: Omit<
    UseQueryOptions<CourseModuleAccessSummaryResponse, Error, CourseModuleAccessSummaryResponse, ReturnType<typeof moduleAccessKeys.courseSummary>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleAccessKeys.courseSummary(courseId, filters),
    queryFn: () => getCourseModuleAccessSummary(courseId, filters),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to record module access (when learner opens a module)
 */
export function useRecordModuleAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
    }: {
      moduleId: string;
      payload: RecordAccessPayload;
    }): Promise<RecordAccessResponse> => recordModuleAccess(moduleId, payload),
    onSuccess: (_data, variables) => {
      // Invalidate enrollment's module access
      queryClient.invalidateQueries({
        queryKey: moduleAccessKeys.byEnrollment(variables.payload.enrollmentId),
      });
    },
  });
}

/**
 * Hook to mark that learner has started a learning unit
 */
export function useMarkLearningUnitStarted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleAccessId,
    }: {
      moduleAccessId: string;
      enrollmentId: string;
    }): Promise<MarkLearningUnitStartedResponse> => markLearningUnitStarted(moduleAccessId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessKeys.byEnrollment(variables.enrollmentId),
      });
      queryClient.invalidateQueries({
        queryKey: moduleAccessKeys.record(variables.moduleAccessId),
      });
    },
  });
}

/**
 * Hook to update module progress
 */
export function useUpdateModuleAccessProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleAccessId,
      payload,
    }: {
      moduleAccessId: string;
      payload: UpdateProgressPayload;
      enrollmentId: string;
    }): Promise<UpdateProgressResponse> => updateModuleAccessProgress(moduleAccessId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moduleAccessKeys.byEnrollment(variables.enrollmentId),
      });
      queryClient.invalidateQueries({
        queryKey: moduleAccessKeys.record(variables.moduleAccessId),
      });
    },
  });
}
