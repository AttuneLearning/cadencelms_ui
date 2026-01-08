/**
 * Course entity types
 * Defines core course types and interfaces for the LMS
 */

/**
 * Course status enum
 */
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Course difficulty level
 */
export enum CourseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * Course category
 */
export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
}

/**
 * Course instructor information
 */
export interface CourseInstructor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  title?: string;
  bio?: string;
}

/**
 * Course statistics
 */
export interface CourseStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageRating?: number;
  totalReviews?: number;
}

/**
 * Course metadata
 */
export interface CourseMetadata {
  duration: number; // in minutes
  lessonsCount: number;
  skillLevel: CourseDifficulty;
  language: string;
  lastUpdated: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
}

/**
 * Main Course interface
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  status: CourseStatus;
  instructor: CourseInstructor;
  category: CourseCategory;
  metadata: CourseMetadata;
  stats: CourseStats;
  createdAt: string;
  updatedAt: string;
  isEnrolled?: boolean;
  enrollmentId?: string;
  progress?: number; // 0-100
}

/**
 * Course creation input
 */
export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  categoryId: string;
  duration: number;
  skillLevel: CourseDifficulty;
  language?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
}

/**
 * Course update input
 */
export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  status?: CourseStatus;
}

/**
 * Course list query parameters
 */
export interface CourseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  instructorId?: string;
  status?: CourseStatus;
  skillLevel?: CourseDifficulty;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'enrollments' | 'rating';
  sortOrder?: 'asc' | 'desc';
  enrolled?: boolean;
}

/**
 * Course list filter options
 */
export interface CourseFilters {
  categories?: CourseCategory[];
  instructors?: CourseInstructor[];
  skillLevels?: CourseDifficulty[];
  statuses?: CourseStatus[];
}

/**
 * Enrollment information
 */
export interface CourseEnrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  lastAccessedAt?: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  completedAt?: string;
}

/**
 * Course with enrollment details
 */
export interface EnrolledCourse extends Course {
  enrollment: CourseEnrollment;
}
