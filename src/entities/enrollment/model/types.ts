/**
 * Enrollment Entity Types
 * Generated from: /contracts/api/enrollments.contract.ts v1.0.0
 *
 * Types for enrollment management including programs, courses, and classes.
 */

// =====================
// SHARED TYPES
// =====================

export type EnrollmentStatus = 'active' | 'completed' | 'withdrawn' | 'suspended' | 'expired';
export type EnrollmentType = 'program' | 'course' | 'class';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// NESTED REFERENCE TYPES
// =====================

/**
 * Learner Reference
 */
export interface LearnerRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
}

/**
 * Target Reference (Program/Course/Class)
 */
export interface TargetRef {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: EnrollmentType;
}

/**
 * Department Reference
 */
export interface DepartmentRef {
  id: string;
  name: string;
  code?: string;
}

/**
 * Progress Information
 */
export interface Progress {
  percentage: number;
  completedItems: number;
  totalItems: number;
  lastActivityAt?: string | null;
}

/**
 * Module Progress (for detailed view)
 */
export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  status: 'not-started' | 'in-progress' | 'completed';
  percentage: number;
  completedAt: string | null;
}

/**
 * Detailed Progress with Module Breakdown
 */
export interface DetailedProgress extends Progress {
  moduleProgress?: ModuleProgress[];
}

/**
 * Grade Information
 */
export interface Grade {
  score: number | null;
  letter: string | null;
  passed: boolean | null;
  gradedAt?: string | null;
  gradedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

/**
 * Attendance Information (for class enrollments)
 */
export interface Attendance {
  sessionsAttended: number;
  totalSessions: number;
  attendanceRate: number;
}

// =====================
// ENROLLMENT TYPES
// =====================

/**
 * Enrollment List Item
 */
export interface EnrollmentListItem {
  id: string;
  type: EnrollmentType;
  learner: LearnerRef;
  target: TargetRef;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  withdrawnAt: string | null;
  expiresAt: string | null;
  progress: Progress;
  grade: Grade;
  department: DepartmentRef;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enrollment Detail
 */
export interface Enrollment extends EnrollmentListItem {
  progress: DetailedProgress;
  notes?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Program Enrollment (specific structure for program enrollments)
 */
export interface ProgramEnrollment {
  id: string;
  type: 'program';
  learner: LearnerRef;
  program: {
    id: string;
    name: string;
    code: string;
    levels: number;
    department: DepartmentRef;
  };
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  withdrawnAt: string | null;
  expiresAt: string | null;
  progress: Progress;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course Enrollment (specific structure for course enrollments)
 */
export interface CourseEnrollment {
  id: string;
  type: 'course';
  learner: LearnerRef;
  course: {
    id: string;
    title: string;
    code: string;
    modules: number;
    department: DepartmentRef;
  };
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  withdrawnAt: string | null;
  expiresAt: string | null;
  progress: Progress;
  createdAt: string;
  updatedAt: string;
}

/**
 * Class Enrollment (specific structure for class enrollments)
 */
export interface ClassEnrollment {
  id: string;
  type: 'class';
  learner: LearnerRef;
  class: {
    id: string;
    name: string;
    course: {
      id: string;
      title: string;
      code: string;
    };
    instructor: {
      id: string;
      firstName: string;
      lastName: string;
    };
    schedule: {
      startDate: string;
      endDate: string;
      capacity: number;
      enrolled: number;
    };
    department: DepartmentRef;
  };
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  withdrawnAt: string | null;
  expiresAt: string;
  progress: Progress;
  createdAt: string;
  updatedAt: string;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

/**
 * Enroll in Program Payload
 */
export interface EnrollProgramPayload {
  learnerId: string;
  programId: string;
  enrolledAt?: string;
  expiresAt?: string;
}

/**
 * Enroll in Course Payload
 */
export interface EnrollCoursePayload {
  learnerId: string;
  courseId: string;
  enrolledAt?: string;
  expiresAt?: string;
}

/**
 * Enroll in Class Payload
 */
export interface EnrollClassPayload {
  learnerId: string;
  classId: string;
  enrolledAt?: string;
}

/**
 * Update Enrollment Status Payload
 */
export interface UpdateEnrollmentStatusPayload {
  status: Exclude<EnrollmentStatus, 'expired'>;
  reason?: string;
  grade?: {
    score: number;
    letter: string;
    passed: boolean;
  };
}

/**
 * Withdraw from Enrollment Payload
 */
export interface WithdrawEnrollmentPayload {
  reason?: string;
}

/**
 * Enrollment Query Filters
 */
export interface EnrollmentFilters {
  page?: number;
  limit?: number;
  learner?: string;
  program?: string;
  course?: string;
  class?: string;
  status?: EnrollmentStatus;
  type?: EnrollmentType;
  department?: string;
  enrolledAfter?: string;
  enrolledBefore?: string;
  sort?: string;
}

// =====================
// API RESPONSE TYPES
// =====================

/**
 * List Enrollments Response
 */
export interface EnrollmentsListResponse {
  enrollments: EnrollmentListItem[];
  pagination: Pagination;
}

/**
 * Enrollment Statistics
 */
export interface EnrollmentStats {
  total: number;
  active: number;
  completed: number;
  withdrawn: number;
  averageProgress: number;
  completionRate: number;
  averageScore?: number;
  averageAttendance?: number;
  capacity?: number;
  seatsAvailable?: number;
}

/**
 * Program Enrollments Response
 */
export interface ProgramEnrollmentsResponse {
  program: {
    id: string;
    name: string;
    code: string;
  };
  enrollments: Array<{
    id: string;
    learner: LearnerRef;
    status: EnrollmentStatus;
    enrolledAt: string;
    completedAt: string | null;
    progress: Progress;
    grade: Grade;
  }>;
  pagination: Pagination;
  stats: EnrollmentStats;
}

/**
 * Course Enrollments Response
 */
export interface CourseEnrollmentsResponse {
  course: {
    id: string;
    title: string;
    code: string;
  };
  enrollments: Array<{
    id: string;
    learner: LearnerRef;
    status: EnrollmentStatus;
    enrolledAt: string;
    completedAt: string | null;
    progress: Progress & {
      lastActivityAt?: string | null;
    };
    grade: Grade;
  }>;
  pagination: Pagination;
  stats: EnrollmentStats;
}

/**
 * Class Enrollments Response
 */
export interface ClassEnrollmentsResponse {
  class: {
    id: string;
    name: string;
    course: {
      id: string;
      title: string;
      code: string;
    };
    schedule: {
      startDate: string;
      endDate: string;
      capacity: number;
    };
  };
  enrollments: Array<{
    id: string;
    learner: LearnerRef;
    status: EnrollmentStatus;
    enrolledAt: string;
    completedAt: string | null;
    progress: Progress & {
      lastActivityAt?: string | null;
    };
    grade: Grade;
    attendance: Attendance;
  }>;
  pagination: Pagination;
  stats: EnrollmentStats;
}

/**
 * Update Status Response
 */
export interface UpdateStatusResponse {
  id: string;
  status: EnrollmentStatus;
  completedAt: string | null;
  withdrawnAt: string | null;
  grade: Grade;
  updatedAt: string;
}

/**
 * Withdraw Response
 */
export interface WithdrawResponse {
  id: string;
  status: 'withdrawn';
  withdrawnAt: string;
  finalGrade: {
    score: number | null;
    letter: string | null;
  };
}

/**
 * Enrollment With Course Details
 * Extended enrollment type with rich course information
 * Used by UI components that need detailed course data
 */
export interface EnrollmentWithCourse {
  _id: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledAt: string;
  lastAccessedAt?: string;
  expiresAt?: string;
  isCertificateIssued?: boolean;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    shortDescription?: string;
    lessonCount?: number;
    duration?: number;
    level?: string;
  };
}
