/**
 * React Query hooks for Lookup Values
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { listLookupValues } from '../api/lookupValueApi';
import { lookupValueKeys } from './lookupValueKeys';
import type { LookupValuesFilters, LookupValuesListResponse } from './types';

const LOOKUP_CACHE_KEY = 'lookup-values-cache-v1';
const LOOKUP_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface LookupCacheEntry {
  values: LookupValuesListResponse;
  storedAt: number;
}

type LookupCache = Record<string, LookupCacheEntry>;

const getCacheKey = (filters: LookupValuesFilters = {}) => {
  const category = filters.category ?? 'all';
  const parent = filters.parentLookupId ?? 'all';
  const active = typeof filters.isActive === 'boolean' ? String(filters.isActive) : 'all';
  return `${category}|${parent}|${active}`;
};

const readCache = (cacheKey: string): LookupValuesListResponse | undefined => {
  if (typeof window === 'undefined') return undefined;

  try {
    const raw = localStorage.getItem(LOOKUP_CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as LookupCache;
    const entry = parsed[cacheKey];
    if (!entry) return undefined;
    if (Date.now() - entry.storedAt > LOOKUP_CACHE_TTL_MS) return undefined;
    return entry.values;
  } catch (error) {
    console.warn('Failed to read lookup cache', error);
    return undefined;
  }
};

const writeCache = (cacheKey: string, values: LookupValuesListResponse) => {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(LOOKUP_CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as LookupCache) : {};
    parsed[cacheKey] = { values, storedAt: Date.now() };
    localStorage.setItem(LOOKUP_CACHE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.warn('Failed to write lookup cache', error);
  }
};

/**
 * Hook to fetch lookup values with caching
 */
export function useLookupValues(
  filters: LookupValuesFilters = {},
  options?: Omit<
    UseQueryOptions<LookupValuesListResponse, Error, LookupValuesListResponse, ReturnType<typeof lookupValueKeys.list>>,
    'queryKey' | 'queryFn'
  >
) {
  const cacheKey = getCacheKey(filters);
  const cachedData = readCache(cacheKey);

  const fetchLookupValues = async () => {
    const data = await listLookupValues(filters);
    writeCache(cacheKey, data);
    return data;
  };

  return useQuery({
    queryKey: lookupValueKeys.list(filters),
    queryFn: fetchLookupValues,
    initialData: cachedData,
    staleTime: LOOKUP_CACHE_TTL_MS,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    ...options,
    select: (data) => data,
  });
}
