/**
 * Settings API Client
 * API functions for settings management
 */

import { client } from '@/shared/api/client';
import type {
  SettingCategory,
  CategorySettings,
  UpdateSettingsPayload,
  SettingsDashboard,
  SettingsChangeLog,
  TestEmailRequest,
  TestEmailResponse,
} from '../model/types';

const BASE_URL = '/settings';

/**
 * Get settings dashboard summary
 */
export async function getSettingsDashboard(): Promise<SettingsDashboard> {
  const response = await client.get<{ success: boolean; data: SettingsDashboard }>(
    `${BASE_URL}/dashboard`
  );
  return response.data.data;
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory<T extends SettingCategory>(
  category: T
): Promise<CategorySettings<T>> {
  const response = await client.get<{ success: boolean; data: CategorySettings<T> }>(
    `${BASE_URL}/${category}`
  );
  return response.data.data;
}

/**
 * Update settings by category
 */
export async function updateSettingsByCategory<T extends SettingCategory>(
  category: T,
  data: UpdateSettingsPayload<T>
): Promise<CategorySettings<T>> {
  const response = await client.put<{ success: boolean; data: CategorySettings<T> }>(
    `${BASE_URL}/${category}`,
    data
  );
  return response.data.data;
}

/**
 * Reset settings to defaults by category
 */
export async function resetSettingsByCategory<T extends SettingCategory>(
  category: T
): Promise<CategorySettings<T>> {
  const response = await client.post<{ success: boolean; data: CategorySettings<T> }>(
    `${BASE_URL}/${category}/reset`
  );
  return response.data.data;
}

/**
 * Get settings changelog
 */
export async function getSettingsChangelog(
  limit: number = 10
): Promise<SettingsChangeLog[]> {
  const response = await client.get<{ success: boolean; data: SettingsChangeLog[] }>(
    `${BASE_URL}/changelog`,
    {
      params: { limit },
    }
  );
  return response.data.data;
}

/**
 * Test email connection
 */
export async function testEmailConnection(
  data: TestEmailRequest
): Promise<TestEmailResponse> {
  const response = await client.post<{ success: boolean; data: TestEmailResponse }>(
    `${BASE_URL}/email/test`,
    data
  );
  return response.data.data;
}
