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
 * Some API handlers wrap payloads as { data: {...} } inside ApiResponse.data.
 * Accept both wrapped and direct shapes for rollout compatibility.
 */
function unwrapApiData<T>(response: ApiResponse<T | { data: T }>): T {
  const payload = response.data as T | { data: T };
  if (
    payload &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    'data' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

interface CanonicalMediaUploadUrlResponse {
  uploadId: string;
  uploadUrl: string;
  method?: 'PUT' | 'POST';
  fields?: Record<string, string> | null;
  contentType?: string;
}

interface CanonicalMediaFileResponse {
  id: string;
  type: string;
  title?: string;
  filename: string;
  description?: string | null;
  mimeType: string;
  fileSize?: number;
  size?: number;
  cdnUrl?: string;
  url?: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
  metadata?: Record<string, unknown>;
  uploadedBy?: string;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
  uploadedAt?: string;
}

interface CanonicalMediaListResponse {
  media: CanonicalMediaFileResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

function normalizeMediaType(type: string | undefined, fallback: UploadMediaFilePayload['type']) {
  if (type === 'image' || type === 'video' || type === 'audio' || type === 'document') {
    return type;
  }
  return fallback;
}

function mapCanonicalMediaToListItem(media: CanonicalMediaFileResponse) {
  const metadata = (media.metadata ?? {}) as Record<string, unknown>;
  const filename = media.filename ?? 'untitled';
  const title =
    media.title ||
    (metadata.title as string | undefined) ||
    (metadata.altText as string | undefined) ||
    filename;

  return {
    id: media.id,
    title,
    filename,
    type: normalizeMediaType(media.type, 'image'),
    mimeType: media.mimeType,
    url: media.cdnUrl || media.url || '',
    thumbnailUrl: media.thumbnailUrl || null,
    size: media.fileSize ?? media.size ?? 0,
    duration: media.duration ?? null,
    departmentId: media.departmentId ?? null,
    department: media.department || null,
    createdAt: media.createdAt || media.uploadedAt || new Date().toISOString(),
    createdBy: media.createdBy || {
      id: media.uploadedBy || 'unknown',
      name: 'Unknown',
    },
  };
}

function mapCanonicalMediaToDetail(media: CanonicalMediaFileResponse): MediaFile {
  const metadata = (media.metadata ?? {}) as Record<string, unknown>;
  const filename = media.filename ?? 'untitled';
  const title =
    media.title ||
    (metadata.title as string | undefined) ||
    (metadata.altText as string | undefined) ||
    filename;

  return {
    id: media.id,
    title,
    filename,
    description: media.description || (metadata.description as string | undefined) || null,
    type: normalizeMediaType(media.type, 'image'),
    mimeType: media.mimeType,
    url: media.cdnUrl || media.url || '',
    thumbnailUrl: media.thumbnailUrl || null,
    size: media.fileSize ?? media.size ?? 0,
    duration: media.duration ?? null,
    metadata: {
      width: typeof metadata.width === 'number' ? metadata.width : null,
      height: typeof metadata.height === 'number' ? metadata.height : null,
      bitrate: typeof metadata.bitrate === 'number' ? metadata.bitrate : null,
      codec: typeof metadata.codec === 'string' ? metadata.codec : null,
    },
    departmentId: media.departmentId ?? null,
    department: media.department || null,
    usageCount:
      media.usageCount ??
      (typeof metadata.usageCount === 'number' ? metadata.usageCount : 0),
    createdAt: media.createdAt || media.uploadedAt || new Date().toISOString(),
    updatedAt: media.updatedAt || media.createdAt || media.uploadedAt || new Date().toISOString(),
    createdBy: media.createdBy || {
      id: media.uploadedBy || 'unknown',
      name: 'Unknown',
    },
  };
}

async function uploadToMediaStorage(
  upload: CanonicalMediaUploadUrlResponse,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  const method = upload.method || 'PUT';

  if (typeof XMLHttpRequest === 'undefined') {
    if (method === 'POST') {
      const formData = new FormData();
      Object.entries(upload.fields || {}).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      const response = await fetch(upload.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    } else {
      const response = await fetch(upload.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': upload.contentType || file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    }

    if (onProgress) onProgress(100);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open(method, upload.uploadUrl);

    if (method === 'POST') {
      const formData = new FormData();
      Object.entries(upload.fields || {}).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);
      xhr.send(formData);
      return;
    }

    xhr.setRequestHeader(
      'Content-Type',
      upload.contentType || file.type || 'application/octet-stream'
    );
    xhr.send(file);
  });
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
 * GET /media - List all media files
 */
export async function listMediaFiles(
  filters?: MediaFileFilters
): Promise<MediaFilesListResponse> {
  const response = await client.get<ApiResponse<CanonicalMediaListResponse>>(
    '/media',
    { params: filters }
  );
  const data = unwrapApiData(response.data);

  return {
    media: data.media.map(mapCanonicalMediaToListItem),
    pagination: data.pagination,
  };
}

/**
 * Upload flow:
 * 1) POST /media/upload-url
 * 2) direct upload to storage URL
 * 3) POST /media/confirm
 */
export async function uploadMediaFile(
  payload: UploadMediaFilePayload,
  onProgress?: (progress: number) => void
): Promise<UploadMediaFileResponse> {
  const uploadUrlResponse = await client.post<ApiResponse<CanonicalMediaUploadUrlResponse>>(
    '/media/upload-url',
    {
      filename: payload.file.name,
      mimeType: payload.file.type || 'application/octet-stream',
      fileSize: payload.file.size,
      purpose: 'content',
      departmentId: payload.departmentId,
      title: payload.title,
      description: payload.description,
    }
  );
  const uploadRequest = unwrapApiData(uploadUrlResponse.data);

  await uploadToMediaStorage(uploadRequest, payload.file, onProgress);

  const metadata: Record<string, unknown> = {
    title: payload.title,
  };
  if (payload.description) {
    metadata.description = payload.description;
  }
  if (payload.departmentId) {
    metadata.departmentId = payload.departmentId;
  }

  const confirmResponse = await client.post<ApiResponse<CanonicalMediaFileResponse>>(
    '/media/confirm',
    {
      uploadId: uploadRequest.uploadId,
      altText: payload.title,
      metadata,
    }
  );
  const confirmed = unwrapApiData(confirmResponse.data);

  return {
    id: confirmed.id,
    title: payload.title,
    filename: confirmed.filename ?? payload.file.name,
    type: normalizeMediaType(confirmed.type, payload.type),
    mimeType: confirmed.mimeType ?? payload.file.type,
    url: confirmed.cdnUrl || confirmed.url || '',
    thumbnailUrl: confirmed.thumbnailUrl || null,
    size: confirmed.fileSize ?? payload.file.size,
    duration: confirmed.duration ?? null,
    departmentId: payload.departmentId ?? null,
    createdAt: confirmed.createdAt || new Date().toISOString(),
  };
}

/**
 * GET /media/:id - Get detailed information about a media file
 */
export async function getMediaFile(id: string): Promise<MediaFile> {
  const response = await client.get<ApiResponse<CanonicalMediaFileResponse>>(
    `/media/${id}`
  );
  return mapCanonicalMediaToDetail(unwrapApiData(response.data));
}

/**
 * PUT /media/:id - Update media file metadata
 */
export async function updateMediaFile(
  id: string,
  payload: UpdateMediaFilePayload
): Promise<MediaFile> {
  const metadata: Record<string, unknown> = {};
  if (payload.title !== undefined) {
    metadata.title = payload.title;
  }
  if (payload.description !== undefined) {
    metadata.description = payload.description;
  }
  if (payload.departmentId !== undefined) {
    metadata.departmentId = payload.departmentId;
  }

  await client.put<ApiResponse<CanonicalMediaFileResponse>>(
    `/media/${id}`,
    {
      altText: payload.title,
      metadata,
    }
  );

  return getMediaFile(id);
}

/**
 * DELETE /media/:id - Delete a media file
 */
export async function deleteMediaFile(id: string): Promise<void> {
  await client.delete(`/media/${id}`);
}
