/**
 * Course API
 * API methods for course operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { Course, CourseListItem, CourseFormData } from '../model/types';
import type { ApiResponse, PaginatedResponse } from '@/shared/api/types';

export const courseApi = {
  /**
   * Get all courses (with pagination and filters)
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    level?: string;
    search?: string;
  }): Promise<PaginatedResponse<CourseListItem>> => {
    const response = await client.get<ApiResponse<PaginatedResponse<CourseListItem>>>(
      endpoints.courses.list,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get a single course by ID
   */
  getById: async (id: string): Promise<Course> => {
    const response = await client.get<ApiResponse<Course>>(`${endpoints.courses.list}/${id}`);
    return response.data.data;
  },

  /**
   * Get courses for the current user (enrolled courses)
   */
  getMyCourses: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<CourseListItem>> => {
    const response = await client.get<ApiResponse<PaginatedResponse<CourseListItem>>>(
      endpoints.courses.myCourses,
      { params }
    );
    return response.data.data;
  },

  /**
   * Create a new course
   */
  create: async (data: CourseFormData): Promise<Course> => {
    const response = await client.post<ApiResponse<Course>>(endpoints.courses.list, data);
    return response.data.data;
  },

  /**
   * Update an existing course
   */
  update: async (id: string, data: Partial<CourseFormData>): Promise<Course> => {
    const response = await client.put<ApiResponse<Course>>(
      `${endpoints.courses.list}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a course
   */
  delete: async (id: string): Promise<void> => {
    await client.delete(`${endpoints.courses.list}/${id}`);
  },

  /**
   * Publish a course
   */
  publish: async (id: string): Promise<Course> => {
    const response = await client.post<ApiResponse<Course>>(
      `${endpoints.courses.list}/${id}/publish`
    );
    return response.data.data;
  },

  /**
   * Unpublish a course
   */
  unpublish: async (id: string): Promise<Course> => {
    const response = await client.post<ApiResponse<Course>>(
      `${endpoints.courses.list}/${id}/unpublish`
    );
    return response.data.data;
  },

  /**
   * Get course statistics
   */
  getStats: async (id: string): Promise<{
    enrollmentCount: number;
    completionCount: number;
    averageProgress: number;
    averageScore: number;
    averageTimeSpent: number;
  }> => {
    const response = await client.get(`${endpoints.courses.list}/${id}/stats`);
    return response.data.data;
  },
};
