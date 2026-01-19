/**
 * Settings Entity Types
 * Types for system settings management
 */

/**
 * Setting category types
 */
export type SettingCategory =
  | 'general'
  | 'email'
  | 'notification'
  | 'security'
  | 'appearance';

/**
 * Setting value types
 */
export type SettingValue = string | number | boolean | string[] | null;

/**
 * Base Setting
 */
export interface Setting {
  id: string;
  key: string;
  value: SettingValue;
  category: SettingCategory;
  description: string | null;
  isPublic: boolean;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
  } | null;
}

/**
 * General Settings
 */
export interface GeneralSettings {
  systemName: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  maxFileSize: number; // in MB
  allowedFileTypes: string[];
}

/**
 * Email Settings
 */
export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUsername: string;
  smtpPassword: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
}

/**
 * Notification Settings
 */
export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  enrollmentNotifications: boolean;
  completionNotifications: boolean;
  gradingNotifications: boolean;
  deadlineNotifications: boolean;
  digestFrequency: 'immediate' | 'daily' | 'weekly';
}

/**
 * Security Settings
 */
export interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeout: number; // in minutes
  maxLoginAttempts: number;
  twoFactorEnabled: boolean;
  ipWhitelist: string[];
}

/**
 * Appearance Settings
 */
export interface AppearanceSettings {
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  customCss: string | null;
}

/**
 * Settings by Category
 */
export type CategorySettings<T extends SettingCategory> = T extends 'general'
  ? GeneralSettings
  : T extends 'email'
  ? EmailSettings
  : T extends 'notification'
  ? NotificationSettings
  : T extends 'security'
  ? SecuritySettings
  : T extends 'appearance'
  ? AppearanceSettings
  : never;

/**
 * Update Settings Payload
 */
export type UpdateSettingsPayload<T extends SettingCategory> =
  Partial<CategorySettings<T>>;

/**
 * Settings Change Log Entry
 */
export interface SettingsChangeLog {
  id: string;
  category: SettingCategory;
  key: string;
  oldValue: SettingValue;
  newValue: SettingValue;
  changedBy: {
    id: string;
    name: string;
  };
  changedAt: string;
}

/**
 * Settings Dashboard Summary
 */
export interface SettingsDashboard {
  lastModified: {
    general: string | null;
    email: string | null;
    notification: string | null;
    security: string | null;
    appearance: string | null;
  };
  recentChanges: SettingsChangeLog[];
  systemHealth: {
    status: 'healthy' | 'warning' | 'error' | 'unknown';
    emailConfigured: boolean;
    securityConfigured: boolean;
    issues: string[];
  };
}

/**
 * Test Email Request
 */
export interface TestEmailRequest {
  recipientEmail: string;
}

/**
 * Test Email Response
 */
export interface TestEmailResponse {
  success: boolean;
  message: string;
  error?: string;
}
