/**
 * Course Module Entity Types
 * Represents modules/units within a course
 */

// API-supported module types
// Note: 'assessment' type will be added per specs/ASSESSMENT_MODULE_SPEC.md
export type CourseModuleType = 'scorm' | 'custom' | 'exercise' | 'video' | 'document';

export interface CourseModuleSettings {
  allowMultipleAttempts: boolean;
  maxAttempts: number | null;
  timeLimit: number | null;
  showFeedback: boolean;
  shuffleQuestions: boolean;
}

export interface CourseModule {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string | null;
  order: number;
  type: CourseModuleType;
  contentId: string | null;
  content?: any;
  settings: CourseModuleSettings;
  isPublished: boolean;
  passingScore: number | null;
  duration: number | null;
  prerequisites: string[];
  completionCount: number;
  averageScore: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CourseModuleLessonItem {
  id: string;
  contentId: string | null;
  order: number;
  title: string;
  type: CourseModuleType;
  duration: number | null;
  isPublished: boolean;
}

export interface CourseModuleListItem {
  id: string;
  title: string;
  description: string | null;
  order: number;
  type: CourseModuleType;
  contentId: string | null;
  lessons?: CourseModuleLessonItem[];
  settings: CourseModuleSettings;
  isPublished: boolean;
  passingScore: number | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseModulePayload {
  title: string;
  description?: string;
  order: number;
  type: CourseModuleType;
  contentId?: string;
  settings?: Partial<CourseModuleSettings>;
  isPublished?: boolean;
  passingScore?: number;
  duration?: number;
}

export interface UpdateCourseModulePayload {
  title?: string;
  description?: string;
  type?: CourseModuleType;
  contentId?: string;
  settings?: Partial<CourseModuleSettings>;
  isPublished?: boolean;
  passingScore?: number;
  duration?: number;
}

export interface CourseModuleFilters {
  includeUnpublished?: boolean;
  sort?: 'order' | 'title' | 'createdAt';
}

export interface CourseModulesListResponse {
  courseId: string;
  courseTitle: string;
  modules: CourseModuleListItem[];
  totalModules: number;
}

export interface ReorderCourseModulesPayload {
  moduleIds: string[];
}

export interface ReorderCourseModulesResponse {
  courseId: string;
  modules: Array<{
    id: string;
    title: string;
    oldOrder: number;
    newOrder: number;
  }>;
  totalReordered: number;
}

export interface DeleteCourseModuleResponse {
  id: string;
  title: string;
  deletedAt: string;
  affectedModules: number;
  reorderedModules: Array<{
    id: string;
    title: string;
    oldOrder: number;
    newOrder: number;
  }>;
}
