/**
 * Lookup Values API client
 */

import { client } from '@/shared/api/client';
import type { LookupValue, LookupValuesFilters, LookupValuesListResponse } from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

/**
 * GET /api/v2/lookup-values
 */
export async function listLookupValues(
  filters: LookupValuesFilters = {}
): Promise<LookupValuesListResponse> {
  const response = await client.get<ApiResponse<LookupValue[]>>(
    '/api/v2/lookup-values',
    { params: filters }
  );

  return {
    values: response.data.data || [],
    count: response.data.count ?? response.data.data.length,
  };
}
