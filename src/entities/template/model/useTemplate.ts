/**
 * React Query hooks for Templates
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  previewTemplate,
} from '../api/templateApi';
import { templateKeys } from './templateKeys';
import type {
  Template,
  TemplatesListResponse,
  TemplateFilters,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  DuplicateTemplatePayload,
  TemplatePreviewParams,
  TemplatePreviewData,
} from './types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of templates
 */
export function useTemplates(
  filters?: TemplateFilters,
  options?: Omit<
    UseQueryOptions<TemplatesListResponse, Error, TemplatesListResponse, ReturnType<typeof templateKeys.list>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: () => listTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single template
 */
export function useTemplate(
  id: string,
  options?: Omit<
    UseQueryOptions<Template, Error, Template, ReturnType<typeof templateKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => getTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to preview template
 */
export function useTemplatePreview(
  id: string,
  params?: TemplatePreviewParams,
  options?: Omit<
    UseQueryOptions<
      TemplatePreviewData | string,
      Error,
      TemplatePreviewData | string,
      ReturnType<typeof templateKeys.preview>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: templateKeys.preview(id, params),
    queryFn: () => previewTemplate(id, params),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for previews
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create a template
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) => createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to update a template
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      updateTemplate(id, payload),
    onSuccess: (data, variables) => {
      // Update the specific template in cache
      queryClient.setQueryData(templateKeys.detail(variables.id), data);

      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to delete a template
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => deleteTemplate(id, force),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: templateKeys.detail(variables.id) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}

/**
 * Hook to duplicate a template
 */
export function useDuplicateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DuplicateTemplatePayload }) =>
      duplicateTemplate(id, payload),
    onSuccess: (data) => {
      // Add new template to cache
      queryClient.setQueryData(templateKeys.detail(data.id), data);

      // Invalidate lists to show new template
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
    },
  });
}
