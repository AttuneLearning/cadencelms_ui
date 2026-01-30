/**
 * Flashcard React Query Hooks
 * Provides hooks for flashcard configuration, sessions, and progress
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
  completeSession,
  type FlashcardConfig,
  type UpdateFlashcardConfigPayload,
  type FlashcardSession,
  type FlashcardResult,
  type RecordResultResponse,
  type FlashcardProgress,
  type GetSessionParams,
} from '../api/flashcardApi';

// ============================================================================
// Query Keys
// ============================================================================

export const flashcardKeys = {
  all: ['flashcards'] as const,

  configs: () => [...flashcardKeys.all, 'config'] as const,
  config: (courseId: string) => [...flashcardKeys.configs(), courseId] as const,

  sessions: () => [...flashcardKeys.all, 'session'] as const,
  session: (courseId: string, params?: GetSessionParams) =>
    [...flashcardKeys.sessions(), courseId, params] as const,

  progress: () => [...flashcardKeys.all, 'progress'] as const,
  progressByCourse: (courseId: string) => [...flashcardKeys.progress(), courseId] as const,
};

// ============================================================================
// Configuration Hooks
// ============================================================================

/**
 * Hook to fetch flashcard configuration for a course
 * GET /courses/:courseId/flashcards/config
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!courseId,
    ...options,
  });
}

/**
 * Hook to update flashcard configuration
 * PUT /courses/:courseId/flashcards/config
 */
export function useUpdateFlashcardConfig(
  courseId: string,
  options?: UseMutationOptions<FlashcardConfig, Error, UpdateFlashcardConfigPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateConfig(courseId, payload),
    onSuccess: (data) => {
      // Update cached config
      queryClient.setQueryData(flashcardKeys.config(courseId), data);
    },
    ...options,
  });
}

// ============================================================================
// Session Hooks
// ============================================================================

/**
 * Hook to get or start a flashcard session
 * GET /courses/:courseId/flashcards/session
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
    staleTime: 0, // Always fresh - sessions are dynamic
    enabled: !!courseId,
    ...options,
  });
}

/**
 * Hook to record a flashcard result
 * POST /courses/:courseId/flashcards/session/:sessionId/result
 */
export function useRecordFlashcardResult(
  courseId: string,
  sessionId: string,
  options?: UseMutationOptions<RecordResultResponse, Error, FlashcardResult>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (result) => recordResult(courseId, sessionId, result),
    onSuccess: (response) => {
      // Update session in cache with new progress
      queryClient.setQueryData(
        flashcardKeys.session(courseId),
        (old: FlashcardSession | undefined) => {
          if (!old) return old;
          return {
            ...old,
            completedCards: response.sessionProgress.completedCards,
            currentIndex: Math.min(old.currentIndex + 1, old.totalCards),
          };
        }
      );

      // Invalidate progress when session completes
      if (response.sessionProgress.isComplete) {
        queryClient.invalidateQueries({ queryKey: flashcardKeys.progressByCourse(courseId) });
      }
    },
    ...options,
  });
}

/**
 * Hook to complete a flashcard session
 * POST /courses/:courseId/flashcards/session/:sessionId/complete
 */
export function useCompleteFlashcardSession(
  courseId: string,
  options?: UseMutationOptions<
    { completedAt: string; summary: { cardsReviewed: number; averageRating: number } },
    Error,
    string
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId) => completeSession(courseId, sessionId),
    onSuccess: () => {
      // Invalidate session and progress caches
      queryClient.invalidateQueries({ queryKey: flashcardKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.progressByCourse(courseId) });
    },
    ...options,
  });
}

// ============================================================================
// Progress Hooks
// ============================================================================

/**
 * Hook to fetch flashcard progress statistics
 * GET /courses/:courseId/flashcards/progress
 */
export function useFlashcardProgress(
  courseId: string,
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
    queryKey: flashcardKeys.progressByCourse(courseId),
    queryFn: () => getProgress(courseId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!courseId,
    ...options,
  });
}

/**
 * Hook to reset flashcard progress
 * DELETE /courses/:courseId/flashcards/progress
 */
export function useResetFlashcardProgress(
  courseId: string,
  options?: UseMutationOptions<void, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetProgress(courseId),
    onSuccess: () => {
      // Invalidate progress cache
      queryClient.invalidateQueries({ queryKey: flashcardKeys.progressByCourse(courseId) });
      // Also invalidate sessions since they depend on progress
      queryClient.invalidateQueries({ queryKey: flashcardKeys.sessions() });
    },
    ...options,
  });
}
