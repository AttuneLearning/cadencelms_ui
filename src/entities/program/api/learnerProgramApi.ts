/**
 * Learner Program API Client
 * Learner-specific endpoints for program viewing and progress
 */

import { client } from '@/shared/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Learner Program with Progress
 * Extended program information for learner view
 */
export interface LearnerProgram {
  id: string;
  name: string;
  code: string;
  description: string;
  credential: 'certificate' | 'diploma' | 'degree';
  duration: number;
  durationUnit: 'hours' | 'weeks' | 'months' | 'years';
  department: {
    id: string;
    name: string;
  };
  enrollment: {
    id: string;
    status: 'active' | 'completed' | 'withdrawn';
    enrolledAt: string;
    completedAt: string | null;
    progress: number;
  };
  coursesCompleted: number;
  coursesTotal: number;
  certificate?: {
    enabled: boolean;
    title?: string;
  };
}

/**
 * Program Course Item
 * Course information within a program for learners
 */
export interface ProgramCourseItem {
  id: string;
  title: string;
  code: string;
  description: string;
  order: number;
  level: {
    id: string;
    name: string;
    levelNumber: number;
  };
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  prerequisiteMet: boolean;
  enrollment?: {
    id: string;
    progress: number;
    enrolledAt: string;
    completedAt: string | null;
  };
  prerequisites: string[];
}

/**
 * Program Enrollment Progress
 */
export interface ProgramEnrollmentProgress {
  enrollmentId: string;
  programId: string;
  overallProgress: number;
  coursesCompleted: number;
  coursesTotal: number;
  courses: Array<{
    courseId: string;
    status: 'completed' | 'in-progress' | 'locked' | 'available';
    progress: number;
  }>;
}

export interface LearnerProgramDetail {
  id: string;
  name: string;
  code: string;
  description: string;
  credential: 'certificate' | 'diploma' | 'degree';
  duration: number;
  durationUnit: 'hours' | 'weeks' | 'months' | 'years';
  department: {
    id: string;
    name: string;
  };
  enrollment?: {
    id: string;
    status: 'active' | 'completed' | 'withdrawn';
    enrolledAt: string;
    completedAt: string | null;
    progress: number;
  };
  courses: ProgramCourseItem[];
  certificate?: {
    enabled: boolean;
    title?: string;
    issued?: boolean;
    issuedAt?: string;
  };
  statistics: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    overallProgress: number;
  };
}

/**
 * My Programs Response
 */
export interface MyProgramsResponse {
  programs: LearnerProgram[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * GET /enrollments/my/programs - List learner's enrolled programs
 */
export async function getMyPrograms(params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'withdrawn';
}): Promise<MyProgramsResponse> {
  const response = await client.get<ApiResponse<MyProgramsResponse>>(
    '/enrollments/my/programs',
    { params }
  );
  return response.data.data;
}

/**
 * GET /programs/:id/learner - Get program detail for learner with progress
 */
export async function getProgramForLearner(id: string): Promise<LearnerProgramDetail> {
  const response = await client.get<ApiResponse<LearnerProgramDetail>>(
    `/programs/${id}/learner`
  );
  return response.data.data;
}

/**
 * POST /programs/:id/enroll - Enroll the current learner in a program
 */
export async function enrollProgram(programId: string): Promise<{ enrollmentId: string }> {
  const response = await client.post<ApiResponse<{ enrollmentId: string }>>(
    `/programs/${programId}/enroll`
  );
  return response.data.data;
}

/**
 * GET /enrollments/:enrollmentId/progress - Get program enrollment progress
 */
export async function getProgramEnrollmentProgress(
  enrollmentId: string
): Promise<ProgramEnrollmentProgress> {
  const response = await client.get<ApiResponse<ProgramEnrollmentProgress>>(
    `/enrollments/${enrollmentId}/progress`
  );
  return response.data.data;
}
