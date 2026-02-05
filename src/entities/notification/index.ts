/**
 * Notification Entity
 * Public API for versioning-related notifications
 */

// Types
export type {
  // Notification Types
  NotificationType,
  NotificationPriority,
  // Notification Entity
  Notification,
  NotificationListItem,
  NotificationSummary,
  // Notification Templates
  NotificationTemplate,
  NotificationTemplateListItem,
  // API Payloads
  MarkNotificationReadPayload,
  DismissNotificationPayload,
  UpdateNotificationTemplatePayload,
  CreateNotificationTemplateOverridePayload,
  // Filters
  NotificationFilters,
  NotificationTemplateFilters,
  // API Responses
  Pagination,
  NotificationsListResponse,
  NotificationTemplatesListResponse,
  MarkReadResponse,
  // Events
  NotificationEvent,
} from './model/types';

// Functions
export {
  getNotificationPriority,
  getNotificationIcon,
  NOTIFICATION_TEMPLATE_VARIABLES,
} from './model/types';

// API
export {
  // Notifications
  listNotifications,
  getNotificationSummary,
  getNotification,
  markNotificationsAsRead,
  markAllNotificationsAsRead,
  dismissNotifications,
  deleteNotification,
  // Notification Templates
  listNotificationTemplates,
  getNotificationTemplate,
  updateNotificationTemplate,
  createNotificationTemplateOverride,
  deleteNotificationTemplate,
  resetNotificationTemplate,
} from './api/notificationApi';

// Query Keys
export { notificationKeys, notificationTemplateKeys } from './model/notificationKeys';

// Hooks
export {
  // Notification hooks
  useNotifications,
  useNotificationSummary,
  useNotification,
  useMarkNotificationsAsRead,
  useMarkAllNotificationsAsRead,
  useDismissNotifications,
  useDeleteNotification,
  // Notification Template hooks
  useNotificationTemplates,
  useNotificationTemplate,
  useUpdateNotificationTemplate,
  useCreateNotificationTemplateOverride,
  useDeleteNotificationTemplate,
  useResetNotificationTemplate,
} from './hooks/useNotifications';
