/**
 * Content API Client
 * Implements endpoints from content.contract.ts v1.0.0
 *
 * Covers 15 endpoints:
 * - Content overview: list, getById
 * - SCORM packages: listScorm, uploadScorm, getScorm, updateScorm, deleteScorm, launchScorm, publishScorm, unpublishScorm
 * - Media library: listMedia, uploadMedia, getMedia, updateMedia, deleteMedia
 */

import { client } from '@/shared/api/client';
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
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * ============================================
 * CONTENT OVERVIEW ENDPOINTS
 * ============================================
 */

/**
 * GET /content - List all content items (SCORM, media, exercises)
 */
export async function listContent(
  filters?: ContentFilters
): Promise<ContentListResponse> {
  const response = await client.get<ApiResponse<ContentListResponse>>(
    '/content',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /content/:id - Get detailed information about a content item
 */
export async function getContent(id: string): Promise<Content> {
  const response = await client.get<ApiResponse<Content>>(
    `/content/${id}`
  );
  return response.data.data;
}

/**
 * ============================================
 * SCORM PACKAGE ENDPOINTS
 * ============================================
 */

/**
 * GET /content/scorm - List all SCORM packages
 */
export async function listScormPackages(
  filters?: ScormPackageFilters
): Promise<ScormPackagesListResponse> {
  const response = await client.get<ApiResponse<ScormPackagesListResponse>>(
    '/content/scorm',
    { params: filters }
  );
  return response.data.data;
}

/**
 * POST /content/scorm - Upload a new SCORM package
 */
export async function uploadScormPackage(
  payload: UploadScormPackagePayload,
  onProgress?: (progress: number) => void
): Promise<UploadScormPackageResponse> {
  const formData = new FormData();
  formData.append('file', payload.file);

  if (payload.title) {
    formData.append('title', payload.title);
  }
  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (payload.departmentId) {
    formData.append('departmentId', payload.departmentId);
  }
  if (payload.thumbnail) {
    formData.append('thumbnail', payload.thumbnail);
  }

  const response = await client.post<ApiResponse<UploadScormPackageResponse>>(
    '/content/scorm',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    }
  );

  return response.data.data;
}

/**
 * GET /content/scorm/:id - Get detailed information about a SCORM package
 */
export async function getScormPackage(id: string): Promise<ScormPackage> {
  const response = await client.get<ApiResponse<ScormPackage>>(
    `/content/scorm/${id}`
  );
  return response.data.data;
}

/**
 * PUT /content/scorm/:id - Update SCORM package metadata
 */
export async function updateScormPackage(
  id: string,
  payload: UpdateScormPackagePayload
): Promise<ScormPackage> {
  const response = await client.put<ApiResponse<ScormPackage>>(
    `/content/scorm/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /content/scorm/:id - Delete a SCORM package
 */
export async function deleteScormPackage(id: string): Promise<void> {
  await client.delete(`/content/scorm/${id}`);
}

/**
 * POST /content/scorm/:id/launch - Launch SCORM player and create attempt session
 */
export async function launchScormPackage(
  id: string,
  payload?: ScormLaunchPayload
): Promise<ScormLaunchResponse> {
  const response = await client.post<ApiResponse<ScormLaunchResponse>>(
    `/content/scorm/${id}/launch`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /content/scorm/:id/publish - Publish SCORM package
 */
export async function publishScormPackage(
  id: string,
  payload?: PublishScormPackagePayload
): Promise<PublishScormPackageResponse> {
  const response = await client.post<ApiResponse<PublishScormPackageResponse>>(
    `/content/scorm/${id}/publish`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /content/scorm/:id/unpublish - Unpublish SCORM package
 */
export async function unpublishScormPackage(
  id: string
): Promise<UnpublishScormPackageResponse> {
  const response = await client.post<ApiResponse<UnpublishScormPackageResponse>>(
    `/content/scorm/${id}/unpublish`
  );
  return response.data.data;
}

/**
 * ============================================
 * MEDIA LIBRARY ENDPOINTS
 * ============================================
 */

/**
 * GET /content/media - List all media files
 */
export async function listMediaFiles(
  filters?: MediaFileFilters
): Promise<MediaFilesListResponse> {
  const response = await client.get<ApiResponse<MediaFilesListResponse>>(
    '/content/media',
    { params: filters }
  );
  return response.data.data;
}

/**
 * POST /content/media - Upload a new media file
 */
export async function uploadMediaFile(
  payload: UploadMediaFilePayload,
  onProgress?: (progress: number) => void
): Promise<UploadMediaFileResponse> {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('title', payload.title);
  formData.append('type', payload.type);

  if (payload.description) {
    formData.append('description', payload.description);
  }
  if (payload.departmentId) {
    formData.append('departmentId', payload.departmentId);
  }

  const response = await client.post<ApiResponse<UploadMediaFileResponse>>(
    '/content/media',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    }
  );

  return response.data.data;
}

/**
 * GET /content/media/:id - Get detailed information about a media file
 */
export async function getMediaFile(id: string): Promise<MediaFile> {
  const response = await client.get<ApiResponse<MediaFile>>(
    `/content/media/${id}`
  );
  return response.data.data;
}

/**
 * PUT /content/media/:id - Update media file metadata
 */
export async function updateMediaFile(
  id: string,
  payload: UpdateMediaFilePayload
): Promise<MediaFile> {
  const response = await client.put<ApiResponse<MediaFile>>(
    `/content/media/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /content/media/:id - Delete a media file
 */
export async function deleteMediaFile(id: string): Promise<void> {
  await client.delete(`/content/media/${id}`);
}
