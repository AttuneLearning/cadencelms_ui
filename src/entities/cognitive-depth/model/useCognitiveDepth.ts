/**
 * Cognitive Depth React Query Hooks
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@/shared/ui/use-toast';
import {
  getSystemDepthLevels,
  getDepartmentDepthLevels,
  getCourseDepthLevels,
  overrideCourseDepthLevel,
  resetCourseDepthOverrides,
} from '../api/cognitiveDepthApi';
import { cognitiveDepthKeys } from './cognitiveDepthKeys';
import type {
  CognitiveDepthLevel,
  CourseDepthLevelsResponse,
  DepthOverridePayload,
  ResetOverridesPayload,
} from './types';

/**
 * Hook to fetch system default depth levels
 */
export function useSystemDepthLevels(
  options?: Omit<
    UseQueryOptions<
      CognitiveDepthLevel[],
      Error,
      CognitiveDepthLevel[],
      ReturnType<typeof cognitiveDepthKeys.system>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: cognitiveDepthKeys.system(),
    queryFn: () => getSystemDepthLevels(),
    staleTime: 30 * 60 * 1000, // 30 minutes (rarely changes)
    ...options,
  });
}

/**
 * Hook to fetch department depth levels
 */
export function useDepartmentDepthLevels(
  departmentId: string,
  options?: Omit<
    UseQueryOptions<
      CognitiveDepthLevel[],
      Error,
      CognitiveDepthLevel[],
      ReturnType<typeof cognitiveDepthKeys.department>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: cognitiveDepthKeys.department(departmentId),
    queryFn: () => getDepartmentDepthLevels(departmentId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!departmentId,
    ...options,
  });
}

/**
 * Hook to fetch course depth levels with override info
 */
export function useCourseDepthLevels(
  courseId: string,
  options?: Omit<
    UseQueryOptions<
      CourseDepthLevelsResponse,
      Error,
      CourseDepthLevelsResponse,
      ReturnType<typeof cognitiveDepthKeys.course>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: cognitiveDepthKeys.course(courseId),
    queryFn: () => getCourseDepthLevels(courseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!courseId,
    ...options,
  });
}

/**
 * Hook to override a course depth level
 */
export function useOverrideCourseDepthLevel(
  courseId: string,
  options?: UseMutationOptions<
    CognitiveDepthLevel,
    Error,
    { slug: string; payload: DepthOverridePayload }
  >
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ slug, payload }) =>
      overrideCourseDepthLevel(courseId, slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cognitiveDepthKeys.course(courseId),
      });
      toast({
        title: 'Depth level updated',
        description: 'Course-specific settings have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to update depth level',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to reset course depth overrides
 */
export function useResetCourseDepthOverrides(
  courseId: string,
  options?: UseMutationOptions<void, Error, ResetOverridesPayload>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => resetCourseDepthOverrides(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cognitiveDepthKeys.course(courseId),
      });
      toast({
        title: 'Overrides reset',
        description: 'Course has been restored to department defaults.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to reset overrides',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}
