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

// API (to be implemented)
// export * from './api/notificationApi';

// Hooks (to be implemented)
// export * from './hooks';

// UI Components (to be implemented)
// export * from './ui';
