/**
 * Course Segment Entity Types
 * Represents modules/units within a course
 */

export type CourseSegmentType = 'scorm' | 'custom' | 'exercise' | 'video' | 'document';

export interface CourseSegmentSettings {
  allowMultipleAttempts: boolean;
  maxAttempts: number | null;
  timeLimit: number | null;
  showFeedback: boolean;
  shuffleQuestions: boolean;
}

export interface CourseSegment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string | null;
  order: number;
  type: CourseSegmentType;
  contentId: string | null;
  content?: any;
  settings: CourseSegmentSettings;
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

export interface CourseSegmentListItem {
  id: string;
  title: string;
  description: string | null;
  order: number;
  type: CourseSegmentType;
  contentId: string | null;
  settings: CourseSegmentSettings;
  isPublished: boolean;
  passingScore: number | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseSegmentPayload {
  title: string;
  description?: string;
  order: number;
  type: CourseSegmentType;
  contentId?: string;
  settings?: Partial<CourseSegmentSettings>;
  isPublished?: boolean;
  passingScore?: number;
  duration?: number;
}

export interface UpdateCourseSegmentPayload {
  title?: string;
  description?: string;
  type?: CourseSegmentType;
  contentId?: string;
  settings?: Partial<CourseSegmentSettings>;
  isPublished?: boolean;
  passingScore?: number;
  duration?: number;
}

export interface CourseSegmentFilters {
  includeUnpublished?: boolean;
  sort?: 'order' | 'title' | 'createdAt';
}

export interface CourseSegmentsListResponse {
  courseId: string;
  courseTitle: string;
  modules: CourseSegmentListItem[];
  totalModules: number;
}

export interface ReorderCourseSegmentsPayload {
  moduleIds: string[];
}

export interface ReorderCourseSegmentsResponse {
  courseId: string;
  modules: Array<{
    id: string;
    title: string;
    oldOrder: number;
    newOrder: number;
  }>;
  totalReordered: number;
}

export interface DeleteCourseSegmentResponse {
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
