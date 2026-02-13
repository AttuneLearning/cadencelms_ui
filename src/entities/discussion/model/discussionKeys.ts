/**
 * React Query keys for Discussion entity
 */

import type { ListThreadsParams, SearchThreadsParams } from './types';

export const discussionKeys = {
  // Root key for all discussion data
  all: ['discussions'] as const,

  // Thread lists
  threads: () => [...discussionKeys.all, 'threads'] as const,
  threadList: (courseId: string, params?: ListThreadsParams) =>
    [...discussionKeys.threads(), courseId, params] as const,

  // Thread details
  threadDetails: () => [...discussionKeys.all, 'thread-detail'] as const,
  threadDetail: (threadId: string) => [...discussionKeys.threadDetails(), threadId] as const,

  // Thread search
  threadSearch: (courseId: string, params: SearchThreadsParams) =>
    [...discussionKeys.all, 'search', courseId, params] as const,

  // Replies
  replies: (threadId: string, params?: { page?: number; limit?: number }) =>
    [...discussionKeys.all, 'replies', threadId, params] as const,

  // Reply detail
  replyDetail: (replyId: string) => [...discussionKeys.all, 'reply-detail', replyId] as const,
};
