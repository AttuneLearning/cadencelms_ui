/**
 * Content entity public exports
 * Following FSD architecture - only exports what's needed by other layers
 */

// Types
export type {
  Content,
  ContentMetadata,
  ScormMetadata,
  VideoMetadata,
  DocumentMetadata,
  QuizMetadata,
  ExternalLinkMetadata,
  CreateContentPayload,
  UpdateContentPayload,
  ContentFilterParams,
} from './model/types';

export {
  ContentType,
  ContentStatus,
  ScormVersion,
  VideoFormat,
  DocumentFormat,
  getContentTypeDisplayName,
  formatFileSize,
  formatDuration,
  isScormMetadata,
  isVideoMetadata,
  isDocumentMetadata,
  isQuizMetadata,
  isExternalLinkMetadata,
} from './model/types';

// API functions
export {
  getContent,
  getContentList,
  getContentByCourseId,
  getContentByLessonId,
  createContent,
  updateContent,
  deleteContent,
  uploadScormPackage,
  searchContent,
  getContentByTags,
} from './api/contentApi';

// Query hooks
export { contentKeys, useContent, useUpdateContent, useDeleteContent } from './model/useContent';

export {
  useContentList,
  useContentByCourseId,
  useContentByLessonId,
  useSearchContent,
  useContentByTags,
  useCreateContent,
} from './model/useContentList';

// UI components
export {
  ContentCard,
  ContentCardSkeleton,
  ContentCardList,
  ContentCardListSkeleton,
} from './ui/ContentCard';

export type { ContentCardProps, ContentCardListProps } from './ui/ContentCard';

export { ContentTypeBadge } from './ui/ContentTypeBadge';

export type { ContentTypeBadgeProps } from './ui/ContentTypeBadge';

// Content type configuration and helpers
export {
  contentTypeBadgeConfig,
  getContentTypeIcon,
  getContentTypeColorClass,
} from './lib/contentTypeConfig';
