/**
 * React Query hooks for Discussion entity
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listThreads,
  createThread,
  searchThreads,
  getThread,
  updateThread,
  deleteThread,
  pinThread,
  lockThread,
  listReplies,
  createReply,
  updateReply,
  deleteReply,
  markAsAnswer,
} from '../api/discussionApi';
import { discussionKeys } from '../model/discussionKeys';
import type {
  DiscussionThread,
  ListThreadsResponse,
  ListRepliesResponse,
  ListThreadsParams,
  SearchThreadsParams,
  CreateThreadPayload,
  UpdateThreadPayload,
  CreateReplyPayload,
  UpdateReplyPayload,
  PinThreadPayload,
  LockThreadPayload,
  MarkAnswerPayload,
} from '../model/types';

// =====================
// QUERY HOOKS - THREADS
// =====================

/**
 * Hook to fetch threads for a course
 */
export function useThreads(
  courseId: string,
  params?: ListThreadsParams,
  options?: Omit<
    UseQueryOptions<
      ListThreadsResponse,
      Error,
      ListThreadsResponse,
      ReturnType<typeof discussionKeys.threadList>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: discussionKeys.threadList(courseId, params),
    queryFn: () => listThreads(courseId, params),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch a single thread by ID
 */
export function useThread(
  threadId: string,
  options?: Omit<
    UseQueryOptions<
      DiscussionThread,
      Error,
      DiscussionThread,
      ReturnType<typeof discussionKeys.threadDetail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: discussionKeys.threadDetail(threadId),
    queryFn: () => getThread(threadId),
    enabled: !!threadId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to search threads within a course
 */
export function useSearchThreads(
  courseId: string,
  params: SearchThreadsParams,
  options?: Omit<
    UseQueryOptions<
      ListThreadsResponse,
      Error,
      ListThreadsResponse,
      ReturnType<typeof discussionKeys.threadSearch>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: discussionKeys.threadSearch(courseId, params),
    queryFn: () => searchThreads(courseId, params),
    enabled: !!courseId && !!params.q,
    staleTime: 30 * 1000, // 30 seconds - search results go stale faster
    ...options,
  });
}

// =====================
// QUERY HOOKS - REPLIES
// =====================

/**
 * Hook to fetch replies for a thread
 */
export function useReplies(
  threadId: string,
  params?: { page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<
      ListRepliesResponse,
      Error,
      ListRepliesResponse,
      ReturnType<typeof discussionKeys.replies>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: discussionKeys.replies(threadId, params),
    queryFn: () => listReplies(threadId, params),
    enabled: !!threadId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

// =====================
// MUTATION HOOKS - THREADS
// =====================

/**
 * Hook to create a new thread in a course
 */
export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: CreateThreadPayload }) =>
      createThread(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadList(variables.courseId) });
    },
  });
}

/**
 * Hook to update a thread
 */
export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, data }: { threadId: string; data: UpdateThreadPayload }) =>
      updateThread(threadId, data),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(thread._id) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadList(thread.courseId) });
    },
  });
}

/**
 * Hook to delete a thread
 */
export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { threadId: string; courseId: string }) =>
      deleteThread(variables.threadId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(variables.threadId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadList(variables.courseId) });
    },
  });
}

/**
 * Hook to pin/unpin a thread
 */
export function usePinThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, data }: { threadId: string; data: PinThreadPayload }) =>
      pinThread(threadId, data),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(thread._id) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadList(thread.courseId) });
    },
  });
}

/**
 * Hook to lock/unlock a thread
 */
export function useLockThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, data }: { threadId: string; data: LockThreadPayload }) =>
      lockThread(threadId, data),
    onSuccess: (thread) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(thread._id) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadList(thread.courseId) });
    },
  });
}

// =====================
// MUTATION HOOKS - REPLIES
// =====================

/**
 * Hook to create a reply on a thread
 */
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, data }: { threadId: string; data: CreateReplyPayload }) =>
      createReply(threadId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.replies(variables.threadId) });
      queryClient.invalidateQueries({
        queryKey: discussionKeys.threadDetail(variables.threadId),
      });
      // Also invalidate thread lists since replyCount / lastReplyAt changes
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
    },
  });
}

/**
 * Hook to update a reply
 */
export function useUpdateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, data }: { replyId: string; data: UpdateReplyPayload }) =>
      updateReply(replyId, data),
    onSuccess: (reply) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.replies(reply.threadId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.replyDetail(reply._id) });
    },
  });
}

/**
 * Hook to delete a reply
 */
export function useDeleteReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { replyId: string; threadId: string }) =>
      deleteReply(variables.replyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.replies(variables.threadId) });
      queryClient.invalidateQueries({
        queryKey: discussionKeys.threadDetail(variables.threadId),
      });
      // Also invalidate thread lists since replyCount changes
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
    },
  });
}

/**
 * Hook to mark/unmark a reply as instructor answer
 */
export function useMarkAsAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, data }: { replyId: string; data: MarkAnswerPayload }) =>
      markAsAnswer(replyId, data),
    onSuccess: (reply) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.replies(reply.threadId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.replyDetail(reply._id) });
    },
  });
}
