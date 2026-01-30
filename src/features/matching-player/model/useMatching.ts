/**
 * Matching Exercise React Query Hooks
 * Provides hooks for matching sessions, submissions, and attempt history
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getSession,
  submitResult,
  getAttempts,
  getSessionById,
  getSessionResult,
  type MatchingSession,
  type MatchingResult,
  type MatchingAttemptsResponse,
  type SubmitMatchesPayload,
  type GetAttemptsParams,
} from '../api/matchingApi';

// ============================================================================
// Query Keys
// ============================================================================

export const matchingKeys = {
  all: ['matching'] as const,

  sessions: () => [...matchingKeys.all, 'session'] as const,
  session: (questionId: string, courseId: string) =>
    [...matchingKeys.sessions(), questionId, courseId] as const,
  sessionById: (sessionId: string) => [...matchingKeys.sessions(), 'id', sessionId] as const,

  results: () => [...matchingKeys.all, 'result'] as const,
  result: (sessionId: string) => [...matchingKeys.results(), sessionId] as const,

  attempts: () => [...matchingKeys.all, 'attempts'] as const,
  attemptsList: (params?: GetAttemptsParams) => [...matchingKeys.attempts(), params] as const,
};

// ============================================================================
// Session Hooks
// ============================================================================

/**
 * Hook to get a matching exercise session (creates new if needed)
 * GET /questions/:questionId/matching/session
 */
export function useMatchingSession(
  questionId: string,
  courseId: string,
  options?: Omit<
    UseQueryOptions<
      MatchingSession,
      Error,
      MatchingSession,
      ReturnType<typeof matchingKeys.session>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: matchingKeys.session(questionId, courseId),
    queryFn: () => getSession(questionId, courseId),
    staleTime: 0, // Always get fresh session
    enabled: !!questionId && !!courseId,
    ...options,
  });
}

/**
 * Hook to get a specific session by ID
 * GET /matching/session/:sessionId
 */
export function useMatchingSessionById(
  sessionId: string,
  options?: Omit<
    UseQueryOptions<
      MatchingSession,
      Error,
      MatchingSession,
      ReturnType<typeof matchingKeys.sessionById>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: matchingKeys.sessionById(sessionId),
    queryFn: () => getSessionById(sessionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!sessionId,
    ...options,
  });
}

// ============================================================================
// Submission Hooks
// ============================================================================

/**
 * Hook to submit matches and get results
 * POST /matching/session/:sessionId/submit
 */
export function useSubmitMatching(
  sessionId: string,
  options?: UseMutationOptions<MatchingResult, Error, SubmitMatchesPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => submitResult(sessionId, payload),
    onSuccess: (result) => {
      // Cache the result
      queryClient.setQueryData(matchingKeys.result(sessionId), result);

      // Mark session as submitted in cache
      queryClient.setQueryData(
        matchingKeys.sessionById(sessionId),
        (old: MatchingSession | undefined) => {
          if (!old) return old;
          return { ...old, submitted: true };
        }
      );

      // Invalidate attempts list to include new attempt
      queryClient.invalidateQueries({ queryKey: matchingKeys.attempts() });
    },
    ...options,
  });
}

/**
 * Hook to get result for a completed session
 * GET /matching/session/:sessionId/result
 */
export function useMatchingResult(
  sessionId: string,
  options?: Omit<
    UseQueryOptions<MatchingResult, Error, MatchingResult, ReturnType<typeof matchingKeys.result>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: matchingKeys.result(sessionId),
    queryFn: () => getSessionResult(sessionId),
    staleTime: Infinity, // Results don't change
    enabled: !!sessionId,
    ...options,
  });
}

// ============================================================================
// History Hooks
// ============================================================================

/**
 * Hook to get matching attempt history
 * GET /matching/attempts
 */
export function useMatchingAttempts(
  params?: GetAttemptsParams,
  options?: Omit<
    UseQueryOptions<
      MatchingAttemptsResponse,
      Error,
      MatchingAttemptsResponse,
      ReturnType<typeof matchingKeys.attemptsList>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: matchingKeys.attemptsList(params),
    queryFn: () => getAttempts(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}
