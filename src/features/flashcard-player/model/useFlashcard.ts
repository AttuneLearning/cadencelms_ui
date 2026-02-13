/**
 * Flashcard React Query Hooks
 * Canonical hooks for flashcard, retention-check, and remediation flows.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getConfig,
  updateConfig,
  getSession,
  recordResult,
  getProgress,
  resetProgress,
  getPendingRetentionChecks,
  getRetentionCheck,
  submitRetentionCheck,
  getRetentionCheckHistory,
  getActiveRemediations,
  type FlashcardConfig,
  type UpdateFlashcardConfigPayload,
  type FlashcardSession,
  type FlashcardResult,
  type RecordResultResponse,
  type FlashcardProgress,
  type GetSessionParams,
  type ResetProgressParams,
  type PendingRetentionChecksResponse,
  type RetentionCheckDetail,
  type SubmitRetentionCheckRequest,
  type SubmitRetentionCheckResponse,
  type RetentionCheckHistoryResponse,
  type GetRetentionHistoryParams,
  type ActiveRemediationsResponse,
} from '../api/flashcardApi';

export const flashcardKeys = {
  all: ['flashcards'] as const,

  configs: () => [...flashcardKeys.all, 'config'] as const,
  config: (courseId: string) => [...flashcardKeys.configs(), courseId] as const,

  sessions: () => [...flashcardKeys.all, 'session'] as const,
  session: (courseId: string, params?: GetSessionParams) =>
    [...flashcardKeys.sessions(), courseId, params] as const,

  progress: () => [...flashcardKeys.all, 'progress'] as const,
  progressByCourse: (courseId: string, moduleId?: string) =>
    [...flashcardKeys.progress(), courseId, moduleId] as const,

  retention: () => [...flashcardKeys.all, 'retention'] as const,
  retentionPending: (courseId: string) => [...flashcardKeys.retention(), 'pending', courseId] as const,
  retentionCheck: (courseId: string, checkId: string) =>
    [...flashcardKeys.retention(), 'check', courseId, checkId] as const,
  retentionHistory: (courseId: string, params?: GetRetentionHistoryParams) =>
    [...flashcardKeys.retention(), 'history', courseId, params] as const,

  remediations: () => [...flashcardKeys.all, 'remediations'] as const,
  remediationsActive: (courseId: string) =>
    [...flashcardKeys.remediations(), 'active', courseId] as const,
};

/**
 * GET /courses/:courseId/flashcard-config
 */
export function useFlashcardConfig(
  courseId: string,
  options?: Omit<
    UseQueryOptions<FlashcardConfig, Error, FlashcardConfig, ReturnType<typeof flashcardKeys.config>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardKeys.config(courseId),
    queryFn: () => getConfig(courseId),
    staleTime: 5 * 60 * 1000,
    enabled: !!courseId,
    ...options,
  });
}

/**
 * PUT /courses/:courseId/flashcard-config
 */
export function useUpdateFlashcardConfig(
  courseId: string,
  options?: UseMutationOptions<FlashcardConfig, Error, UpdateFlashcardConfigPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateConfig(courseId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(flashcardKeys.config(courseId), data);
    },
    ...options,
  });
}

/**
 * GET /courses/:courseId/flashcard-session
 */
export function useFlashcardSession(
  courseId: string,
  params?: GetSessionParams,
  options?: Omit<
    UseQueryOptions<
      FlashcardSession,
      Error,
      FlashcardSession,
      ReturnType<typeof flashcardKeys.session>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardKeys.session(courseId, params),
    queryFn: () => getSession(courseId, params),
    staleTime: 0,
    enabled: !!courseId,
    ...options,
  });
}

/**
 * POST /courses/:courseId/flashcard-result
 */
export function useRecordFlashcardResult(
  courseId: string,
  options?: UseMutationOptions<RecordResultResponse, Error, FlashcardResult>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (result) => recordResult(courseId, result),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: [...flashcardKeys.progress(), courseId] });
    },
    ...options,
  });
}

/**
 * GET /courses/:courseId/flashcard-progress
 */
export function useFlashcardProgress(
  courseId: string,
  moduleId?: string,
  options?: Omit<
    UseQueryOptions<
      FlashcardProgress,
      Error,
      FlashcardProgress,
      ReturnType<typeof flashcardKeys.progressByCourse>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardKeys.progressByCourse(courseId, moduleId),
    queryFn: () => getProgress(courseId, moduleId),
    staleTime: 2 * 60 * 1000,
    enabled: !!courseId,
    ...options,
  });
}

/**
 * DELETE /courses/:courseId/flashcard-progress
 */
export function useResetFlashcardProgress(
  courseId: string,
  options?: UseMutationOptions<{ cardsReset: number }, Error, ResetProgressParams | undefined>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => resetProgress(courseId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...flashcardKeys.progress(), courseId] });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.retention() });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.remediations() });
    },
    ...options,
  });
}

/**
 * GET /courses/:courseId/retention-checks/pending
 */
export function usePendingRetentionChecks(
  courseId: string,
  options?: Omit<
    UseQueryOptions<
      PendingRetentionChecksResponse,
      Error,
      PendingRetentionChecksResponse,
      ReturnType<typeof flashcardKeys.retentionPending>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardKeys.retentionPending(courseId),
    queryFn: () => getPendingRetentionChecks(courseId),
    enabled: !!courseId,
    ...options,
  });
}

/**
 * GET /courses/:courseId/retention-checks/:checkId
 */
export function useRetentionCheck(
  courseId: string,
  checkId: string,
  options?: Omit<
    UseQueryOptions<RetentionCheckDetail, Error, RetentionCheckDetail, ReturnType<typeof flashcardKeys.retentionCheck>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardKeys.retentionCheck(courseId, checkId),
    queryFn: () => getRetentionCheck(courseId, checkId),
    enabled: !!courseId && !!checkId,
    ...options,
  });
}

/**
 * POST /courses/:courseId/retention-checks/:checkId/submit
 */
export function useSubmitRetentionCheck(
  courseId: string,
  checkId: string,
  options?: UseMutationOptions<SubmitRetentionCheckResponse, Error, SubmitRetentionCheckRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => submitRetentionCheck(courseId, checkId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.retentionPending(courseId) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.retentionHistory(courseId) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.remediationsActive(courseId) });
      queryClient.invalidateQueries({ queryKey: [...flashcardKeys.progress(), courseId] });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.sessions() });
    },
    ...options,
  });
}

/**
 * GET /courses/:courseId/retention-checks/history
 */
export function useRetentionCheckHistory(
  courseId: string,
  params?: GetRetentionHistoryParams,
  options?: Omit<
    UseQueryOptions<
      RetentionCheckHistoryResponse,
      Error,
      RetentionCheckHistoryResponse,
      ReturnType<typeof flashcardKeys.retentionHistory>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardKeys.retentionHistory(courseId, params),
    queryFn: () => getRetentionCheckHistory(courseId, params),
    enabled: !!courseId,
    ...options,
  });
}

/**
 * GET /courses/:courseId/remediations/active
 */
export function useActiveRemediations(
  courseId: string,
  options?: Omit<
    UseQueryOptions<
      ActiveRemediationsResponse,
      Error,
      ActiveRemediationsResponse,
      ReturnType<typeof flashcardKeys.remediationsActive>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: flashcardKeys.remediationsActive(courseId),
    queryFn: () => getActiveRemediations(courseId),
    enabled: !!courseId,
    ...options,
  });
}
