/**
 * Public API exports
 */

export { client, createClient, ApiClientError } from './client';
export { endpoints } from './endpoints';
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  QueryParams,
  UploadProgressCallback,
  RequestConfig,
} from './types';

// Media API
export * as mediaApi from './mediaApi';
export type {
  MediaType,
  MediaMetadata,
  RequestUploadUrlPayload,
  UploadUrlResponse,
  ConfirmUploadPayload,
  Media,
  GetMediaParams,
  MediaListResponse,
} from './mediaApi';
export {
  requestUploadUrl,
  confirmUpload,
  getMedia,
  listMedia,
  deleteMedia,
  updateMedia,
  uploadToPresignedUrl,
  uploadMedia,
} from './mediaApi';
