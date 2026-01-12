/**
 * Lesson API
 * API methods for lesson operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { Lesson, LessonListItem, LessonFormData } from '../model/types';
import type { ApiResponse } from '@/shared/api/types';

export const lessonApi = {
  /**
   * Get all lessons for a course
   */
  getByCourseId: async (courseId: string): Promise<Lesson[]> => {
    const response = await client.get<ApiResponse<Lesson[]>>(
      `${endpoints.courses.list}/${courseId}/lessons`
    );
    return response.data.data;
  },

  /**
   * Get a single lesson by ID
   */
  getById: async (courseId: string, lessonId: string): Promise<Lesson> => {
    const response = await client.get<ApiResponse<Lesson>>(
      `${endpoints.courses.list}/${courseId}/lessons/${lessonId}`
    );
    return response.data.data;
  },

  /**
   * Get lesson list items (lightweight)
   */
  getListByCourseId: async (courseId: string): Promise<LessonListItem[]> => {
    const response = await client.get<ApiResponse<LessonListItem[]>>(
      `${endpoints.courses.list}/${courseId}/lessons/list`
    );
    return response.data.data;
  },

  /**
   * Create a new lesson
   */
  create: async (courseId: string, data: LessonFormData): Promise<Lesson> => {
    const response = await client.post<ApiResponse<Lesson>>(
      `${endpoints.courses.list}/${courseId}/lessons`,
      data
    );
    return response.data.data;
  },

  /**
   * Update an existing lesson
   */
  update: async (
    courseId: string,
    lessonId: string,
    data: Partial<LessonFormData>
  ): Promise<Lesson> => {
    const response = await client.put<ApiResponse<Lesson>>(
      `${endpoints.courses.list}/${courseId}/lessons/${lessonId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a lesson
   */
  delete: async (courseId: string, lessonId: string): Promise<void> => {
    await client.delete(`${endpoints.courses.list}/${courseId}/lessons/${lessonId}`);
  },

  /**
   * Reorder lessons
   */
  reorder: async (
    courseId: string,
    lessons: Array<{ lessonId: string; order: number }>
  ): Promise<Lesson[]> => {
    const response = await client.post<ApiResponse<Lesson[]>>(
      `${endpoints.courses.list}/${courseId}/lessons/reorder`,
      { lessons }
    );
    return response.data.data;
  },

  /**
   * Get next lesson for a user
   */
  getNext: async (courseId: string, currentLessonId?: string): Promise<Lesson | null> => {
    const response = await client.get<ApiResponse<Lesson | null>>(
      `${endpoints.courses.list}/${courseId}/lessons/next`,
      {
        params: { currentLessonId },
      }
    );
    return response.data.data;
  },
};
