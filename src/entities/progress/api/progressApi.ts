/**
 * Progress API
 * API methods for progress tracking operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  Progress,
  CourseProgress,
  LessonProgress,
  ProgressUpdate,
  ProgressStats,
} from '../model/types';
import type { ApiResponse } from '@/shared/api/types';

export const progressApi = {
  /**
   * Get progress for a specific lesson
   */
  getLessonProgress: async (courseId: string, lessonId: string): Promise<Progress | null> => {
    const response = await client.get<ApiResponse<Progress | null>>(
      `${endpoints.courses.list}/${courseId}/lessons/${lessonId}/progress`
    );
    return response.data.data;
  },

  /**
   * Get progress for all lessons in a course
   */
  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await client.get<ApiResponse<CourseProgress>>(
      `${endpoints.courses.list}/${courseId}/progress`
    );
    return response.data.data;
  },

  /**
   * Update progress for a lesson
   */
  updateLessonProgress: async (
    courseId: string,
    lessonId: string,
    data: ProgressUpdate
  ): Promise<Progress> => {
    const response = await client.post<ApiResponse<Progress>>(
      `${endpoints.courses.list}/${courseId}/lessons/${lessonId}/progress`,
      data
    );
    return response.data.data;
  },

  /**
   * Mark lesson as started
   */
  startLesson: async (courseId: string, lessonId: string): Promise<Progress> => {
    const response = await client.post<ApiResponse<Progress>>(
      `${endpoints.courses.list}/${courseId}/lessons/${lessonId}/progress/start`
    );
    return response.data.data;
  },

  /**
   * Mark lesson as completed
   */
  completeLesson: async (
    courseId: string,
    lessonId: string,
    data?: { score?: number; timeSpent?: number }
  ): Promise<Progress> => {
    const response = await client.post<ApiResponse<Progress>>(
      `${endpoints.courses.list}/${courseId}/lessons/${lessonId}/progress/complete`,
      data
    );
    return response.data.data;
  },

  /**
   * Get overall progress statistics
   */
  getStats: async (): Promise<ProgressStats> => {
    const response = await client.get<ApiResponse<ProgressStats>>(
      endpoints.progress.stats || '/api/v2/progress/stats'
    );
    return response.data.data;
  },

  /**
   * Get progress for multiple lessons
   */
  getBatchProgress: async (
    courseId: string,
    lessonIds: string[]
  ): Promise<Record<string, LessonProgress>> => {
    const response = await client.post<ApiResponse<Record<string, LessonProgress>>>(
      `${endpoints.courses.list}/${courseId}/progress/batch`,
      { lessonIds }
    );
    return response.data.data;
  },

  /**
   * Reset progress for a lesson
   */
  resetLessonProgress: async (courseId: string, lessonId: string): Promise<void> => {
    await client.delete(
      `${endpoints.courses.list}/${courseId}/lessons/${lessonId}/progress`
    );
  },
};
