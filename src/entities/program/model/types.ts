/**
 * Program Entity Types
 * Generated from: /contracts/api/programs.contract.ts v1.0.0
 *
 * Types for program management including programs, levels, courses, and enrollments.
 */

export type ProgramStatus = 'active' | 'inactive' | 'archived';
export type ProgramCredential = 'certificate' | 'diploma' | 'degree';
export type DurationUnit = 'hours' | 'weeks' | 'months' | 'years';

/**
 * Pagination metadata for list responses
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
 * Program List Item
 * Program information used in list views
 */
export interface ProgramListItem {
  id: string;
  name: string;
  code: string;
  description: string;
  department: {
    id: string;
    name: string;
    level?: number;
  };
  credential: ProgramCredential;
  duration: number;
  durationUnit: DurationUnit;
  isPublished: boolean;
  status: ProgramStatus;
  totalLevels: number;
  totalCourses: number;
  activeEnrollments: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Program Level Info
 * Level information included in program details
 */
export interface ProgramLevel {
  id: string;
  name: string;
  levelNumber: number;
  courseCount: number;
}

/**
 * Program Statistics
 * Statistics included in program details
 */
export interface ProgramStatistics {
  totalLevels: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

/**
 * Program Details
 * Full program information with relationships and statistics
 */
export interface Program {
  id: string;
  name: string;
  code: string;
  description: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  credential: ProgramCredential;
  duration: number;
  durationUnit: DurationUnit;
  isPublished: boolean;
  status: ProgramStatus;
  levels: ProgramLevel[];
  statistics: ProgramStatistics;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Program Filters
 * Used for filtering program lists
 */
export interface ProgramFilters {
  page?: number;
  limit?: number;
  department?: string;
  includeSubdepartments?: boolean;
  status?: ProgramStatus;
  search?: string;
  sort?: string;
}

/**
 * Programs List Response
 */
export interface ProgramsListResponse {
  programs: ProgramListItem[];
  pagination: Pagination;
}

/**
 * Create Program Payload
 */
export interface CreateProgramPayload {
  name: string;
  code: string;
  description?: string;
  department: string;
  credential: ProgramCredential;
  duration: number;
  durationUnit: DurationUnit;
  isPublished?: boolean;
}

/**
 * Update Program Payload
 */
export interface UpdateProgramPayload {
  name?: string;
  code?: string;
  description?: string;
  credential?: ProgramCredential;
  duration?: number;
  durationUnit?: DurationUnit;
  isPublished?: boolean;
  status?: ProgramStatus;
}

/**
 * Program Level Detail
 * Full level information from levels endpoint
 */
export interface ProgramLevelDetail {
  id: string;
  name: string;
  levelNumber: number;
  description: string;
  courses: {
    id: string;
    title: string;
    code: string;
    isPublished: boolean;
  }[];
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Program Levels Response
 */
export interface ProgramLevelsResponse {
  programId: string;
  programName: string;
  levels: ProgramLevelDetail[];
}

/**
 * Program Enrollment Filters
 */
export interface ProgramEnrollmentFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'withdrawn';
  search?: string;
}

/**
 * Program Enrollment Item
 */
export interface ProgramEnrollment {
  id: string;
  learner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
  credentialGoal: ProgramCredential;
  status: 'active' | 'completed' | 'withdrawn';
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  withdrawnAt: string | null;
  coursesCompleted: number;
  coursesTotal: number;
}

/**
 * Program Enrollments Response
 */
export interface ProgramEnrollmentsResponse {
  programId: string;
  programName: string;
  enrollments: ProgramEnrollment[];
  pagination: Pagination;
}

/**
 * Program Form Data
 * Used for creating/updating programs in forms
 */
export interface ProgramFormData extends CreateProgramPayload {
  // Extends CreateProgramPayload, can add additional UI-specific fields here if needed
}
