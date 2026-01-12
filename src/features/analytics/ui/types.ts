/**
 * Types for Analytics feature
 */

export interface AnalyticsFiltersType {
  dateRange?: 'today' | 'last7Days' | 'last30Days' | 'last90Days' | 'lastYear' | 'custom';
  startDate?: string;
  endDate?: string;
  courseId?: string;
  classId?: string;
  studentCohort?: string;
}

export interface MetricsData {
  totalStudents: number;
  avgCompletion: number;
  avgScore: number;
  avgSessionDuration: number;
}

export interface CourseMetrics {
  courseId: string;
  courseName: string;
  totalEnrolled: number;
  completed: number;
  completionRate: number;
  avgProgress: number;
}

export interface EngagementMetrics {
  date: string;
  activeStudents: number;
  avgTimeSpent: number;
  totalSessions: number;
}

export interface PerformanceData {
  courseId: string;
  courseName: string;
  avgScore: number;
  passRate: number;
  totalAttempts: number;
}

export interface ContentMetrics {
  contentType: string;
  completionRate: number;
  avgTimeSpent: number;
  avgRating: number;
}
