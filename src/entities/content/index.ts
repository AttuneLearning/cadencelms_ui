/**
 * Content Entity - Public API
 * Generated from: content.contract.ts v1.0.0
 */

// =====================
// TYPE EXPORTS
// =====================

export type {
  // Core types
  ContentType,
  ContentStatus,
  ScormVersion,
  MediaType,
  Pagination,
  UserReference,
  DepartmentReference,
  // Content overview
  ContentListItem,
  Content,
  ContentFilters,
  ContentListResponse,
  // SCORM types
  ScormManifestMetadata,
  ScormManifestData,
  ScormPackageListItem,
  ScormPackage,
  ScormPackageFilters,
  ScormPackagesListResponse,
  UploadScormPackagePayload,
  UploadScormPackageResponse,
  UpdateScormPackagePayload,
  ScormLaunchPayload,
  ScormLaunchResponse,
  PublishScormPackagePayload,
  PublishScormPackageResponse,
  UnpublishScormPackageResponse,
  // Media types
  MediaMetadata,
  MediaFileListItem,
  MediaFile,
  MediaFileFilters,
  MediaFilesListResponse,
  UploadMediaFilePayload,
  UploadMediaFileResponse,
  UpdateMediaFilePayload,
  // Form types
  ContentFormData,
  ScormFormData,
  MediaFormData,
} from './model/types';

// =====================
// HOOKS EXPORTS
// =====================

export {
  // Content overview hooks
  useContents,
  useContent,
  // SCORM package hooks
  useScormPackages,
  useScormPackage,
  useUploadScormPackage,
  useUpdateScormPackage,
  useDeleteScormPackage,
  useLaunchScormPackage,
  usePublishScormPackage,
  useUnpublishScormPackage,
  // Media library hooks
  useMediaFiles,
  useMediaFile,
  useUploadMediaFile,
  useUpdateMediaFile,
  useDeleteMediaFile,
} from './hooks';

// Query keys
export { contentKeys } from './model/contentKeys';

// =====================
// API EXPORTS (for advanced use)
// =====================

export * as contentApi from './api/contentApi';

// =====================
// UI COMPONENT EXPORTS
// =====================

export { ContentCard, ContentList, ContentForm, ContentTypeBadge } from './ui';
