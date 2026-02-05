/**
 * Notification Entity Types
 * Types for versioning-related notifications
 * Based on: COURSE_VERSIONING_TYPES.md, LEARNER_ACCESS_AND_NOTIFICATIONS.md
 */

// =====================
// NOTIFICATION TYPES
// =====================

/**
 * Notification types for the versioning system
 */
export type NotificationType =
  | 'course_version_available'
  | 'certificate_version_available'
  | 'certificate_upgrade_available'
  | 'access_expiring_soon'
  | 'access_expired'
  | 'certificate_earned'
  | 'certificate_upgraded'
  | 'badge_earned'
  | 'module_edit_lock_requested'
  | 'module_edit_lock_released';

/**
 * Notification priority levels
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Get priority for notification type
 */
export function getNotificationPriority(type: NotificationType): NotificationPriority {
  switch (type) {
    case 'access_expired':
    case 'module_edit_lock_requested':
      return 'urgent';
    case 'access_expiring_soon':
    case 'certificate_upgrade_available':
      return 'high';
    case 'certificate_earned':
    case 'badge_earned':
    case 'certificate_upgraded':
      return 'medium';
    default:
      return 'low';
  }
}

/**
 * Get icon name for notification type (for use with lucide-react)
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'course_version_available':
      return 'BookOpen';
    case 'certificate_version_available':
    case 'certificate_upgrade_available':
      return 'Award';
    case 'access_expiring_soon':
    case 'access_expired':
      return 'Clock';
    case 'certificate_earned':
    case 'certificate_upgraded':
      return 'Trophy';
    case 'badge_earned':
      return 'Medal';
    case 'module_edit_lock_requested':
    case 'module_edit_lock_released':
      return 'Lock';
    default:
      return 'Bell';
  }
}

// =====================
// NOTIFICATION ENTITY
// =====================

/**
 * Notification entity
 */
export interface Notification {
  id: string;
  learnerId: string;
  type: NotificationType;

  // Content
  title: string;
  message: string;

  // Related entities
  relatedCourseVersionId: string | null;
  relatedCertificateDefinitionId: string | null;
  relatedProgramEnrollmentId: string | null;
  relatedModuleId: string | null;

  // Actions
  actionUrl: string | null;
  actionLabel: string | null;

  // State
  isRead: boolean;
  readAt: string | null;
  isDismissed: boolean;
  dismissedAt: string | null;

  // Delivery
  sentAt: string;
  emailSentAt: string | null;
  pushSentAt: string | null;

  // Expiry
  expiresAt: string | null;
}

/**
 * Notification list item
 */
export interface NotificationListItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  actionLabel: string | null;
  isRead: boolean;
  sentAt: string;
  priority: NotificationPriority;
}

/**
 * Notification summary for header bell
 */
export interface NotificationSummary {
  unreadCount: number;
  urgentCount: number;
  recentNotifications: NotificationListItem[];
}

// =====================
// NOTIFICATION TEMPLATES
// =====================

/**
 * Notification template for customization
 */
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  departmentId: string | null; // null = system default

  // Content templates (supports variables)
  titleTemplate: string;
  messageTemplate: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;

  // Channel settings
  sendInApp: boolean;
  sendEmail: boolean;
  sendPush: boolean;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Notification template list item
 */
export interface NotificationTemplateListItem {
  id: string;
  type: NotificationType;
  department: { id: string; name: string } | null;
  titleTemplate: string;
  sendInApp: boolean;
  sendEmail: boolean;
  sendPush: boolean;
  isActive: boolean;
  isSystemDefault: boolean;
}

/**
 * Available template variables per notification type
 */
export const NOTIFICATION_TEMPLATE_VARIABLES: Record<NotificationType, string[]> = {
  course_version_available: [
    '{{learnerName}}',
    '{{courseTitle}}',
    '{{courseCode}}',
    '{{newVersion}}',
    '{{previousVersion}}',
    '{{changeNotes}}',
  ],
  certificate_version_available: [
    '{{learnerName}}',
    '{{certificateTitle}}',
    '{{newVersion}}',
    '{{addedCourses}}',
    '{{upgradeDeadline}}',
  ],
  certificate_upgrade_available: [
    '{{learnerName}}',
    '{{currentCertificateTitle}}',
    '{{targetCertificateTitle}}',
    '{{additionalRequirements}}',
    '{{upgradeDeadline}}',
  ],
  access_expiring_soon: [
    '{{learnerName}}',
    '{{programName}}',
    '{{expiryDate}}',
    '{{daysRemaining}}',
    '{{extensionUrl}}',
  ],
  access_expired: [
    '{{learnerName}}',
    '{{programName}}',
    '{{expiredDate}}',
    '{{renewalUrl}}',
  ],
  certificate_earned: [
    '{{learnerName}}',
    '{{certificateTitle}}',
    '{{credentialName}}',
    '{{issuedDate}}',
    '{{verificationCode}}',
    '{{downloadUrl}}',
  ],
  certificate_upgraded: [
    '{{learnerName}}',
    '{{oldCertificateTitle}}',
    '{{newCertificateTitle}}',
    '{{upgradedDate}}',
    '{{verificationCode}}',
  ],
  badge_earned: [
    '{{learnerName}}',
    '{{badgeName}}',
    '{{credentialName}}',
    '{{earnedDate}}',
  ],
  module_edit_lock_requested: [
    '{{requesterName}}',
    '{{moduleTitle}}',
    '{{courseTitle}}',
    '{{requestedAt}}',
  ],
  module_edit_lock_released: [
    '{{releasedByName}}',
    '{{moduleTitle}}',
    '{{courseTitle}}',
  ],
};

// =====================
// API PAYLOADS
// =====================

/**
 * Mark notification as read
 */
export interface MarkNotificationReadPayload {
  notificationIds: string[];
}

/**
 * Dismiss notification
 */
export interface DismissNotificationPayload {
  notificationIds: string[];
}

/**
 * Update notification template
 */
export interface UpdateNotificationTemplatePayload {
  titleTemplate?: string;
  messageTemplate?: string;
  emailSubjectTemplate?: string;
  emailBodyTemplate?: string;
  sendInApp?: boolean;
  sendEmail?: boolean;
  sendPush?: boolean;
  isActive?: boolean;
}

/**
 * Create department notification template override
 */
export interface CreateNotificationTemplateOverridePayload {
  type: NotificationType;
  departmentId: string;
  titleTemplate: string;
  messageTemplate: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  sendInApp?: boolean;
  sendEmail?: boolean;
  sendPush?: boolean;
}

// =====================
// FILTERS
// =====================

/**
 * Notification filters
 */
export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  isDismissed?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Notification template filters
 */
export interface NotificationTemplateFilters {
  type?: NotificationType;
  departmentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// =====================
// API RESPONSES
// =====================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationsListResponse {
  notifications: NotificationListItem[];
  pagination: Pagination;
}

export interface NotificationTemplatesListResponse {
  templates: NotificationTemplateListItem[];
  pagination: Pagination;
}

export interface MarkReadResponse {
  markedCount: number;
  unreadCount: number;
}

// =====================
// EVENTS (for real-time updates)
// =====================

/**
 * Notification event for real-time updates
 */
export interface NotificationEvent {
  type: 'notification_created' | 'notification_read' | 'notification_dismissed';
  notification: NotificationListItem;
  unreadCount: number;
}
