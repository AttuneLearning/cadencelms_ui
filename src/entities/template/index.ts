/**
 * Template Entity
 * Public API for template entity
 */

// Types
export type {
  Template,
  TemplateListItem,
  TemplateType,
  TemplateStatus,
  TemplateFilters,
  TemplatesListResponse,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  DuplicateTemplatePayload,
  DuplicateTemplateResponse,
  DeleteTemplateResponse,
  TemplatePreviewData,
  TemplatePreviewParams,
  PreviewFormat,
  TemplateFormData,
  TemplateFiltersFormData,
  UserRef,
  DepartmentRef,
  CourseRef,
  Pagination,
} from './model/types';

// API
export {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  previewTemplate,
} from './api/templateApi';

// Query Keys
export { templateKeys } from './model/templateKeys';

// Hooks
export {
  useTemplates,
  useTemplate,
  useTemplatePreview,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useDuplicateTemplate,
} from './model/useTemplate';

// UI Components
export { TemplateCard } from './ui/TemplateCard';
export { TemplateList } from './ui/TemplateList';
export { TemplateForm } from './ui/TemplateForm';
