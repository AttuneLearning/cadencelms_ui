/**
 * Progress Entity Types
 * Represents a user's progress in lessons and courses
 */

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed' | 'failed';

export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  status: ProgressStatus;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  timeSpent?: number; // in seconds
  score?: number; // 0-100
  attempts?: number;
  maxAttempts?: number;
  isPassed?: boolean;
  metadata?: {
    bookmarks?: Array<{
      time: number;
      note?: string;
    }>;
    notes?: string;
    lastPosition?: number; // For video/document progress
  };
}

export interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  status: ProgressStatus;
  progress: number; // 0-100
  score?: number;
  attempts?: number;
  timeSpent?: number;
  lastAccessedAt?: string;
  completedAt?: string;
}

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  overallProgress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  timeSpent: number;
  lastAccessedAt?: string;
  startedAt?: string;
  estimatedCompletionDate?: string;
  lessons: LessonProgress[];
}

export interface ProgressUpdate {
  status?: ProgressStatus;
  score?: number;
  timeSpent?: number;
  lastPosition?: number;
  metadata?: Record<string, unknown>;
}

export interface ProgressStats {
  totalLessonsCompleted: number;
  totalTimeSpent: number; // in seconds
  averageScore: number;
  coursesInProgress: number;
  coursesCompleted: number;
  currentStreak: number; // days
  longestStreak: number; // days
}
