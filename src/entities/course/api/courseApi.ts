/**
 * Course API
 * API functions for course-related operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { PaginatedResponse, QueryParams } from '@/shared/api/types';
import type {
  Course,
  CreateCourseInput,
  UpdateCourseInput,
  CourseQueryParams,
} from '../model/types';

/**
 * Fetch a list of courses
 */
export async function getCourses(
  params?: CourseQueryParams
): Promise<PaginatedResponse<Course>> {
  const queryParams: QueryParams = {
    page: params?.page,
    pageSize: params?.pageSize,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    search: params?.search,
    filters: params?.categoryId ||
      params?.instructorId ||
      params?.status ||
      params?.skillLevel ||
      params?.enrolled !== undefined
      ? {
          ...(params?.categoryId && { categoryId: params.categoryId }),
          ...(params?.instructorId && { instructorId: params.instructorId }),
          ...(params?.status && { status: params.status }),
          ...(params?.skillLevel && { skillLevel: params.skillLevel }),
          ...(params?.enrolled !== undefined && { enrolled: params.enrolled }),
        }
      : undefined,
  };

  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(queryParams).filter(([, value]) => value !== undefined)
  );

  if (cleanParams.filters) {
    cleanParams.filters = Object.fromEntries(
      Object.entries(cleanParams.filters).filter(([, value]) => value !== undefined)
    );
    if (Object.keys(cleanParams.filters).length === 0) {
      delete cleanParams.filters;
    }
  }

  const response = await client.get<PaginatedResponse<Course>>(
    endpoints.courses.list,
    { params: cleanParams }
  );

  return response.data;
}

/**
 * Fetch a single course by ID
 */
export async function getCourse(id: string): Promise<Course> {
  const response = await client.get<Course>(endpoints.courses.byId(id));
  return response.data;
}

/**
 * Create a new course
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const response = await client.post<Course>(endpoints.courses.list, input);
  return response.data;
}

/**
 * Update an existing course
 */
export async function updateCourse(
  id: string,
  input: UpdateCourseInput
): Promise<Course> {
  const response = await client.put<Course>(endpoints.courses.byId(id), input);
  return response.data;
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<void> {
  await client.delete(endpoints.courses.byId(id));
}

/**
 * Enroll in a course
 */
export async function enrollInCourse(courseId: string): Promise<{
  enrollmentId: string;
  message: string;
}> {
  const response = await client.post<{ enrollmentId: string; message: string }>(
    endpoints.courses.enroll(courseId)
  );
  return response.data;
}

/**
 * Unenroll from a course
 */
export async function unenrollFromCourse(courseId: string): Promise<void> {
  await client.post(endpoints.courses.unenroll(courseId));
}

/**
 * Get course progress for the current user
 */
export async function getCourseProgress(courseId: string): Promise<{
  courseId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string;
}> {
  const response = await client.get<{
    courseId: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    lastAccessedAt: string;
  }>(endpoints.courses.progress(courseId));
  return response.data;
}

/**
 * Get enrolled courses for the current user
 */
export async function getEnrolledCourses(
  params?: CourseQueryParams
): Promise<PaginatedResponse<Course>> {
  return getCourses({ ...params, enrolled: true });
}
