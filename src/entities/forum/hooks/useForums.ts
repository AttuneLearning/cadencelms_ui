/**
 * React Query hooks for Forum
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  createReply,
  updateReply,
  deleteReply,
} from '../api/forumApi';
import { forumKeys } from '../model/forumKeys';
import type {
  ThreadsListResponse,
  ThreadDetailResponse,
  CreateThreadPayload,
  UpdateThreadPayload,
  CreateReplyPayload,
  UpdateReplyPayload,
  ThreadFilters,
} from '../model/types';

// =====================
// QUERY HOOKS - THREADS
// =====================

/**
 * Hook to fetch list of threads
 */
export function useThreads(
  filters?: ThreadFilters,
  options?: Omit<
    UseQueryOptions<
      ThreadsListResponse,
      Error,
      ThreadsListResponse,
      ReturnType<typeof forumKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: forumKeys.list(filters),
    queryFn: () => listThreads(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch threads for a specific course
 */
export function useCourseThreads(
  courseId: string,
  filters?: ThreadFilters,
  options?: Omit<
    UseQueryOptions<
      ThreadsListResponse,
      Error,
      ThreadsListResponse,
      ReturnType<typeof forumKeys.courseThreads>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: forumKeys.courseThreads(courseId, filters),
    queryFn: () => listThreads({ ...filters, courseId }),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single thread with replies
 */
export function useThread(
  threadId: string,
  options?: Omit<
    UseQueryOptions<
      ThreadDetailResponse,
      Error,
      ThreadDetailResponse,
      ReturnType<typeof forumKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: forumKeys.detail(threadId),
    queryFn: () => getThread(threadId),
    enabled: !!threadId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// =====================
// MUTATION HOOKS - THREADS
// =====================

/**
 * Hook to create a new thread
 */
export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateThreadPayload) => createThread(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: forumKeys.courseThreads(variables.courseId) });
    },
  });
}

/**
 * Hook to update a thread
 */
export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateThreadPayload }) =>
      updateThread(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: forumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: forumKeys.courseThreads(data.courseId) });
    },
  });
}

/**
 * Hook to delete a thread
 */
export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.lists() });
      queryClient.invalidateQueries({ queryKey: forumKeys.all });
    },
  });
}

// =====================
// MUTATION HOOKS - REPLIES
// =====================

/**
 * Hook to create a new reply
 */
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReplyPayload) => createReply(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.detail(data.threadId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.lists() });
    },
  });
}

/**
 * Hook to update a reply
 */
export function useUpdateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReplyPayload }) =>
      updateReply(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.detail(data.threadId) });
    },
  });
}

/**
 * Hook to delete a reply
 */
export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; threadId: string }) => deleteReply(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: forumKeys.detail(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.lists() });
    },
  });
}
