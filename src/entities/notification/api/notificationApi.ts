/**
 * Notification API Client
 * Implements notification endpoints
 *
 * Endpoint base: /api/v2/notifications, /api/v2/notification-templates
 */

import { client } from '@/shared/api/client';
import type {
  Notification,
  NotificationSummary,
  NotificationsListResponse,
  NotificationFilters,
  MarkNotificationReadPayload,
  DismissNotificationPayload,
  MarkReadResponse,
  NotificationTemplate,
  NotificationTemplatesListResponse,
  NotificationTemplateFilters,
  UpdateNotificationTemplatePayload,
  CreateNotificationTemplateOverridePayload,
} from '../model/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// =====================
// NOTIFICATIONS
// =====================

/**
 * GET /api/v2/notifications - List notifications for current user
 */
export async function listNotifications(
  filters?: NotificationFilters
): Promise<NotificationsListResponse> {
  const response = await client.get<ApiResponse<NotificationsListResponse>>(
    '/api/v2/notifications',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/notifications/summary - Get notification summary for header
 */
export async function getNotificationSummary(): Promise<NotificationSummary> {
  const response = await client.get<ApiResponse<NotificationSummary>>(
    '/api/v2/notifications/summary'
  );
  return response.data.data;
}

/**
 * GET /api/v2/notifications/:id - Get single notification
 */
export async function getNotification(id: string): Promise<Notification> {
  const response = await client.get<ApiResponse<Notification>>(
    `/api/v2/notifications/${id}`
  );
  return response.data.data;
}

/**
 * POST /api/v2/notifications/mark-read - Mark notifications as read
 */
export async function markNotificationsAsRead(
  payload: MarkNotificationReadPayload
): Promise<MarkReadResponse> {
  const response = await client.post<ApiResponse<MarkReadResponse>>(
    '/api/v2/notifications/mark-read',
    payload
  );
  return response.data.data;
}

/**
 * POST /api/v2/notifications/mark-all-read - Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<MarkReadResponse> {
  const response = await client.post<ApiResponse<MarkReadResponse>>(
    '/api/v2/notifications/mark-all-read'
  );
  return response.data.data;
}

/**
 * POST /api/v2/notifications/dismiss - Dismiss notifications
 */
export async function dismissNotifications(
  payload: DismissNotificationPayload
): Promise<{ dismissedCount: number }> {
  const response = await client.post<ApiResponse<{ dismissedCount: number }>>(
    '/api/v2/notifications/dismiss',
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/notifications/:id - Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  await client.delete(`/api/v2/notifications/${id}`);
}

// =====================
// NOTIFICATION TEMPLATES (Admin)
// =====================

/**
 * GET /api/v2/notification-templates - List notification templates
 */
export async function listNotificationTemplates(
  filters?: NotificationTemplateFilters
): Promise<NotificationTemplatesListResponse> {
  const response = await client.get<ApiResponse<NotificationTemplatesListResponse>>(
    '/api/v2/notification-templates',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/notification-templates/:id - Get notification template
 */
export async function getNotificationTemplate(id: string): Promise<NotificationTemplate> {
  const response = await client.get<ApiResponse<NotificationTemplate>>(
    `/api/v2/notification-templates/${id}`
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/notification-templates/:id - Update notification template
 */
export async function updateNotificationTemplate(
  id: string,
  payload: UpdateNotificationTemplatePayload
): Promise<NotificationTemplate> {
  const response = await client.patch<ApiResponse<NotificationTemplate>>(
    `/api/v2/notification-templates/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * POST /api/v2/notification-templates - Create department template override
 */
export async function createNotificationTemplateOverride(
  payload: CreateNotificationTemplateOverridePayload
): Promise<NotificationTemplate> {
  const response = await client.post<ApiResponse<NotificationTemplate>>(
    '/api/v2/notification-templates',
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/notification-templates/:id - Delete department template override
 */
export async function deleteNotificationTemplate(id: string): Promise<void> {
  await client.delete(`/api/v2/notification-templates/${id}`);
}

/**
 * POST /api/v2/notification-templates/:id/reset - Reset template to system default
 */
export async function resetNotificationTemplate(id: string): Promise<NotificationTemplate> {
  const response = await client.post<ApiResponse<NotificationTemplate>>(
    `/api/v2/notification-templates/${id}/reset`
  );
  return response.data.data;
}
