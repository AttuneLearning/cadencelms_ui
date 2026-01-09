/**
 * Course Entity Types
 * Generated from: /contracts/api/courses.contract.ts v1.0.0
 *
 * Types for course management including courses, modules, enrollments, and statistics.
 */

// =====================
// SHARED TYPES
// =====================

export type CourseStatus = 'draft' | 'published' | 'archived';
export type ModuleType = 'scorm' | 'custom' | 'exercise';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// COURSE TYPES
// =====================

/**
 * Course Settings
 */
export interface CourseSettings {
  allowSelfEnrollment: boolean;
  passingScore: number;
  maxAttempts: number;
  certificateEnabled: boolean;
}

/**
 * Department Reference
 */
export interface DepartmentRef {
  id: string;
  name: string;
}

/**
 * Program Reference
 */
export interface ProgramRef {
  id: string;
  name: string;
}

/**
 * Instructor Reference
 */
export interface InstructorRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

/**
 * User Reference
 */
export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
}

/**
 * Course Module
 */
export interface CourseModule {
  id: string;
  title: string;
  type: ModuleType;
  order: number;
  isPublished: boolean;
}

/**
 * Course - Full detail type
 */
export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  department: DepartmentRef;
  program: ProgramRef | null;
  credits: number;
  duration: number;
  status: CourseStatus;
  instructors: InstructorRef[];
  settings: CourseSettings;
  modules?: CourseModule[];
  enrollmentCount: number;
  completionRate?: number;
  publishedAt: string | null;
  archivedAt: string | null;
  createdBy: UserRef;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course List Item - Compact version for list views
 */
export interface CourseListItem {
  id: string;
  title: string;
  code: string;
  description: string;
  department: DepartmentRef;
  program: ProgramRef | null;
  credits: number;
  duration: number;
  status: CourseStatus;
  instructors: InstructorRef[];
  settings: CourseSettings;
  moduleCount: number;
  enrollmentCount: number;
  publishedAt: string | null;
  archivedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Course Payload
 */
export interface CreateCoursePayload {
  title: string;
  code: string;
  description?: string;
  department: string;
  program?: string;
  credits?: number;
  duration?: number;
  instructors?: string[];
  settings?: Partial<CourseSettings>;
}

/**
 * Update Course Payload (Full - PUT)
 */
export interface UpdateCoursePayload {
  title: string;
  code: string;
  description?: string;
  department: string;
  program?: string;
  credits?: number;
  duration?: number;
  instructors?: string[];
  settings?: Partial<CourseSettings>;
}

/**
 * Patch Course Payload (Partial - PATCH)
 */
export interface PatchCoursePayload {
  title?: string;
  description?: string;
  credits?: number;
  duration?: number;
  instructors?: string[];
  settings?: Partial<CourseSettings>;
}

/**
 * Course Query Filters
 */
export interface CourseFilters {
  page?: number;
  limit?: number;
  department?: string;
  program?: string;
  status?: CourseStatus;
  search?: string;
  instructor?: string;
  sort?: string;
}

/**
 * Publish Course Payload
 */
export interface PublishCoursePayload {
  publishedAt?: string;
}

/**
 * Unpublish Course Payload
 */
export interface UnpublishCoursePayload {
  reason?: string;
}

/**
 * Archive Course Payload
 */
export interface ArchiveCoursePayload {
  reason?: string;
  archivedAt?: string;
}

/**
 * Duplicate Course Payload
 */
export interface DuplicateCoursePayload {
  newTitle?: string;
  newCode: string;
  includeModules?: boolean;
  includeSettings?: boolean;
  targetProgram?: string;
  targetDepartment?: string;
}

/**
 * Duplicate Course Response
 */
export interface DuplicateCourseResponse {
  id: string;
  title: string;
  code: string;
  status: CourseStatus;
  moduleCount: number;
  sourceCourseId: string;
}

/**
 * Export Course Format
 */
export type ExportFormat = 'scorm1.2' | 'scorm2004' | 'xapi' | 'pdf' | 'json';

/**
 * Export Course Response
 */
export interface ExportCourseResponse {
  downloadUrl: string;
  filename: string;
  format: ExportFormat;
  size: number;
  expiresAt: string;
}

/**
 * Move Department Payload
 */
export interface MoveDepartmentPayload {
  department: string;
}

/**
 * Assign Program Payload
 */
export interface AssignProgramPayload {
  program: string | null;
}

/**
 * Publish/Unpublish/Archive Response
 */
export interface CourseStatusResponse {
  id: string;
  status: CourseStatus;
  publishedAt?: string | null;
  archivedAt?: string | null;
}

// =====================
// API RESPONSE TYPES
// =====================

export interface CoursesListResponse {
  courses: CourseListItem[];
  pagination: Pagination;
}

// =====================
// FORM DATA TYPES
// =====================

/**
 * Course Form Data
 * Used for creating/updating courses in forms
 */
export interface CourseFormData {
  title: string;
  code: string;
  description?: string;
  department: string;
  program?: string;
  credits?: number;
  duration?: number;
  instructors?: string[];
  settings?: Partial<CourseSettings>;
}

/**
 * Course Filters
 * Used for filtering course lists
 */
export interface CourseFiltersFormData extends CourseFilters {
  // Extends CourseFilters, can add additional UI-specific filters here if needed
}
