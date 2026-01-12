/**
 * Lesson Entity Types
 * Represents a lesson within a course
 */

export type LessonType = 'video' | 'scorm' | 'document' | 'quiz' | 'assignment';
export type LessonStatus = 'draft' | 'published';

export interface Lesson {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  type: LessonType;
  order: number;
  duration?: number; // Duration in minutes
  status: LessonStatus;
  contentId?: string;
  scormPackageId?: string;
  videoUrl?: string;
  documentUrl?: string;
  isRequired: boolean;
  passingScore?: number; // For quizzes
  maxAttempts?: number;
  createdAt: string;
  updatedAt: string;
  isLocked?: boolean; // Based on prerequisites
}

export interface LessonListItem {
  _id: string;
  title: string;
  type: LessonType;
  order: number;
  duration?: number;
  isRequired: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  progress?: number; // 0-100
}

export interface LessonFormData {
  title: string;
  description?: string;
  type: LessonType;
  order: number;
  duration?: number;
  isRequired: boolean;
  passingScore?: number;
  maxAttempts?: number;
}
