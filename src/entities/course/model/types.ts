/**
 * Course Entity Types
 * Represents a learning course in the LMS
 */

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  status: CourseStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  duration?: number; // Duration in minutes
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  isPublished: boolean;
  publishedAt?: string;
  lessonCount?: number;
  enrollmentCount?: number;
  completionRate?: number;
}

export interface CourseListItem {
  _id: string;
  title: string;
  shortDescription?: string;
  thumbnail?: string;
  duration?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  lessonCount?: number;
  enrollmentCount?: number;
  isEnrolled?: boolean;
  progress?: number; // 0-100
}

export interface CourseFormData {
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  level?: string;
  search?: string;
}
