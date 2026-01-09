/**
 * Learner Management Entity Types
 * Generated from: /contracts/api/learners.contract.ts v1.0.0
 *
 * Types for learner user management endpoints.
 */

export type LearnerStatus = 'active' | 'withdrawn' | 'completed' | 'suspended';

/**
 * Address information
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Department summary in learner context
 */
export interface LearnerDepartment {
  id: string;
  name: string;
  code?: string;
}

/**
 * Learner summary for list view
 */
export interface LearnerSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  status: LearnerStatus;
  department: {
    id: string;
    name: string;
  };
  programEnrollments: number;
  courseEnrollments: number;
  completionRate: number;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Program enrollment details
 */
export interface ProgramEnrollment {
  id: string;
  programId: string;
  programName: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'withdrawn';
  progress: number;
}

/**
 * Course enrollment details
 */
export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseName: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'withdrawn';
  progress: number;
  score: number | null;
}

/**
 * Learner statistics
 */
export interface LearnerStatistics {
  totalProgramEnrollments: number;
  totalCourseEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  completionRate: number;
  averageScore: number;
  totalTimeSpent: number;
  lastActivityAt: string | null;
}

/**
 * Detailed learner profile
 */
export interface LearnerDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  role: 'learner';
  status: LearnerStatus;
  department: LearnerDepartment;
  phone: string | null;
  dateOfBirth: string | null;
  address: Address | null;
  enrollments: {
    programs: ProgramEnrollment[];
    courses: CourseEnrollment[];
  };
  statistics: LearnerStatistics;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
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
 * List learners request parameters
 */
export interface ListLearnersParams {
  page?: number;
  limit?: number;
  search?: string;
  program?: string;
  status?: LearnerStatus;
  department?: string;
  sort?: string;
}

/**
 * List learners response
 */
export interface ListLearnersResponse {
  learners: LearnerSummary[];
  pagination: Pagination;
}

/**
 * Register learner request payload
 */
export interface RegisterLearnerPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;
  department?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
}

/**
 * Learner response (for register/update operations)
 */
export interface LearnerResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string | null;
  role: 'learner';
  status: LearnerStatus;
  department: {
    id: string;
    name: string;
  };
  phone: string | null;
  dateOfBirth: string | null;
  address: Address | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Update learner request payload
 */
export interface UpdateLearnerPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  studentId?: string;
  department?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
  status?: 'active' | 'suspended';
}

/**
 * Delete learner response
 */
export interface DeleteLearnerResponse {
  id: string;
  status: 'withdrawn';
  deletedAt: string;
}
