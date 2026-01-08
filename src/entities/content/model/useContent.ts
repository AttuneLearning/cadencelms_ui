/**
 * useContent hook
 * TanStack Query hook for fetching a single content item
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { getContent, updateContent, deleteContent } from '../api/contentApi';
import type { Content, UpdateContentPayload } from './types';
import { ApiClientError } from '@/shared/api/client';

/**
 * Query key factory for content queries
 */
export const contentKeys = {
  all: ['content'] as const,
  lists: () => [...contentKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...contentKeys.lists(), filters] as const,
  details: () => [...contentKeys.all, 'detail'] as const,
  detail: (id: string) => [...contentKeys.details(), id] as const,
};

/**
 * Hook to fetch a single content item by ID
 */
export function useContent(
  id: string,
  options?: Omit<
    UseQueryOptions<Content, ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<Content, ApiClientError>({
    queryKey: contentKeys.detail(id),
    queryFn: () => getContent(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to update a content item
 */
export function useUpdateContent(
  options?: UseMutationOptions<
    Content,
    ApiClientError,
    { id: string; payload: UpdateContentPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    Content,
    ApiClientError,
    { id: string; payload: UpdateContentPayload }
  >({
    mutationFn: ({ id, payload }) => updateContent(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate and refetch content list queries
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      // Update the specific content query cache
      queryClient.setQueryData(contentKeys.detail(variables.id), data);
    },
    ...options,
  });
}

/**
 * Hook to delete a content item
 */
export function useDeleteContent(
  options?: UseMutationOptions<void, ApiClientError, string>
) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiClientError, string>({
    mutationFn: (id) => deleteContent(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch content list queries
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      // Remove the specific content query from cache
      queryClient.removeQueries({ queryKey: contentKeys.detail(id) });
    },
    ...options,
  });
}
