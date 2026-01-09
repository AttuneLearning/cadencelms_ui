/**
 * useContentList hook
 * TanStack Query hook for fetching lists of content items
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  getContentList,
  getContentByCourseId,
  getContentByLessonId,
  createContent,
  searchContent,
  getContentByTags,
} from '../api/contentApi';
import type {
  Content,
  ContentFilterParams,
  CreateContentPayload,
} from './types';
import type { PaginatedResponse, QueryParams } from '@/shared/api/types';
import { ApiClientError } from '@/shared/api/client';
import { contentKeys } from './useContent';

/**
 * Hook to fetch a paginated list of content items
 */
export function useContentList(
  params?: ContentFilterParams & QueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Content>, ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<Content>, ApiClientError>({
    queryKey: contentKeys.list(params as Record<string, unknown>),
    queryFn: () => getContentList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch content items by course ID
 */
export function useContentByCourseId(
  courseId: string,
  params?: QueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Content>, ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<Content>, ApiClientError>({
    queryKey: contentKeys.list({ ...params, courseId }),
    queryFn: () => getContentByCourseId(courseId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!courseId,
    ...options,
  });
}

/**
 * Hook to fetch content items by lesson ID
 */
export function useContentByLessonId(
  lessonId: string,
  params?: QueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Content>, ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<Content>, ApiClientError>({
    queryKey: contentKeys.list({ ...params, lessonId }),
    queryFn: () => getContentByLessonId(lessonId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!lessonId,
    ...options,
  });
}

/**
 * Hook to search content items
 */
export function useSearchContent(
  query: string,
  params?: ContentFilterParams & QueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Content>, ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<Content>, ApiClientError>({
    queryKey: contentKeys.list({ ...params, search: query }),
    queryFn: () => searchContent(query, params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!query && query.length > 0,
    ...options,
  });
}

/**
 * Hook to get content by tags
 */
export function useContentByTags(
  tags: string[],
  params?: QueryParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Content>, ApiClientError>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<PaginatedResponse<Content>, ApiClientError>({
    queryKey: contentKeys.list({ ...params, tags }),
    queryFn: () => getContentByTags(tags, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: tags.length > 0,
    ...options,
  });
}

/**
 * Hook to create a new content item
 */
export function useCreateContent(
  options?: UseMutationOptions<Content, ApiClientError, CreateContentPayload>
) {
  const queryClient = useQueryClient();

  return useMutation<Content, ApiClientError, CreateContentPayload>({
    mutationFn: (payload) => createContent(payload),
    onSuccess: (data) => {
      // Invalidate all content list queries
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
      // Set the new content in the cache
      queryClient.setQueryData(contentKeys.detail(data._id), data);
    },
    ...options,
  });
}
