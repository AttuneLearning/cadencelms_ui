/**
 * React Query keys for Messages
 */

import type { MessageFilters } from './types';

export const messageKeys = {
  // All messages
  all: ['messages'] as const,

  // Lists
  lists: () => [...messageKeys.all, 'list'] as const,
  list: (filters?: MessageFilters) => [...messageKeys.lists(), filters] as const,

  // Details
  details: () => [...messageKeys.all, 'detail'] as const,
  detail: (id: string) => [...messageKeys.details(), id] as const,

  // Unread count
  unreadCount: () => [...messageKeys.all, 'unread-count'] as const,
};
