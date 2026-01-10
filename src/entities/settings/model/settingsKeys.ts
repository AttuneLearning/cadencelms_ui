/**
 * Settings Query Keys
 * Centralized query key factory for settings-related queries
 */

import type { SettingCategory } from './types';

export const settingsKeys = {
  all: ['settings'] as const,
  dashboard: () => [...settingsKeys.all, 'dashboard'] as const,
  category: (category: SettingCategory) =>
    [...settingsKeys.all, 'category', category] as const,
  changelog: (limit?: number) =>
    [...settingsKeys.all, 'changelog', { limit }] as const,
};
