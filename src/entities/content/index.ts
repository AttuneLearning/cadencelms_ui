/**
 * Content entity public exports
 * Following FSD architecture - only exports what's needed by other layers
 */

// Types
export type {
  Content,
  ContentType,
  ContentStatus,
  VideoContent,
  DocumentContent,
  SCORMContent,
  QuizContent,
  QuizQuestion,
  ContentListItem,
  CreateContentPayload,
  UpdateContentPayload,
  ContentFilterParams,
} from './model/types';

// API
export {
  getContent,
  getContentList,
  getContentByCourseId,
  createContent,
  updateContent,
  deleteContent,
} from './api/contentApi';

// Hooks
export { useContent } from './model/useContent';
export { useContentList } from './model/useContentList';

// UI Components
export { ContentTypeBadge } from './ui/ContentTypeBadge';
