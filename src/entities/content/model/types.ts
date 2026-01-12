/**
 * Content Entity Types
 * Generated from: /contracts/api/content.contract.ts v1.0.0
 *
 * Types for content library management including SCORM packages, media files, and exercises.
 */

export type ContentType = 'scorm' | 'media' | 'exercise';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type ScormVersion = '1.2' | '2004';
export type MediaType = 'video' | 'audio' | 'image' | 'document';

/**
 * Pagination metadata for list responses
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * User Reference
 * Basic user information included in responses
 */
export interface UserReference {
  id: string;
  name: string;
  email?: string;
}

/**
 * Department Reference
 * Basic department information included in responses
 */
export interface DepartmentReference {
  id: string;
  name: string;
  code?: string;
}

/**
 * Content List Item
 * Content information used in list views
 */
export interface ContentListItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  departmentId: string | null;
  department: DepartmentReference | null;
  thumbnailUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UserReference;
}

/**
 * Content Details
 * Full content information with metadata and usage statistics
 */
export interface Content {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  departmentId: string | null;
  department: DepartmentReference | null;
  description: string | null;
  thumbnailUrl: string | null;
  metadata: Record<string, unknown>;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: UserReference;
  updatedBy: UserReference;
}

/**
 * Content Filters
 * Used for filtering content lists
 */
export interface ContentFilters {
  page?: number;
  limit?: number;
  type?: ContentType;
  departmentId?: string;
  status?: ContentStatus;
  search?: string;
  sort?: string;
}

/**
 * Content List Response
 */
export interface ContentListResponse {
  content: ContentListItem[];
  pagination: Pagination;
}

/**
 * ============================================
 * SCORM PACKAGE TYPES
 * ============================================
 */

/**
 * SCORM Manifest Metadata
 */
export interface ScormManifestMetadata {
  title?: string;
  description?: string;
  duration?: string;
  keywords?: string[];
  [key: string]: unknown;
}

/**
 * SCORM Manifest Data
 * Parsed imsmanifest.xml structure
 */
export interface ScormManifestData {
  schemaVersion: string;
  metadata: ScormManifestMetadata;
  organizations: unknown[];
  resources: unknown[];
}

/**
 * SCORM Package List Item
 */
export interface ScormPackageListItem {
  id: string;
  title: string;
  identifier: string;
  version: ScormVersion;
  status: ContentStatus;
  isPublished: boolean;
  departmentId: string | null;
  department: DepartmentReference | null;
  packagePath: string;
  launchUrl: string;
  thumbnailUrl: string | null;
  description: string | null;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * SCORM Package Details
 */
export interface ScormPackage {
  id: string;
  title: string;
  identifier: string;
  version: ScormVersion;
  status: ContentStatus;
  isPublished: boolean;
  departmentId: string | null;
  department: DepartmentReference | null;
  packagePath: string;
  launchUrl: string;
  thumbnailUrl: string | null;
  description: string | null;
  manifestData: ScormManifestData;
  fileSize: number;
  usageCount: number;
  totalAttempts: number;
  averageScore: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: UserReference;
  publishedAt: string | null;
  publishedBy: UserReference | null;
}

/**
 * SCORM Package Filters
 */
export interface ScormPackageFilters {
  page?: number;
  limit?: number;
  departmentId?: string;
  status?: ContentStatus;
  version?: ScormVersion;
  search?: string;
  sort?: string;
}

/**
 * SCORM Packages List Response
 */
export interface ScormPackagesListResponse {
  packages: ScormPackageListItem[];
  pagination: Pagination;
}

/**
 * Upload SCORM Package Payload
 */
export interface UploadScormPackagePayload {
  file: File;
  title?: string;
  description?: string;
  departmentId?: string;
  thumbnail?: File;
}

/**
 * Upload SCORM Package Response
 */
export interface UploadScormPackageResponse {
  id: string;
  title: string;
  identifier: string;
  version: ScormVersion;
  status: 'draft';
  isPublished: false;
  departmentId: string | null;
  packagePath: string;
  launchUrl: string;
  manifestData: ScormManifestData;
  fileSize: number;
  createdAt: string;
}

/**
 * Update SCORM Package Metadata Payload
 */
export interface UpdateScormPackagePayload {
  title?: string;
  description?: string;
  departmentId?: string | null;
  thumbnailUrl?: string;
}

/**
 * SCORM Launch Request Payload
 */
export interface ScormLaunchPayload {
  courseContentId?: string;
  resumeAttempt?: boolean;
}

/**
 * SCORM Launch Response
 */
export interface ScormLaunchResponse {
  playerUrl: string;
  attemptId: string;
  sessionToken: string;
  isResumed: boolean;
  scormVersion: ScormVersion;
  launchData: {
    entryPoint: string;
    parameters: Record<string, unknown>;
  };
  expiresAt: string;
}

/**
 * Publish SCORM Package Payload
 */
export interface PublishScormPackagePayload {
  publishedAt?: string;
}

/**
 * Publish SCORM Package Response
 */
export interface PublishScormPackageResponse {
  id: string;
  status: 'published';
  isPublished: true;
  publishedAt: string;
  publishedBy: UserReference;
}

/**
 * Unpublish SCORM Package Response
 */
export interface UnpublishScormPackageResponse {
  id: string;
  status: 'draft';
  isPublished: false;
  unpublishedAt: string;
  unpublishedBy: UserReference;
}

/**
 * ============================================
 * MEDIA LIBRARY TYPES
 * ============================================
 */

/**
 * Media Metadata
 * Technical metadata for media files
 */
export interface MediaMetadata {
  width?: number | null;
  height?: number | null;
  bitrate?: number | null;
  codec?: string | null;
}

/**
 * Media File List Item
 */
export interface MediaFileListItem {
  id: string;
  title: string;
  filename: string;
  type: MediaType;
  mimeType: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  duration: number | null;
  departmentId: string | null;
  department: DepartmentReference | null;
  createdAt: string;
  createdBy: UserReference;
}

/**
 * Media File Details
 */
export interface MediaFile {
  id: string;
  title: string;
  filename: string;
  description: string | null;
  type: MediaType;
  mimeType: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  duration: number | null;
  metadata: MediaMetadata;
  departmentId: string | null;
  department: DepartmentReference | null;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: UserReference;
}

/**
 * Media File Filters
 */
export interface MediaFileFilters {
  page?: number;
  limit?: number;
  type?: MediaType;
  departmentId?: string;
  search?: string;
  sort?: string;
}

/**
 * Media Files List Response
 */
export interface MediaFilesListResponse {
  media: MediaFileListItem[];
  pagination: Pagination;
}

/**
 * Upload Media File Payload
 */
export interface UploadMediaFilePayload {
  file: File;
  title: string;
  description?: string;
  departmentId?: string;
  type: MediaType;
}

/**
 * Upload Media File Response
 */
export interface UploadMediaFileResponse {
  id: string;
  title: string;
  filename: string;
  type: MediaType;
  mimeType: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  duration: number | null;
  departmentId: string | null;
  createdAt: string;
}

/**
 * Update Media File Metadata Payload
 */
export interface UpdateMediaFilePayload {
  title?: string;
  description?: string;
  departmentId?: string | null;
}

/**
 * Content Form Data
 * Used for creating/updating content in forms
 */
export interface ContentFormData {
  title: string;
  description?: string;
  type: ContentType;
  departmentId?: string;
  file?: File;
  thumbnail?: File;
}

/**
 * SCORM Form Data
 */
export interface ScormFormData {
  title?: string;
  description?: string;
  departmentId?: string;
  file: File;
  thumbnail?: File;
}

/**
 * Media Form Data
 */
export interface MediaFormData {
  title: string;
  description?: string;
  departmentId?: string;
  type: MediaType;
  file: File;
}
