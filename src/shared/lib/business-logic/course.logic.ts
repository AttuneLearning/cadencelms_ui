/**
 * Course Business Logic
 * Platform-agnostic business logic for course operations
 * Can be shared between web and mobile applications
 */

export interface CourseProgress {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export const CourseLogic = {
  /**
   * Calculate course progress percentage
   */
  calculateProgress(completedLessons: number, totalLessons: number): number {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  },

  /**
   * Check if course is completed
   */
  isCompleted(progress: number): boolean {
    return progress >= 100;
  },

  /**
   * Calculate estimated completion time
   */
  estimateCompletionTime(
    totalDuration: number,
    progress: number,
    timeSpent: number
  ): number {
    if (progress === 0) return totalDuration;
    const averageSpeed = timeSpent / progress;
    const remainingProgress = 100 - progress;
    return Math.round(averageSpeed * remainingProgress);
  },

  /**
   * Determine if user can access lesson
   */
  canAccessLesson(
    lessonOrder: number,
    completedLessons: number[],
    isSequential: boolean
  ): boolean {
    if (!isSequential) return true;
    if (lessonOrder === 1) return true;
    return completedLessons.includes(lessonOrder - 1);
  },

  /**
   * Validate enrollment eligibility
   */
  canEnroll(
    courseStatus: string,
    maxEnrollments?: number,
    currentEnrollments?: number
  ): { eligible: boolean; reason?: string } {
    if (courseStatus !== 'published') {
      return { eligible: false, reason: 'Course is not published' };
    }
    if (maxEnrollments && currentEnrollments && currentEnrollments >= maxEnrollments) {
      return { eligible: false, reason: 'Course is full' };
    }
    return { eligible: true };
  },
};
