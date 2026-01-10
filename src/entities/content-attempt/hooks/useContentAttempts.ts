/**
 * React Query hooks for Content Attempts
 * Includes debounced auto-save functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import { contentAttemptApi } from '../api/contentAttemptApi';
import type {
  ListAttemptsParams,
  CreateAttemptRequest,
  UpdateAttemptRequest,
  CompleteAttemptRequest,
  UpdateCmiDataRequest,
  SuspendAttemptRequest,
} from '../model/types';

/**
 * Query keys for content attempts
 */
export const CONTENT_ATTEMPT_KEYS = {
  all: ['content-attempts'] as const,
  lists: () => [...CONTENT_ATTEMPT_KEYS.all, 'list'] as const,
  list: (params?: ListAttemptsParams) =>
    [...CONTENT_ATTEMPT_KEYS.lists(), params] as const,
  details: () => [...CONTENT_ATTEMPT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CONTENT_ATTEMPT_KEYS.details(), id] as const,
  cmi: (id: string) => [...CONTENT_ATTEMPT_KEYS.all, 'cmi', id] as const,
};

/**
 * Hook to fetch list of content attempts
 */
export function useContentAttempts(params?: ListAttemptsParams) {
  return useQuery({
    queryKey: CONTENT_ATTEMPT_KEYS.list(params),
    queryFn: () => contentAttemptApi.listAttempts(params),
  });
}

/**
 * Hook to fetch single content attempt by ID
 */
export function useContentAttempt(id: string, includeCmi = false) {
  return useQuery({
    queryKey: CONTENT_ATTEMPT_KEYS.detail(id),
    queryFn: () => contentAttemptApi.getAttemptById(id, includeCmi),
    enabled: !!id,
  });
}

/**
 * Hook to fetch SCORM CMI data
 */
export function useContentAttemptCmi(id: string) {
  return useQuery({
    queryKey: CONTENT_ATTEMPT_KEYS.cmi(id),
    queryFn: () => contentAttemptApi.getCmiData(id),
    enabled: !!id,
  });
}

/**
 * Hook to start a new content attempt
 */
export function useStartContentAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttemptRequest) => contentAttemptApi.createAttempt(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_ATTEMPT_KEYS.lists() });
      if (variables.contentId) {
        queryClient.invalidateQueries({
          queryKey: CONTENT_ATTEMPT_KEYS.list({ contentId: variables.contentId }),
        });
      }
      if (variables.enrollmentId) {
        queryClient.invalidateQueries({
          queryKey: CONTENT_ATTEMPT_KEYS.list({ enrollmentId: variables.enrollmentId }),
        });
      }
    },
  });
}

/**
 * Hook to update content attempt with debouncing
 * Debounces updates to avoid excessive API calls during progress tracking
 */
export function useUpdateContentAttempt(debounceMs = 30000) {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: UpdateAttemptRequest;
    }) => contentAttemptApi.updateAttempt(attemptId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.detail(variables.attemptId),
      });
      queryClient.invalidateQueries({ queryKey: CONTENT_ATTEMPT_KEYS.lists() });
    },
  });

  const debouncedMutate = useCallback(
    (attemptId: string, data: UpdateAttemptRequest) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        mutation.mutate({ attemptId, data });
      }, debounceMs);
    },
    [mutation, debounceMs]
  );

  return {
    ...mutation,
    debouncedMutate,
  };
}

/**
 * Hook to complete a content attempt
 */
export function useCompleteContentAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: CompleteAttemptRequest;
    }) => contentAttemptApi.completeAttempt(attemptId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.detail(variables.attemptId),
      });
      queryClient.invalidateQueries({ queryKey: CONTENT_ATTEMPT_KEYS.lists() });
    },
  });
}

/**
 * Hook to save SCORM CMI data
 */
export function useSaveScormData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: UpdateCmiDataRequest;
    }) => contentAttemptApi.updateCmiData(attemptId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.cmi(variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.detail(variables.attemptId),
      });
    },
  });
}

/**
 * Hook to save video progress
 * Includes debouncing for smooth video tracking
 */
export function useSaveVideoProgress(debounceMs = 5000) {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      attemptId,
      currentTime,
      progressPercent,
    }: {
      attemptId: string;
      currentTime: number;
      progressPercent: number;
    }) =>
      contentAttemptApi.updateAttempt(attemptId, {
        location: String(currentTime),
        progressPercent,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.detail(variables.attemptId),
      });
    },
  });

  const debouncedSave = useCallback(
    (attemptId: string, currentTime: number, progressPercent: number) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        mutation.mutate({ attemptId, currentTime, progressPercent });
      }, debounceMs);
    },
    [mutation, debounceMs]
  );

  return {
    ...mutation,
    debouncedSave,
  };
}

/**
 * Hook to suspend an attempt
 */
export function useSuspendAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: SuspendAttemptRequest;
    }) => contentAttemptApi.suspendAttempt(attemptId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.detail(variables.attemptId),
      });
      queryClient.invalidateQueries({ queryKey: CONTENT_ATTEMPT_KEYS.lists() });
    },
  });
}

/**
 * Hook to resume a suspended attempt
 */
export function useResumeAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attemptId: string) => contentAttemptApi.resumeAttempt(attemptId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: CONTENT_ATTEMPT_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.cmi(data.id),
      });
    },
  });
}

/**
 * Hook to delete an attempt (admin only)
 */
export function useDeleteContentAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, permanent }: { attemptId: string; permanent?: boolean }) =>
      contentAttemptApi.deleteAttempt(attemptId, permanent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_ATTEMPT_KEYS.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: CONTENT_ATTEMPT_KEYS.lists() });
    },
  });
}
