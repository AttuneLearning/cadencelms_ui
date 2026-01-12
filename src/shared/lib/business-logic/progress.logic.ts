/**
 * Progress Business Logic
 * Platform-agnostic logic for progress tracking and calculations
 */

export interface LessonProgressData {
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  timeSpent: number;
  attempts: number;
}

export const ProgressLogic = {
  /**
   * Calculate overall course progress from lesson progress
   */
  calculateCourseProgress(lessons: LessonProgressData[]): number {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter((l) => l.status === 'completed').length;
    return Math.round((completed / lessons.length) * 100);
  },

  /**
   * Calculate average score across completed lessons
   */
  calculateAverageScore(lessons: LessonProgressData[]): number {
    const completedWithScores = lessons.filter(
      (l) => l.status === 'completed' && l.score !== undefined
    );
    if (completedWithScores.length === 0) return 0;
    const total = completedWithScores.reduce((sum, l) => sum + (l.score || 0), 0);
    return Math.round(total / completedWithScores.length);
  },

  /**
   * Calculate total time spent across all lessons
   */
  calculateTotalTimeSpent(lessons: LessonProgressData[]): number {
    return lessons.reduce((sum, l) => sum + l.timeSpent, 0);
  },

  /**
   * Determine if lesson passed based on score and passing threshold
   */
  isPassed(score: number, passingScore: number): boolean {
    return score >= passingScore;
  },

  /**
   * Calculate learning streak
   */
  calculateStreak(activityDates: Date[]): number {
    if (activityDates.length === 0) return 0;

    const sortedDates = activityDates
      .map((d) => new Date(d.toDateString()))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 1;
    let currentDate = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
      const diffDays = Math.floor(
        (currentDate.getTime() - sortedDates[i].getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streak++;
        currentDate = sortedDates[i];
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  },

  /**
   * Format time in seconds to human-readable string
   */
  formatTimeSpent(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },
};
