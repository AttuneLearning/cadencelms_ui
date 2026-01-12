/**
 * Class Entity Types
 * Represents a specific instance of a course (class session)
 */

export type ClassStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type InstructorRole = 'primary' | 'secondary';
export type EnrollmentStatus = 'active' | 'withdrawn' | 'completed';

/**
 * Instructor information
 */
export interface ClassInstructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: InstructorRole;
  profileImage?: string | null;
}

/**
 * Instructor assignment for create/update
 */
export interface InstructorAssignment {
  userId: string;
  role: InstructorRole;
}

/**
 * Course reference
 */
export interface ClassCourse {
  id: string;
  title: string;
  code: string;
  description?: string;
  credits?: number;
}

/**
 * Program reference
 */
export interface ClassProgram {
  id: string;
  name: string;
  code?: string;
}

/**
 * Program level reference
 */
export interface ClassProgramLevel {
  id: string;
  name: string;
  levelNumber: number;
}

/**
 * Academic term reference
 */
export interface ClassAcademicTerm {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Department reference
 */
export interface ClassDepartment {
  id: string;
  name: string;
  code?: string;
}

/**
 * Learner information
 */
export interface ClassLearner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string | null;
  profileImage?: string | null;
}

/**
 * Full class details
 */
export interface Class {
  id: string;
  name: string;
  course: ClassCourse;
  program: ClassProgram;
  programLevel?: ClassProgramLevel;
  instructors: ClassInstructor[];
  startDate: string;
  endDate: string;
  duration: number;
  capacity: number | null;
  enrolledCount: number;
  waitlistCount?: number;
  academicTerm?: ClassAcademicTerm;
  status: ClassStatus;
  department: ClassDepartment;
  createdAt: string;
  updatedAt: string;
}

/**
 * Class list item (lighter version)
 */
export interface ClassListItem {
  id: string;
  name: string;
  course: {
    id: string;
    title: string;
    code: string;
  };
  program: {
    id: string;
    name: string;
  };
  programLevel?: {
    id: string;
    name: string;
    levelNumber: number;
  };
  instructors: ClassInstructor[];
  startDate: string;
  endDate: string;
  duration: number;
  capacity: number | null;
  enrolledCount: number;
  academicTerm?: {
    id: string;
    name: string;
  };
  status: ClassStatus;
  department: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Create class payload
 */
export interface CreateClassPayload {
  name: string;
  course: string;
  program: string;
  programLevel?: string;
  instructors: InstructorAssignment[];
  startDate: string;
  endDate: string;
  duration?: number;
  capacity?: number | null;
  academicTerm?: string;
}

/**
 * Update class payload
 */
export interface UpdateClassPayload {
  name?: string;
  instructors?: InstructorAssignment[];
  startDate?: string;
  endDate?: string;
  duration?: number;
  capacity?: number | null;
  academicTerm?: string;
  status?: ClassStatus;
}

/**
 * Class filters for list endpoint
 */
export interface ClassFilters {
  page?: number;
  limit?: number;
  course?: string;
  program?: string;
  instructor?: string;
  status?: ClassStatus;
  department?: string;
  term?: string;
  search?: string;
  sort?: string;
}

/**
 * Class enrollment
 */
export interface ClassEnrollment {
  id: string;
  learner: ClassLearner;
  enrolledAt: string;
  status: EnrollmentStatus;
  withdrawnAt?: string | null;
  completedAt?: string | null;
}

/**
 * Enroll learners payload
 */
export interface EnrollLearnersPayload {
  learnerIds: string[];
  enrolledAt?: string;
}

/**
 * Enrollment result with errors
 */
export interface EnrollmentResult {
  classId: string;
  enrollments: ClassEnrollment[];
  successCount: number;
  failedCount: number;
  errors: Array<{
    learnerId: string;
    reason: string;
  }>;
}

/**
 * Learner progress information
 */
export interface LearnerProgress {
  completionPercent: number;
  modulesCompleted: number;
  modulesTotal: number;
  currentScore: number | null;
  lastAccessedAt: string | null;
}

/**
 * Learner attendance information
 */
export interface LearnerAttendance {
  sessionsAttended: number;
  totalSessions: number;
  attendanceRate: number;
}

/**
 * Roster item with progress
 */
export interface RosterItem {
  enrollmentId: string;
  learner: ClassLearner;
  enrolledAt: string;
  status: EnrollmentStatus;
  progress?: LearnerProgress;
  attendance?: LearnerAttendance;
}

/**
 * Class roster response
 */
export interface ClassRoster {
  classId: string;
  className: string;
  totalEnrolled: number;
  roster: RosterItem[];
}

/**
 * Module progress breakdown
 */
export interface ModuleProgress {
  moduleId: string;
  title: string;
  order: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  averageScore: number | null;
  averageAttempts: number;
  averageTimeSpent: number;
}

/**
 * Progress distribution
 */
export interface ProgressDistribution {
  '0-25': number;
  '26-50': number;
  '51-75': number;
  '76-100': number;
}

/**
 * Score distribution
 */
export interface ScoreDistribution {
  'A (90-100)': number;
  'B (80-89)': number;
  'C (70-79)': number;
  'D (60-69)': number;
  'F (0-59)': number;
}

/**
 * Class progress summary
 */
export interface ClassProgress {
  classId: string;
  className: string;
  totalLearners: number;
  activeEnrollments: number;
  averageProgress: number;
  averageScore: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  averageTimeSpent: number;
  byModule: ModuleProgress[];
  progressDistribution: ProgressDistribution;
  scoreDistribution: ScoreDistribution;
}

/**
 * Class stats (summary)
 */
export interface ClassStats {
  enrolledCount: number;
  capacity: number | null;
  availableSeats: number | null;
  waitlistCount: number;
  completionRate: number;
  averageScore: number;
}

/**
 * Pagination metadata
 */
export interface ClassPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated classes list response
 */
export interface ClassesListResponse {
  classes: ClassListItem[];
  pagination: ClassPagination;
}

/**
 * Paginated enrollments list response
 */
export interface ClassEnrollmentsResponse {
  classId: string;
  enrollments: ClassEnrollment[];
  pagination: ClassPagination;
}

/**
 * Delete class response
 */
export interface DeleteClassResponse {
  id: string;
  deleted: boolean;
  deletedAt: string;
}

/**
 * Drop enrollment response
 */
export interface DropEnrollmentResponse {
  enrollmentId: string;
  status: 'withdrawn';
  withdrawnAt: string;
}
