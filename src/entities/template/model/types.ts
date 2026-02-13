/**
 * Template Entity Types
 * Generated from: /contracts/api/templates.contract.ts v1.0.0
 *
 * Types for course template management including creation, editing, and application.
 */

// =====================
// SHARED TYPES
// =====================

export type TemplateType = 'master' | 'department' | 'custom';
export type TemplateStatus = 'active' | 'draft';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// TEMPLATE TYPES
// =====================

/**
 * User/Creator Reference
 */
export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

/**
 * Department Reference
 */
export interface DepartmentRef {
  id: string;
  name: string;
}

/**
 * Course Reference (for templates in use)
 */
export interface CourseRef {
  id: string;
  title: string;
  code: string;
  versionId?: string;
  version?: number;
  versionStatus?: 'draft' | 'published' | 'archived';
}

/**
 * Template - Full detail type
 */
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  status: TemplateStatus;
  css: string | null;
  html: string | null;
  department: string | null;
  departmentName: string | null;
  isGlobal: boolean;
  createdBy: UserRef;
  usageCount: number;
  usedByCourses?: CourseRef[];
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Template List Item - Compact version for list views
 */
export interface TemplateListItem {
  id: string;
  name: string;
  type: TemplateType;
  status: TemplateStatus;
  department: string | null;
  departmentName: string | null;
  isGlobal: boolean;
  createdBy: UserRef;
  usageCount: number;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Template Payload
 */
export interface CreateTemplatePayload {
  name: string;
  type: TemplateType;
  css?: string;
  html?: string;
  department?: string;
  isGlobal?: boolean;
  status?: TemplateStatus;
}

/**
 * Update Template Payload
 */
export interface UpdateTemplatePayload {
  name?: string;
  css?: string;
  html?: string;
  status?: TemplateStatus;
  isGlobal?: boolean;
}

/**
 * Duplicate Template Payload
 */
export interface DuplicateTemplatePayload {
  name?: string;
  type?: TemplateType;
  department?: string;
  status?: TemplateStatus;
}

/**
 * Duplicate Template Response
 */
export interface DuplicateTemplateResponse {
  id: string;
  name: string;
  type: TemplateType;
  status: TemplateStatus;
  css: string | null;
  html: string | null;
  department: string | null;
  departmentName: string | null;
  isGlobal: boolean;
  createdBy: UserRef;
  usageCount: number;
  duplicatedFrom: string;
  previewUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Delete Template Response
 */
export interface DeleteTemplateResponse {
  deletedId: string;
  affectedCourses: number;
  replacedWith: string | null;
}

/**
 * Template Query Filters
 */
export interface TemplateFilters {
  type?: TemplateType;
  department?: string;
  status?: TemplateStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Template Preview Format
 */
export type PreviewFormat = 'html' | 'json';

/**
 * Template Preview Response (JSON format)
 */
export interface TemplatePreviewData {
  html: string;
  css: string;
  metadata: {
    templateId: string;
    templateName: string;
    previewGenerated: string;
    placeholders: {
      courseTitle: string;
      courseCode: string;
      instructorName: string;
      departmentName: string;
      content: string;
    };
  };
}

/**
 * Template Preview Query Params
 */
export interface TemplatePreviewParams {
  courseTitle?: string;
  courseCode?: string;
  format?: PreviewFormat;
}

// =====================
// API RESPONSE TYPES
// =====================

export interface TemplatesListResponse {
  templates: TemplateListItem[];
  pagination: Pagination;
}

// =====================
// FORM DATA TYPES
// =====================

/**
 * Template Form Data
 * Used for creating/updating templates in forms
 */
export interface TemplateFormData {
  name: string;
  type: TemplateType;
  css?: string;
  html?: string;
  department?: string;
  isGlobal?: boolean;
  status?: TemplateStatus;
}

/**
 * Template Filters Form Data
 * Used for filtering template lists
 */
export interface TemplateFiltersFormData extends TemplateFilters {
  // Extends TemplateFilters, can add additional UI-specific filters here if needed
}
