/**
 * Learner Program Hooks
 * React Query hooks for learner program views
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  getMyPrograms,
  getProgramForLearner,
  type MyProgramsResponse,
  type LearnerProgramDetail,
} from '../api/learnerProgramApi';
import { programKeys } from '../model/programKeys';

/**
 * Hook to fetch learner's enrolled programs
 */
export function useMyPrograms(
  params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'completed' | 'withdrawn';
  },
  options?: Omit<
    UseQueryOptions<
      MyProgramsResponse,
      Error,
      MyProgramsResponse,
      ReturnType<typeof programKeys.myPrograms>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programKeys.myPrograms(params),
    queryFn: () => getMyPrograms(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - fresher for user's own data
    ...options,
  });
}

/**
 * Hook to fetch program detail for learner with progress
 */
export function useProgramForLearner(
  id: string,
  options?: Omit<
    UseQueryOptions<
      LearnerProgramDetail,
      Error,
      LearnerProgramDetail,
      ReturnType<typeof programKeys.learnerDetail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programKeys.learnerDetail(id),
    queryFn: () => getProgramForLearner(id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!id,
    ...options,
  });
}
