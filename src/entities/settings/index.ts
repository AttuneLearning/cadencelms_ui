/**
 * Settings Entity - Public API
 */

// Types
export type {
  Setting,
  SettingCategory,
  SettingValue,
  GeneralSettings,
  EmailSettings,
  NotificationSettings,
  SecuritySettings,
  AppearanceSettings,
  CategorySettings,
  UpdateSettingsPayload,
  SettingsChangeLog,
  SettingsDashboard,
  TestEmailRequest,
  TestEmailResponse,
} from './model/types';

// Hooks
export {
  useSettingsDashboard,
  useSettingsByCategory,
  useUpdateSettings,
  useResetSettings,
  useSettingsChangelog,
  useTestEmailConnection,
} from './hooks';

export { settingsKeys } from './model/settingsKeys';

// API (for advanced use cases)
export * as settingsApi from './api/settingsApi';
