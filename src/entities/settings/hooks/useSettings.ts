/**
 * Settings React Query Hooks
 * Provides hooks for all settings-related API operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getSettingsDashboard,
  getSettingsByCategory,
  updateSettingsByCategory,
  resetSettingsByCategory,
  getSettingsChangelog,
  testEmailConnection,
} from '../api/settingsApi';
import { settingsKeys } from '../model/settingsKeys';
import type {
  SettingCategory,
  CategorySettings,
  UpdateSettingsPayload,
  SettingsDashboard,
  SettingsChangeLog,
  TestEmailRequest,
  TestEmailResponse,
} from '../model/types';

/**
 * Hook to fetch settings dashboard (GET /api/v2/settings/dashboard)
 */
export function useSettingsDashboard(
  options?: Omit<
    UseQueryOptions<
      SettingsDashboard,
      Error,
      SettingsDashboard,
      ReturnType<typeof settingsKeys.dashboard>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: settingsKeys.dashboard(),
    queryFn: getSettingsDashboard,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to fetch settings by category (GET /api/v2/settings/:category)
 */
export function useSettingsByCategory<T extends SettingCategory>(
  category: T,
  options?: Omit<
    UseQueryOptions<
      CategorySettings<T>,
      Error,
      CategorySettings<T>,
      ReturnType<typeof settingsKeys.category>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: settingsKeys.category(category),
    queryFn: () => getSettingsByCategory(category),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!category,
    ...options,
  });
}

/**
 * Hook to update settings by category (PUT /api/v2/settings/:category)
 */
export function useUpdateSettings<T extends SettingCategory>(
  category: T,
  options?: UseMutationOptions<
    CategorySettings<T>,
    Error,
    UpdateSettingsPayload<T>
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsPayload<T>) =>
      updateSettingsByCategory(category, data),
    onSuccess: () => {
      // Invalidate settings cache
      queryClient.invalidateQueries({ queryKey: settingsKeys.category(category) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.changelog() });
    },
    ...options,
  });
}

/**
 * Hook to reset settings to defaults (POST /api/v2/settings/:category/reset)
 */
export function useResetSettings<T extends SettingCategory>(
  category: T,
  options?: UseMutationOptions<CategorySettings<T>, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resetSettingsByCategory(category),
    onSuccess: () => {
      // Invalidate settings cache
      queryClient.invalidateQueries({ queryKey: settingsKeys.category(category) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.changelog() });
    },
    ...options,
  });
}

/**
 * Hook to fetch settings changelog (GET /api/v2/settings/changelog)
 */
export function useSettingsChangelog(
  limit: number = 10,
  options?: Omit<
    UseQueryOptions<
      SettingsChangeLog[],
      Error,
      SettingsChangeLog[],
      ReturnType<typeof settingsKeys.changelog>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: settingsKeys.changelog(limit),
    queryFn: () => getSettingsChangelog(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook to test email connection (POST /api/v2/settings/email/test)
 */
export function useTestEmailConnection(
  options?: UseMutationOptions<TestEmailResponse, Error, TestEmailRequest>
) {
  return useMutation({
    mutationFn: testEmailConnection,
    ...options,
  });
}
