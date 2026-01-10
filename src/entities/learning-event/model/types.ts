/**
 * Learning Event Entity Types
 * Represents learner activities and system interactions
 */

/**
 * Learning event types based on backend contract
 */
export type LearningEventType =
  | 'enrollment'
  | 'content_started'
  | 'content_completed'
  | 'assessment_started'
  | 'assessment_completed'
  | 'module_completed'
  | 'course_completed'
  | 'achievement_earned'
  | 'login'
  | 'logout';

/**
 * Reference to a learner
 */
export interface LearnerReference {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

/**
 * Reference to a course
 */
export interface CourseReference {
  id: string;
  title: string;
  code: string;
}

/**
 * Reference to a class
 */
export interface ClassReference {
  id: string;
  name: string;
}

/**
 * Reference to content
 */
export interface ContentReference {
  id: string;
  title: string;
  type?: string;
}

/**
 * Reference to a module
 */
export interface ModuleReference {
  id: string;
  title: string;
  order?: number;
}

/**
 * Flexible metadata for event-specific data
 */
export type EventMetadata = Record<string, any>;

/**
 * Complete learning event object
 */
export interface LearningEvent {
  id: string;
  type: LearningEventType;
  learner: LearnerReference;
  course?: CourseReference;
  class?: ClassReference;
  content?: ContentReference;
  module?: ModuleReference;
  score?: number | null;
  duration?: number | null; // in seconds
  metadata?: EventMetadata;
  timestamp: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

/**
 * Form data for creating a learning event
 */
export interface CreateLearningEventData {
  type: LearningEventType;
  learnerId: string;
  courseId?: string;
  classId?: string;
  contentId?: string;
  moduleId?: string;
  score?: number;
  duration?: number;
  metadata?: EventMetadata;
  timestamp?: string; // ISO 8601
}

/**
 * Batch event creation request
 */
export interface BatchCreateEventsData {
  events: CreateLearningEventData[];
}

/**
 * Batch creation response
 */
export interface BatchCreateEventsResponse {
  created: number;
  failed: number;
  events: LearningEvent[];
  errors: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Query parameters for listing learning events
 */
export interface LearningEventsFilters {
  page?: number;
  limit?: number;
  learner?: string;
  type?: LearningEventType;
  course?: string;
  class?: string;
  dateFrom?: string; // ISO 8601
  dateTo?: string; // ISO 8601
  sort?: string;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * List response with events and pagination
 */
export interface LearningEventsListResponse {
  events: LearningEvent[];
  pagination: Pagination;
}

/**
 * Learner activity summary statistics
 */
export interface LearnerActivitySummary {
  totalEvents: number;
  coursesStarted: number;
  coursesCompleted: number;
  contentCompleted: number;
  averageScore: number | null;
  totalStudyTime: number; // in seconds
}

/**
 * Learner activity feed response
 */
export interface LearnerActivityResponse {
  learner: LearnerReference;
  events: LearningEvent[];
  summary: LearnerActivitySummary;
  pagination: Pagination;
}

/**
 * Course activity summary statistics
 */
export interface CourseActivitySummary {
  totalEvents: number;
  totalLearners: number;
  enrollments: number;
  completions: number;
  averageScore: number | null;
  averageCompletionTime: number | null; // in seconds
}

/**
 * Course activity feed response
 */
export interface CourseActivityResponse {
  course: CourseReference;
  events: LearningEvent[];
  summary: CourseActivitySummary;
  pagination: Pagination;
}

/**
 * Class activity summary statistics
 */
export interface ClassActivitySummary {
  totalEvents: number;
  totalLearners: number;
  enrollments: number;
  completions: number;
  averageScore: number | null;
  averageProgress: number; // percentage 0-100
}

/**
 * Class activity feed response
 */
export interface ClassActivityResponse {
  class: ClassReference & {
    course: CourseReference;
  };
  events: LearningEvent[];
  summary: ClassActivitySummary;
  pagination: Pagination;
}

/**
 * Event type breakdown
 */
export interface EventTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Completion rates
 */
export interface CompletionRates {
  courses: {
    started: number;
    completed: number;
    rate: number;
  };
  content: {
    started: number;
    completed: number;
    rate: number;
  };
  assessments: {
    started: number;
    completed: number;
    rate: number;
  };
}

/**
 * Top performer data
 */
export interface TopPerformer {
  learner: LearnerReference;
  averageScore: number;
  completedCount: number;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  averageScore: number | null;
  passRate: number | null;
  topPerformers: TopPerformer[];
}

/**
 * Timeline data point
 */
export interface TimelineDataPoint {
  period: string;
  date: string; // ISO 8601
  events: number;
  activeUsers: number;
  completions: number;
}

/**
 * Overall activity statistics
 */
export interface OverallStats {
  totalEvents: number;
  totalLearners: number;
  activeUsers: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  totalStudyTime: number;
  averageStudyTime: number;
}

/**
 * Activity statistics response
 */
export interface ActivityStatsResponse {
  period: {
    from: string;
    to: string;
  };
  overall: OverallStats;
  eventsByType: EventTypeBreakdown[];
  completionRates: CompletionRates;
  performance: PerformanceStats;
  timeline: TimelineDataPoint[];
}

/**
 * Query parameters for statistics
 */
export interface StatsFilters {
  dateFrom?: string;
  dateTo?: string;
  department?: string;
  course?: string;
  class?: string;
  groupBy?: 'day' | 'week' | 'month';
}
