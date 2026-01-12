/**
 * Learning Event API
 * API methods for learning event operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse } from '@/shared/api/types';
import type {
  LearningEvent,
  CreateLearningEventData,
  LearningEventsFilters,
  LearningEventsListResponse,
  LearnerActivityResponse,
  CourseActivityResponse,
  ClassActivityResponse,
  ActivityStatsResponse,
  StatsFilters,
  BatchCreateEventsResponse,
} from '../model/types';

export const learningEventApi = {
  /**
   * List learning events with filters and pagination
   */
  list: async (filters?: LearningEventsFilters): Promise<LearningEventsListResponse> => {
    const response = await client.get<ApiResponse<LearningEventsListResponse>>(
      endpoints.learningEvents.list,
      { params: filters }
    );
    return response.data.data;
  },

  /**
   * Get a single learning event by ID
   */
  getById: async (id: string): Promise<LearningEvent> => {
    const response = await client.get<ApiResponse<LearningEvent>>(
      endpoints.learningEvents.byId(id)
    );
    return response.data.data;
  },

  /**
   * Create a new learning event
   */
  create: async (data: CreateLearningEventData): Promise<LearningEvent> => {
    const response = await client.post<ApiResponse<LearningEvent>>(
      endpoints.learningEvents.create,
      data
    );
    return response.data.data;
  },

  /**
   * Create multiple learning events in a batch
   */
  createBatch: async (events: CreateLearningEventData[]): Promise<BatchCreateEventsResponse> => {
    const response = await client.post<ApiResponse<BatchCreateEventsResponse>>(
      endpoints.learningEvents.createBatch,
      { events }
    );
    return response.data.data;
  },

  /**
   * Get learner's activity feed with events and summary
   */
  getLearnerActivity: async (
    learnerId: string,
    filters?: Omit<LearningEventsFilters, 'learner'>
  ): Promise<LearnerActivityResponse> => {
    const response = await client.get<ApiResponse<LearnerActivityResponse>>(
      endpoints.learningEvents.learnerActivity(learnerId),
      { params: filters }
    );
    return response.data.data;
  },

  /**
   * Get course activity feed with events and summary
   */
  getCourseActivity: async (
    courseId: string,
    filters?: Omit<LearningEventsFilters, 'course'>
  ): Promise<CourseActivityResponse> => {
    const response = await client.get<ApiResponse<CourseActivityResponse>>(
      endpoints.learningEvents.courseActivity(courseId),
      { params: filters }
    );
    return response.data.data;
  },

  /**
   * Get class activity feed with events and summary
   */
  getClassActivity: async (
    classId: string,
    filters?: Omit<LearningEventsFilters, 'class'>
  ): Promise<ClassActivityResponse> => {
    const response = await client.get<ApiResponse<ClassActivityResponse>>(
      endpoints.learningEvents.classActivity(classId),
      { params: filters }
    );
    return response.data.data;
  },

  /**
   * Get activity statistics and metrics
   */
  getStats: async (filters?: StatsFilters): Promise<ActivityStatsResponse> => {
    const response = await client.get<ApiResponse<ActivityStatsResponse>>(
      endpoints.learningEvents.stats,
      { params: filters }
    );
    return response.data.data;
  },
};
