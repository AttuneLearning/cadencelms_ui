/**
 * Class API
 * API methods for class operations (course instances)
 */

import { client } from '@/shared/api/client';
import type {
  Class,
  ClassesListResponse,
  CreateClassPayload,
  UpdateClassPayload,
  ClassFilters,
  ClassEnrollmentsResponse,
  EnrollLearnersPayload,
  EnrollmentResult,
  ClassRoster,
  ClassProgress,
  DeleteClassResponse,
  DropEnrollmentResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const BASE_URL = '/classes';

/**
 * List all classes with optional filtering
 */
export async function listClasses(filters?: ClassFilters): Promise<ClassesListResponse> {
  const response = await client.get<ApiResponse<ClassesListResponse>>(BASE_URL, {
    params: filters,
  });
  return response.data.data;
}

/**
 * Get a single class by ID
 */
export async function getClass(id: string): Promise<Class> {
  const response = await client.get<ApiResponse<Class>>(`${BASE_URL}/${id}`);
  return response.data.data;
}

/**
 * Create a new class
 */
export async function createClass(payload: CreateClassPayload): Promise<Class> {
  const response = await client.post<ApiResponse<Class>>(
    BASE_URL,
    payload
  );
  return response.data.data;
}

/**
 * Update an existing class
 */
export async function updateClass(id: string, payload: UpdateClassPayload): Promise<Class> {
  const response = await client.put<ApiResponse<Class>>(
    `${BASE_URL}/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * Delete a class
 */
export async function deleteClass(id: string, force?: boolean): Promise<DeleteClassResponse> {
  const response = await client.delete<ApiResponse<DeleteClassResponse>>(
    `${BASE_URL}/${id}`,
    {
      params: { force },
    }
  );
  return response.data.data;
}

/**
 * Get class roster with learner details and progress
 */
export async function getClassRoster(
  id: string,
  params?: {
    includeProgress?: boolean;
    status?: 'active' | 'withdrawn' | 'completed';
  }
): Promise<ClassRoster> {
  const response = await client.get<ApiResponse<ClassRoster>>(
    `${BASE_URL}/${id}/roster`,
    {
      params,
    }
  );
  return response.data.data;
}

/**
 * Enroll learners in a class
 */
export async function addLearnersToClass(
  id: string,
  payload: EnrollLearnersPayload
): Promise<EnrollmentResult> {
  const response = await client.post<ApiResponse<EnrollmentResult>>(
    `${BASE_URL}/${id}/enrollments`,
    payload
  );
  return response.data.data;
}

/**
 * Remove a learner from a class (drop enrollment)
 */
export async function removeLearnerFromClass(
  id: string,
  enrollmentId: string,
  reason?: string
): Promise<DropEnrollmentResponse> {
  const response = await client.delete<ApiResponse<DropEnrollmentResponse>>(
    `${BASE_URL}/${id}/enrollments/${enrollmentId}`,
    {
      params: { reason },
    }
  );
  return response.data.data;
}

/**
 * Get class progress summary and analytics
 */
export async function getClassProgress(id: string): Promise<ClassProgress> {
  const response = await client.get<ApiResponse<ClassProgress>>(
    `${BASE_URL}/${id}/progress`
  );
  return response.data.data;
}

/**
 * Get class enrollments list
 */
export async function getClassEnrollments(
  id: string,
  params?: {
    status?: 'active' | 'withdrawn' | 'completed';
    page?: number;
    limit?: number;
  }
): Promise<ClassEnrollmentsResponse> {
  const response = await client.get<ApiResponse<ClassEnrollmentsResponse>>(
    `${BASE_URL}/${id}/enrollments`,
    {
      params,
    }
  );
  return response.data.data;
}

/**
 * Get class statistics (helper function)
 */
export async function getClassStats(id: string) {
  const classData = await getClass(id);
  return {
    enrolledCount: classData.enrolledCount,
    capacity: classData.capacity,
    availableSeats: classData.capacity ? classData.capacity - classData.enrolledCount : null,
    waitlistCount: classData.waitlistCount || 0,
    completionRate: 0, // Would come from progress data
    averageScore: 0, // Would come from progress data
  };
}
