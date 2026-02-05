/**
 * Mock notification data for testing
 */

import type {
  Notification,
  NotificationListItem,
  NotificationSummary,
  NotificationTemplate,
  NotificationTemplateListItem,
} from '@/entities/notification';
import { getNotificationPriority } from '@/entities/notification';

// =====================
// MOCK NOTIFICATIONS
// =====================

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    learnerId: 'learner-1',
    type: 'course_version_available',
    title: 'New Course Version Available',
    message: 'A new version (v2) of "Introduction to Web Development" is now available with updated JavaScript content.',
    relatedCourseVersionId: 'course-1',
    relatedCertificateDefinitionId: null,
    relatedProgramEnrollmentId: null,
    relatedModuleId: null,
    actionUrl: '/courses/web101/versions',
    actionLabel: 'View Course',
    isRead: false,
    readAt: null,
    isDismissed: false,
    dismissedAt: null,
    sentAt: '2026-02-01T10:00:00Z',
    emailSentAt: '2026-02-01T10:01:00Z',
    pushSentAt: null,
    expiresAt: null,
  },
  {
    id: 'notif-2',
    learnerId: 'learner-1',
    type: 'access_expiring_soon',
    title: 'Access Expiring Soon',
    message: 'Your access to "Data Analytics Program" will expire in 7 days. Complete your courses or request an extension.',
    relatedCourseVersionId: null,
    relatedCertificateDefinitionId: null,
    relatedProgramEnrollmentId: 'prog-enroll-1',
    relatedModuleId: null,
    actionUrl: '/programs/data-analytics/access',
    actionLabel: 'Manage Access',
    isRead: false,
    readAt: null,
    isDismissed: false,
    dismissedAt: null,
    sentAt: '2026-02-03T08:00:00Z',
    emailSentAt: '2026-02-03T08:01:00Z',
    pushSentAt: '2026-02-03T08:01:00Z',
    expiresAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'notif-3',
    learnerId: 'learner-1',
    type: 'certificate_earned',
    title: 'Certificate Earned!',
    message: 'Congratulations! You have earned the "Certified Web Developer" certificate.',
    relatedCourseVersionId: null,
    relatedCertificateDefinitionId: 'cert-def-1',
    relatedProgramEnrollmentId: null,
    relatedModuleId: null,
    actionUrl: '/certificates/issuance-1',
    actionLabel: 'View Certificate',
    isRead: true,
    readAt: '2026-01-28T17:00:00Z',
    isDismissed: false,
    dismissedAt: null,
    sentAt: '2026-01-28T16:50:00Z',
    emailSentAt: '2026-01-28T16:51:00Z',
    pushSentAt: '2026-01-28T16:51:00Z',
    expiresAt: null,
  },
  {
    id: 'notif-4',
    learnerId: 'learner-1',
    type: 'certificate_upgrade_available',
    title: 'Certificate Upgrade Available',
    message: 'An upgrade is available for your "Certified Web Developer" certificate. Complete 1 additional course to upgrade.',
    relatedCourseVersionId: null,
    relatedCertificateDefinitionId: 'cert-def-1',
    relatedProgramEnrollmentId: null,
    relatedModuleId: null,
    actionUrl: '/certificates/upgrade/cert-def-1',
    actionLabel: 'View Upgrade Options',
    isRead: false,
    readAt: null,
    isDismissed: false,
    dismissedAt: null,
    sentAt: '2026-02-02T14:00:00Z',
    emailSentAt: '2026-02-02T14:01:00Z',
    pushSentAt: null,
    expiresAt: '2026-06-15T00:00:00Z',
  },
];

export const mockNotificationListItems: NotificationListItem[] = mockNotifications.map((n) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  actionUrl: n.actionUrl,
  actionLabel: n.actionLabel,
  isRead: n.isRead,
  sentAt: n.sentAt,
  priority: getNotificationPriority(n.type),
}));

export const mockNotificationSummary: NotificationSummary = {
  unreadCount: 3,
  urgentCount: 1,
  recentNotifications: mockNotificationListItems.slice(0, 5),
};

// =====================
// MOCK NOTIFICATION TEMPLATES
// =====================

export const mockNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'template-1',
    type: 'course_version_available',
    departmentId: null,
    titleTemplate: 'New Course Version Available',
    messageTemplate: 'A new version (v{{newVersion}}) of "{{courseTitle}}" is now available. {{changeNotes}}',
    emailSubjectTemplate: 'New version of {{courseTitle}} available',
    emailBodyTemplate: `
      <h2>New Course Version Available</h2>
      <p>Hi {{learnerName}},</p>
      <p>A new version (v{{newVersion}}) of "{{courseTitle}}" is now available.</p>
      <p><strong>What's new:</strong> {{changeNotes}}</p>
      <p><a href="{{actionUrl}}">View Course</a></p>
    `,
    sendInApp: true,
    sendEmail: true,
    sendPush: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'template-2',
    type: 'access_expiring_soon',
    departmentId: null,
    titleTemplate: 'Access Expiring Soon',
    messageTemplate: 'Your access to "{{programName}}" will expire in {{daysRemaining}} days.',
    emailSubjectTemplate: 'Your access to {{programName}} is expiring soon',
    emailBodyTemplate: `
      <h2>Access Expiring Soon</h2>
      <p>Hi {{learnerName}},</p>
      <p>Your access to "{{programName}}" will expire on {{expiryDate}}.</p>
      <p>Please complete your courses or <a href="{{extensionUrl}}">request an extension</a>.</p>
    `,
    sendInApp: true,
    sendEmail: true,
    sendPush: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'template-3',
    type: 'certificate_earned',
    departmentId: null,
    titleTemplate: 'Certificate Earned!',
    messageTemplate: 'Congratulations! You have earned the "{{certificateTitle}}" certificate.',
    emailSubjectTemplate: 'Congratulations on earning {{certificateTitle}}!',
    emailBodyTemplate: `
      <h2>Certificate Earned!</h2>
      <p>Hi {{learnerName}},</p>
      <p>Congratulations! You have successfully completed all requirements and earned:</p>
      <h3>{{certificateTitle}}</h3>
      <p>Verification Code: {{verificationCode}}</p>
      <p><a href="{{downloadUrl}}">Download Certificate</a></p>
    `,
    sendInApp: true,
    sendEmail: true,
    sendPush: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

export const mockNotificationTemplateListItems: NotificationTemplateListItem[] = [
  {
    id: 'template-1',
    type: 'course_version_available',
    department: null,
    titleTemplate: 'New Course Version Available',
    sendInApp: true,
    sendEmail: true,
    sendPush: false,
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'template-2',
    type: 'access_expiring_soon',
    department: null,
    titleTemplate: 'Access Expiring Soon',
    sendInApp: true,
    sendEmail: true,
    sendPush: true,
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'template-3',
    type: 'certificate_earned',
    department: null,
    titleTemplate: 'Certificate Earned!',
    sendInApp: true,
    sendEmail: true,
    sendPush: true,
    isActive: true,
    isSystemDefault: true,
  },
  {
    id: 'template-4',
    type: 'course_version_available',
    department: { id: 'dept-1', name: 'Computer Science' },
    titleTemplate: 'CS Department: New Course Version',
    sendInApp: true,
    sendEmail: true,
    sendPush: true,
    isActive: true,
    isSystemDefault: false,
  },
];

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockNotification = (
  overrides?: Partial<Notification>
): Notification => {
  const id = `notif-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    learnerId: 'learner-1',
    type: 'course_version_available',
    title: 'Test Notification',
    message: 'This is a test notification message',
    relatedCourseVersionId: null,
    relatedCertificateDefinitionId: null,
    relatedProgramEnrollmentId: null,
    relatedModuleId: null,
    actionUrl: null,
    actionLabel: null,
    isRead: false,
    readAt: null,
    isDismissed: false,
    dismissedAt: null,
    sentAt: new Date().toISOString(),
    emailSentAt: null,
    pushSentAt: null,
    expiresAt: null,
    ...overrides,
  };
};

export const createMockNotificationListItem = (
  overrides?: Partial<NotificationListItem>
): NotificationListItem => {
  const id = `notif-${Math.random().toString(36).substr(2, 9)}`;
  const type = overrides?.type || 'course_version_available';
  return {
    id,
    type,
    title: 'Test Notification',
    message: 'This is a test notification message',
    actionUrl: null,
    actionLabel: null,
    isRead: false,
    sentAt: new Date().toISOString(),
    priority: getNotificationPriority(type),
    ...overrides,
  };
};
