/**
 * Media Upload API Client
 * Implements endpoints for media upload (presigned URLs), confirmation, and management
 */

import { client } from './client';

/**
 * Standard API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Supported media types
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document';

/**
 * Media file metadata
 */
export interface MediaMetadata {
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Request for presigned upload URL
 */
export interface RequestUploadUrlPayload {
  /** Original filename */
  filename: string;
  /** MIME type of the file */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Media type category */
  mediaType: MediaType;
  /** Optional context (e.g., 'flashcard', 'matching', 'question') */
  context?: string;
  /** Optional parent entity ID */
  parentId?: string;
}

/**
 * Response with presigned upload URL
 */
export interface UploadUrlResponse {
  /** Unique media ID (use this to confirm upload) */
  mediaId: string;
  /** Presigned URL for uploading */
  uploadUrl: string;
  /** HTTP method to use (usually PUT) */
  method: 'PUT' | 'POST';
  /** Headers to include with upload request */
  headers: Record<string, string>;
  /** URL expiration time */
  expiresAt: string;
  /** Final URL where media will be accessible */
  publicUrl: string;
}

/**
 * Payload for confirming upload completion
 */
export interface ConfirmUploadPayload {
  /** Media ID from requestUploadUrl */
  mediaId: string;
  /** Optional additional metadata */
  metadata?: {
    altText?: string;
    caption?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
}

/**
 * Media entity
 */
export interface Media {
  id: string;
  /** Original filename */
  filename: string;
  /** Public URL */
  url: string;
  /** Thumbnail URL (for images/videos) */
  thumbnailUrl?: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  size: number;
  /** Media type category */
  mediaType: MediaType;
  /** Upload status */
  status: 'pending' | 'processing' | 'ready' | 'failed';
  /** Processing error message if failed */
  error?: string;
  /** Additional metadata */
  metadata: {
    altText?: string;
    caption?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
  /** Context where media was uploaded */
  context?: string;
  /** Parent entity ID */
  parentId?: string;
  /** Upload timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Parameters for listing media
 */
export interface GetMediaParams {
  context?: string;
  parentId?: string;
  mediaType?: MediaType;
  status?: Media['status'];
  limit?: number;
  page?: number;
}

/**
 * Paginated media response
 */
export interface MediaListResponse {
  media: Media[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * POST /media/upload-url - Request a presigned upload URL
 */
export async function requestUploadUrl(
  payload: RequestUploadUrlPayload
): Promise<UploadUrlResponse> {
  const response = await client.post<ApiResponse<UploadUrlResponse>>(
    '/media/upload-url',
    payload
  );
  return response.data.data;
}

/**
 * POST /media/:mediaId/confirm - Confirm upload completion
 */
export async function confirmUpload(
  payload: ConfirmUploadPayload
): Promise<Media> {
  const response = await client.post<ApiResponse<Media>>(
    `/media/${payload.mediaId}/confirm`,
    payload
  );
  return response.data.data;
}

/**
 * GET /media/:mediaId - Get media by ID
 */
export async function getMedia(mediaId: string): Promise<Media> {
  const response = await client.get<ApiResponse<Media>>(`/media/${mediaId}`);
  return response.data.data;
}

/**
 * GET /media - List media with filtering
 */
export async function listMedia(params?: GetMediaParams): Promise<MediaListResponse> {
  const response = await client.get<ApiResponse<MediaListResponse>>('/media', { params });
  return response.data.data;
}

/**
 * DELETE /media/:mediaId - Delete media
 */
export async function deleteMedia(mediaId: string): Promise<void> {
  await client.delete(`/media/${mediaId}`);
}

/**
 * PUT /media/:mediaId - Update media metadata
 */
export async function updateMedia(
  mediaId: string,
  metadata: {
    altText?: string;
    caption?: string;
  }
): Promise<Media> {
  const response = await client.put<ApiResponse<Media>>(`/media/${mediaId}`, metadata);
  return response.data.data;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Upload a file to the presigned URL
 * This is a helper that handles the actual upload to S3/storage
 */
export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File | Blob,
  headers: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);

    // Set headers from presigned URL response
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.send(file);
  });
}

/**
 * Complete upload flow: request URL, upload file, confirm
 */
export async function uploadMedia(
  file: File,
  options: {
    mediaType: MediaType;
    context?: string;
    parentId?: string;
    altText?: string;
    caption?: string;
    onProgress?: (progress: number) => void;
  }
): Promise<Media> {
  // Step 1: Request presigned URL
  const uploadUrlResponse = await requestUploadUrl({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    mediaType: options.mediaType,
    context: options.context,
    parentId: options.parentId,
  });

  // Step 2: Upload to presigned URL
  await uploadToPresignedUrl(
    uploadUrlResponse.uploadUrl,
    file,
    uploadUrlResponse.headers,
    options.onProgress
  );

  // Step 3: Confirm upload
  const media = await confirmUpload({
    mediaId: uploadUrlResponse.mediaId,
    metadata: {
      altText: options.altText,
      caption: options.caption,
    },
  });

  return media;
}
