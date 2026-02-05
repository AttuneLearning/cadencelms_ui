/**
 * React Query keys for Notifications
 */

import type { NotificationFilters, NotificationTemplateFilters } from './types';

export const notificationKeys = {
  // All notification queries
  all: ['notifications'] as const,

  // Lists
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) =>
    [...notificationKeys.lists(), filters] as const,

  // Summary (for header bell)
  summary: () => [...notificationKeys.all, 'summary'] as const,

  // Details
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
};

export const notificationTemplateKeys = {
  // All template queries
  all: ['notification-templates'] as const,

  // Lists
  lists: () => [...notificationTemplateKeys.all, 'list'] as const,
  list: (filters?: NotificationTemplateFilters) =>
    [...notificationTemplateKeys.lists(), filters] as const,

  // Details
  details: () => [...notificationTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationTemplateKeys.details(), id] as const,
};
