/**
 * Enrollment API
 * API methods for enrollment operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  Enrollment,
  EnrollmentWithCourse,
  EnrollmentFormData,
  EnrollmentStats,
} from '../model/types';
import type { ApiResponse, PaginatedResponse } from '@/shared/api/types';

export const enrollmentApi = {
  /**
   * Get all enrollments for the current user
   */
  getMyEnrollments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<EnrollmentWithCourse>> => {
    const response = await client.get<ApiResponse<PaginatedResponse<EnrollmentWithCourse>>>(
      endpoints.enrollments.list,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get a single enrollment by ID
   */
  getById: async (id: string): Promise<Enrollment> => {
    const response = await client.get<ApiResponse<Enrollment>>(
      `${endpoints.enrollments.list}/${id}`
    );
    return response.data.data;
  },

  /**
   * Get enrollment for a specific course
   */
  getByCourseId: async (courseId: string): Promise<Enrollment | null> => {
    const response = await client.get<ApiResponse<Enrollment | null>>(
      `${endpoints.enrollments.list}/course/${courseId}`
    );
    return response.data.data;
  },

  /**
   * Enroll in a course
   */
  enroll: async (data: EnrollmentFormData): Promise<Enrollment> => {
    const response = await client.post<ApiResponse<Enrollment>>(
      endpoints.enrollments.list,
      data
    );
    return response.data.data;
  },

  /**
   * Unenroll from a course
   */
  unenroll: async (enrollmentId: string): Promise<void> => {
    await client.delete(`${endpoints.enrollments.list}/${enrollmentId}`);
  },

  /**
   * Update enrollment status
   */
  updateStatus: async (
    enrollmentId: string,
    status: 'active' | 'completed' | 'dropped'
  ): Promise<Enrollment> => {
    const response = await client.patch<ApiResponse<Enrollment>>(
      `${endpoints.enrollments.list}/${enrollmentId}/status`,
      { status }
    );
    return response.data.data;
  },

  /**
   * Get enrollment statistics
   */
  getStats: async (): Promise<EnrollmentStats> => {
    const response = await client.get<ApiResponse<EnrollmentStats>>(
      `${endpoints.enrollments.list}/stats`
    );
    return response.data.data;
  },

  /**
   * Check if user is enrolled in a course
   */
  checkEnrollment: async (courseId: string): Promise<{ isEnrolled: boolean; enrollment?: Enrollment }> => {
    const response = await client.get<ApiResponse<{ isEnrolled: boolean; enrollment?: Enrollment }>>(
      `${endpoints.enrollments.list}/check/${courseId}`
    );
    return response.data.data;
  },
};
