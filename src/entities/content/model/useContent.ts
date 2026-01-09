/**
 * Content React Query Hooks
 * Provides hooks for all content-related API operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  listContent,
  getContent,
  listScormPackages,
  uploadScormPackage,
  getScormPackage,
  updateScormPackage,
  deleteScormPackage,
  launchScormPackage,
  publishScormPackage,
  unpublishScormPackage,
  listMediaFiles,
  uploadMediaFile,
  getMediaFile,
  updateMediaFile,
  deleteMediaFile,
} from '../api/contentApi';
import { contentKeys } from './contentKeys';
import type {
  ContentListResponse,
  ContentFilters,
  Content,
  ScormPackagesListResponse,
  ScormPackageFilters,
  ScormPackage,
  UploadScormPackagePayload,
  UploadScormPackageResponse,
  UpdateScormPackagePayload,
  ScormLaunchPayload,
  ScormLaunchResponse,
  PublishScormPackagePayload,
  PublishScormPackageResponse,
  UnpublishScormPackageResponse,
  MediaFilesListResponse,
  MediaFileFilters,
  MediaFile,
  UploadMediaFilePayload,
  UploadMediaFileResponse,
  UpdateMediaFilePayload,
} from './types';

/**
 * ============================================
 * CONTENT OVERVIEW HOOKS
 * ============================================
 */

/**
 * Hook to fetch content overview list (GET /api/v2/content)
 */
export function useContents(
  filters?: ContentFilters,
  options?: Omit<
    UseQueryOptions<
      ContentListResponse,
      Error,
      ContentListResponse,
      ReturnType<typeof contentKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: contentKeys.list(filters),
    queryFn: () => listContent(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single content details (GET /api/v2/content/:id)
 */
export function useContent(
  id: string,
  options?: Omit<
    UseQueryOptions<
      Content,
      Error,
      Content,
      ReturnType<typeof contentKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: contentKeys.detail(id),
    queryFn: () => getContent(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * ============================================
 * SCORM PACKAGE HOOKS
 * ============================================
 */

/**
 * Hook to fetch SCORM packages list (GET /api/v2/content/scorm)
 */
export function useScormPackages(
  filters?: ScormPackageFilters,
  options?: Omit<
    UseQueryOptions<
      ScormPackagesListResponse,
      Error,
      ScormPackagesListResponse,
      ReturnType<typeof contentKeys.scorm.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: contentKeys.scorm.list(filters),
    queryFn: () => listScormPackages(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single SCORM package details (GET /api/v2/content/scorm/:id)
 */
export function useScormPackage(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ScormPackage,
      Error,
      ScormPackage,
      ReturnType<typeof contentKeys.scorm.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: contentKeys.scorm.detail(id),
    queryFn: () => getScormPackage(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to upload a SCORM package (POST /api/v2/content/scorm)
 */
export function useUploadScormPackage(
  options?: UseMutationOptions<
    UploadScormPackageResponse,
    Error,
    { payload: UploadScormPackagePayload; onProgress?: (progress: number) => void }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, onProgress }) =>
      uploadScormPackage(payload, onProgress),
    onSuccess: () => {
      // Invalidate all SCORM lists and content lists
      queryClient.invalidateQueries({ queryKey: contentKeys.scorm.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update SCORM package metadata (PUT /api/v2/content/scorm/:id)
 */
export function useUpdateScormPackage(
  options?: UseMutationOptions<
    ScormPackage,
    Error,
    { id: string; payload: UpdateScormPackagePayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateScormPackage(id, payload),
    onSuccess: (data, variables) => {
      // Update cached detail
      queryClient.setQueryData(contentKeys.scorm.detail(variables.id), data);
      // Invalidate lists to reflect updated data
      queryClient.invalidateQueries({ queryKey: contentKeys.scorm.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a SCORM package (DELETE /api/v2/content/scorm/:id)
 */
export function useDeleteScormPackage(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScormPackage,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: contentKeys.scorm.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentKeys.scorm.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to launch SCORM player (POST /api/v2/content/scorm/:id/launch)
 */
export function useLaunchScormPackage(
  options?: UseMutationOptions<
    ScormLaunchResponse,
    Error,
    { id: string; payload?: ScormLaunchPayload }
  >
) {
  return useMutation({
    mutationFn: ({ id, payload }) => launchScormPackage(id, payload),
    ...options,
  });
}

/**
 * Hook to publish a SCORM package (POST /api/v2/content/scorm/:id/publish)
 */
export function usePublishScormPackage(
  options?: UseMutationOptions<
    PublishScormPackageResponse,
    Error,
    { id: string; payload?: PublishScormPackagePayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => publishScormPackage(id, payload),
    onSuccess: (_, variables) => {
      // Update cached detail
      queryClient.invalidateQueries({
        queryKey: contentKeys.scorm.detail(variables.id),
      });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentKeys.scorm.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to unpublish a SCORM package (POST /api/v2/content/scorm/:id/unpublish)
 */
export function useUnpublishScormPackage(
  options?: UseMutationOptions<UnpublishScormPackageResponse, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unpublishScormPackage,
    onSuccess: (_, id) => {
      // Update cached detail
      queryClient.invalidateQueries({
        queryKey: contentKeys.scorm.detail(id),
      });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentKeys.scorm.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}

/**
 * ============================================
 * MEDIA LIBRARY HOOKS
 * ============================================
 */

/**
 * Hook to fetch media files list (GET /api/v2/content/media)
 */
export function useMediaFiles(
  filters?: MediaFileFilters,
  options?: Omit<
    UseQueryOptions<
      MediaFilesListResponse,
      Error,
      MediaFilesListResponse,
      ReturnType<typeof contentKeys.media.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: contentKeys.media.list(filters),
    queryFn: () => listMediaFiles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single media file details (GET /api/v2/content/media/:id)
 */
export function useMediaFile(
  id: string,
  options?: Omit<
    UseQueryOptions<
      MediaFile,
      Error,
      MediaFile,
      ReturnType<typeof contentKeys.media.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: contentKeys.media.detail(id),
    queryFn: () => getMediaFile(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to upload a media file (POST /api/v2/content/media)
 */
export function useUploadMediaFile(
  options?: UseMutationOptions<
    UploadMediaFileResponse,
    Error,
    { payload: UploadMediaFilePayload; onProgress?: (progress: number) => void }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, onProgress }) =>
      uploadMediaFile(payload, onProgress),
    onSuccess: () => {
      // Invalidate all media lists and content lists
      queryClient.invalidateQueries({ queryKey: contentKeys.media.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update media file metadata (PUT /api/v2/content/media/:id)
 */
export function useUpdateMediaFile(
  options?: UseMutationOptions<
    MediaFile,
    Error,
    { id: string; payload: UpdateMediaFilePayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateMediaFile(id, payload),
    onSuccess: (data, variables) => {
      // Update cached detail
      queryClient.setQueryData(contentKeys.media.detail(variables.id), data);
      // Invalidate lists to reflect updated data
      queryClient.invalidateQueries({ queryKey: contentKeys.media.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a media file (DELETE /api/v2/content/media/:id)
 */
export function useDeleteMediaFile(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMediaFile,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: contentKeys.media.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contentKeys.media.lists() });
      queryClient.invalidateQueries({ queryKey: contentKeys.lists() });
    },
    ...options,
  });
}
