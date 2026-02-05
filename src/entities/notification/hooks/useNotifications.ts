/**
 * React Query hooks for Notifications
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listNotifications,
  getNotificationSummary,
  getNotification,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  dismissNotifications,
  deleteNotification,
  listNotificationTemplates,
  getNotificationTemplate,
  updateNotificationTemplate,
  createNotificationTemplateOverride,
  deleteNotificationTemplate,
  resetNotificationTemplate,
} from '../api/notificationApi';
import { notificationKeys, notificationTemplateKeys } from '../model/notificationKeys';
import type {
  Notification,
  NotificationSummary,
  NotificationsListResponse,
  NotificationFilters,
  MarkNotificationReadPayload,
  DismissNotificationPayload,
  NotificationTemplate,
  NotificationTemplatesListResponse,
  NotificationTemplateFilters,
  UpdateNotificationTemplatePayload,
  CreateNotificationTemplateOverridePayload,
} from '../model/types';

// =====================
// NOTIFICATION HOOKS
// =====================

/**
 * Hook to fetch notifications for current user
 */
export function useNotifications(
  filters?: NotificationFilters,
  options?: Omit<
    UseQueryOptions<
      NotificationsListResponse,
      Error,
      NotificationsListResponse,
      ReturnType<typeof notificationKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => listNotifications(filters),
    staleTime: 60 * 1000, // 1 minute - notifications should be fairly fresh
    ...options,
  });
}

/**
 * Hook to fetch notification summary (for header bell)
 */
export function useNotificationSummary(
  options?: Omit<
    UseQueryOptions<
      NotificationSummary,
      Error,
      NotificationSummary,
      ReturnType<typeof notificationKeys.summary>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: notificationKeys.summary(),
    queryFn: () => getNotificationSummary(),
    staleTime: 30 * 1000, // 30 seconds - summary should be very fresh
    refetchInterval: 60 * 1000, // Poll every minute
    ...options,
  });
}

/**
 * Hook to fetch single notification
 */
export function useNotification(
  id: string,
  options?: Omit<
    UseQueryOptions<
      Notification,
      Error,
      Notification,
      ReturnType<typeof notificationKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => getNotification(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to mark notifications as read
 */
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MarkNotificationReadPayload) => markNotificationsAsRead(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.summary() });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.summary() });
    },
  });
}

/**
 * Hook to dismiss notifications
 */
export function useDismissNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DismissNotificationPayload) => dismissNotifications(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.summary() });
    },
  });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.summary() });
    },
  });
}

// =====================
// NOTIFICATION TEMPLATE HOOKS (Admin)
// =====================

/**
 * Hook to fetch notification templates
 */
export function useNotificationTemplates(
  filters?: NotificationTemplateFilters,
  options?: Omit<
    UseQueryOptions<
      NotificationTemplatesListResponse,
      Error,
      NotificationTemplatesListResponse,
      ReturnType<typeof notificationTemplateKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: notificationTemplateKeys.list(filters),
    queryFn: () => listNotificationTemplates(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single notification template
 */
export function useNotificationTemplate(
  id: string,
  options?: Omit<
    UseQueryOptions<
      NotificationTemplate,
      Error,
      NotificationTemplate,
      ReturnType<typeof notificationTemplateKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: notificationTemplateKeys.detail(id),
    queryFn: () => getNotificationTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to update notification template
 */
export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateNotificationTemplatePayload;
    }) => updateNotificationTemplate(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: notificationTemplateKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to create department template override
 */
export function useCreateNotificationTemplateOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotificationTemplateOverridePayload) =>
      createNotificationTemplateOverride(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to delete notification template
 */
export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotificationTemplate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
    },
  });
}

/**
 * Hook to reset notification template to system default
 */
export function useResetNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resetNotificationTemplate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notificationTemplateKeys.lists() });
    },
  });
}
