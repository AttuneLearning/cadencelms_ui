/**
 * Progress Entity Types
 * Based on backend contract: progress.contract.ts v1.0.0
 * Represents learner progress across programs, courses, and modules
 */

// =====================
// COMMON TYPES
// =====================

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type ModuleType = 'scorm' | 'custom' | 'exercise' | 'video' | 'document';
export type AssessmentType = 'quiz' | 'exam' | 'assignment';
export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed' | 'grading';
export type ActivityType = 'started' | 'accessed' | 'progress' | 'completed';
export type AssignmentStatus = 'not_submitted' | 'submitted' | 'graded' | 'late';
export type AchievementType = 'program_completion' | 'course_completion' | 'perfect_score' | 'streak' | 'milestone';
export type RecentActivityType = 'course_started' | 'module_completed' | 'assessment_submitted' | 'program_completed';

// =====================
// PROGRAM PROGRESS
// =====================

export interface ProgramProgress {
  programId: string;
  programName: string;
  programCode: string;
  learnerId: string;
  learnerName: string;
  enrolledAt: string;
  status: ProgressStatus;
  overallProgress: {
    completionPercent: number;
    creditsEarned: number;
    creditsRequired: number;
    coursesCompleted: number;
    coursesTotal: number;
    timeSpent: number;
    lastActivityAt: string | null;
    estimatedCompletionDate: string | null;
  };
  levelProgress: LevelProgress[];
  courseProgress: CourseProgressItem[];
  milestones: Milestone[];
}

export interface LevelProgress {
  levelId: string;
  levelName: string;
  levelNumber: number;
  status: ProgressStatus;
  coursesCompleted: number;
  coursesTotal: number;
  completionPercent: number;
}

export interface CourseProgressItem {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  levelId: string;
  levelNumber: number;
  status: ProgressStatus;
  completionPercent: number;
  score: number | null;
  creditsEarned: number;
  timeSpent: number;
  enrolledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  achievedAt: string | null;
  progress: number;
}

// =====================
// COURSE PROGRESS
// =====================

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  learnerId: string;
  learnerName: string;
  enrolledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  status: ProgressStatus;
  overallProgress: {
    completionPercent: number;
    modulesCompleted: number;
    modulesTotal: number;
    score: number | null;
    timeSpent: number;
    lastAccessedAt: string | null;
    daysActive: number;
    streak: number;
  };
  moduleProgress: ModuleProgress[];
  assessments: Assessment[];
  activityLog: ActivityLogEntry[];
}

export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  moduleType: ModuleType;
  order: number;
  status: ProgressStatus;
  completionPercent: number;
  score: number | null;
  timeSpent: number;
  attempts: number;
  bestAttemptScore: number | null;
  lastAttemptScore: number | null;
  startedAt: string | null;
  completedAt: string | null;
  lastAccessedAt: string | null;
  isRequired: boolean;
  passingScore: number | null;
  passed: boolean | null;
}

export interface Assessment {
  assessmentId: string;
  title: string;
  type: AssessmentType;
  status: AssessmentStatus;
  score: number | null;
  maxScore: number;
  passingScore: number;
  passed: boolean | null;
  attempts: number;
  maxAttempts: number | null;
  lastAttemptAt: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
}

export interface ActivityLogEntry {
  timestamp: string;
  eventType: ActivityType;
  moduleId: string | null;
  moduleTitle: string | null;
  details: string;
}

// =====================
// CLASS PROGRESS
// =====================

export interface ClassProgress {
  classId: string;
  className: string;
  courseId: string;
  courseTitle: string;
  learnerId: string;
  learnerName: string;
  enrolledAt: string;
  status: ProgressStatus;
  courseProgress: {
    completionPercent: number;
    modulesCompleted: number;
    modulesTotal: number;
    score: number | null;
    timeSpent: number;
    lastAccessedAt: string | null;
  };
  attendance: {
    sessionsAttended: number;
    totalSessions: number;
    attendanceRate: number;
    sessions: AttendanceSession[];
  };
  assignments: Assignment[];
}

export interface AttendanceSession {
  sessionId: string;
  sessionDate: string;
  sessionTitle: string;
  attended: boolean;
  markedAt: string | null;
  markedBy: string | null;
  notes: string | null;
}

export interface Assignment {
  assignmentId: string;
  title: string;
  dueDate: string;
  status: AssignmentStatus;
  submittedAt: string | null;
  grade: number | null;
  maxGrade: number;
  feedback: string | null;
  isLate: boolean;
}

// =====================
// LEARNER PROGRESS
// =====================

export interface LearnerProgress {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  summary: {
    programsEnrolled: number;
    programsCompleted: number;
    coursesEnrolled: number;
    coursesCompleted: number;
    classesEnrolled: number;
    totalCreditsEarned: number;
    totalTimeSpent: number;
    averageScore: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityAt: string | null;
    joinedAt: string;
  };
  programProgress: LearnerProgramProgress[];
  courseProgress: LearnerCourseProgress[];
  recentActivity: RecentActivity[];
  achievements: Achievement[];
}

export interface LearnerProgramProgress {
  programId: string;
  programName: string;
  programCode: string;
  status: ProgressStatus;
  completionPercent: number;
  creditsEarned: number;
  creditsRequired: number;
  enrolledAt: string;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface LearnerCourseProgress {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  programId: string | null;
  programName: string | null;
  status: ProgressStatus;
  completionPercent: number;
  score: number | null;
  creditsEarned: number;
  enrolledAt: string;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

export interface RecentActivity {
  timestamp: string;
  activityType: RecentActivityType;
  resourceId: string;
  resourceType: 'course' | 'module' | 'assessment' | 'program';
  resourceTitle: string;
  details: string;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description: string;
  earnedAt: string;
  badge: string | null;
}

// =====================
// UPDATE PROGRESS
// =====================

export interface UpdateProgressRequest {
  learnerId: string;
  enrollmentId: string;
  moduleId?: string;
  action: 'mark_complete' | 'mark_incomplete' | 'override_score' | 'reset_progress';
  score?: number;
  reason: string;
  notifyLearner?: boolean;
}

export interface UpdateProgressResponse {
  enrollmentId: string;
  moduleId: string | null;
  action: string;
  previousProgress: number;
  newProgress: number;
  previousScore: number | null;
  newScore: number | null;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
    role: string;
  };
}

// =====================
// PROGRESS REPORTS
// =====================

export interface ProgressSummaryFilters {
  programId?: string;
  courseId?: string;
  classId?: string;
  departmentId?: string;
  status?: ProgressStatus;
  startDate?: string;
  endDate?: string;
  minProgress?: number;
  maxProgress?: number;
  page?: number;
  limit?: number;
}

export interface ProgressSummaryResponse {
  filters: {
    programId: string | null;
    courseId: string | null;
    classId: string | null;
    departmentId: string | null;
    status: string | null;
    dateRange: {
      start: string | null;
      end: string | null;
    };
  };
  summary: {
    totalLearners: number;
    averageProgress: number;
    averageScore: number;
    completedCount: number;
    inProgressCount: number;
    notStartedCount: number;
    totalTimeSpent: number;
  };
  learners: ProgressSummaryLearner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProgressSummaryLearner {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  enrolledAt: string;
  status: ProgressStatus;
  completionPercent: number;
  score: number | null;
  timeSpent: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
}

export interface DetailedProgressReportFilters {
  programId?: string;
  courseId?: string;
  classId?: string;
  departmentId?: string;
  learnerIds?: string[];
  format?: 'json' | 'csv' | 'xlsx';
  includeModules?: boolean;
  includeAssessments?: boolean;
  includeAttendance?: boolean;
}

export interface DetailedProgressReport {
  reportId: string;
  generatedAt: string;
  generatedBy: {
    id: string;
    name: string;
  };
  filters: {
    programId: string | null;
    courseId: string | null;
    classId: string | null;
    departmentId: string | null;
    learnerIds: string[];
  };
  learnerDetails: DetailedLearnerProgress[];
  downloadUrl: string | null;
}

export interface DetailedLearnerProgress {
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  studentId: string | null;
  department: {
    id: string;
    name: string;
  };
  enrolledAt: string;
  overallProgress: {
    completionPercent: number;
    score: number | null;
    timeSpent: number;
    status: ProgressStatus;
  };
  moduleProgress: ModuleProgress[];
  assessmentResults: AssessmentResult[];
  attendance: {
    sessionsAttended: number;
    totalSessions: number;
    attendanceRate: number;
  };
}

export interface AssessmentResult {
  assessmentId: string;
  title: string;
  type: string;
  score: number | null;
  maxScore: number;
  passed: boolean | null;
  attempts: number;
  submittedAt: string | null;
  gradedAt: string | null;
}

// =====================
// API RESPONSE TYPES
// =====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// QUERY FILTERS
// =====================

export interface ProgressQueryOptions {
  learnerId?: string;
}

/**
 * Progress Statistics Summary
 * Aggregated statistics for progress dashboard widgets
 */
export interface ProgressStats {
  totalLessonsCompleted: number;
  totalTimeSpent: number; // in seconds
  averageScore: number; // 0-100
  coursesInProgress: number;
  coursesCompleted: number;
  currentStreak: number; // days
  longestStreak: number; // days
}
