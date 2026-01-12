/**
 * Mock data for learning events
 */

import type {
  LearningEvent,
  LearningEventType,
  CreateLearningEventData,
  LearningEventsListResponse,
  LearnerActivityResponse,
  CourseActivityResponse,
  ClassActivityResponse,
  ActivityStatsResponse,
  BatchCreateEventsResponse,
} from '@/entities/learning-event/model/types';

/**
 * Create a mock learning event
 */
export function createMockLearningEvent(
  overrides?: Partial<LearningEvent>
): LearningEvent {
  return {
    id: '507f1f77bcf86cd799439020',
    type: 'content_completed',
    learner: {
      id: '507f1f77bcf86cd799439011',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    },
    course: {
      id: '507f1f77bcf86cd799439012',
      title: 'Introduction to Programming',
      code: 'CS101',
    },
    class: {
      id: '507f1f77bcf86cd799439013',
      name: 'CS101 - Spring 2026',
    },
    content: {
      id: '507f1f77bcf86cd799439014',
      title: 'Variables and Data Types',
      type: 'scorm',
    },
    module: {
      id: '507f1f77bcf86cd799439015',
      title: 'Module 1: Basics',
      order: 1,
    },
    score: 95.5,
    duration: 1800,
    metadata: {
      attemptId: '507f1f77bcf86cd799439016',
      completionPercentage: 100,
      interactions: 15,
    },
    timestamp: '2026-01-08T14:30:00.000Z',
    createdAt: '2026-01-08T14:30:00.000Z',
    updatedAt: '2026-01-08T14:30:00.000Z',
    ...overrides,
  };
}

/**
 * Mock learning events array
 */
export const mockLearningEvents: LearningEvent[] = [
  createMockLearningEvent({
    id: '1',
    type: 'content_completed',
    timestamp: '2026-01-08T14:30:00.000Z',
    score: 95.5,
  }),
  createMockLearningEvent({
    id: '2',
    type: 'module_completed',
    timestamp: '2026-01-08T14:35:00.000Z',
    score: null,
    content: undefined,
  }),
  createMockLearningEvent({
    id: '3',
    type: 'assessment_completed',
    timestamp: '2026-01-08T15:00:00.000Z',
    score: 88.0,
    duration: 2400,
  }),
  createMockLearningEvent({
    id: '4',
    type: 'enrollment',
    timestamp: '2026-01-01T09:00:00.000Z',
    score: null,
    duration: null,
    content: undefined,
    module: undefined,
  }),
  createMockLearningEvent({
    id: '5',
    type: 'login',
    timestamp: '2026-01-08T08:00:00.000Z',
    score: null,
    duration: null,
    content: undefined,
    module: undefined,
    course: undefined,
    class: undefined,
  }),
];

/**
 * Mock create learning event data
 */
export const mockCreateLearningEventData: CreateLearningEventData = {
  type: 'content_completed',
  learnerId: '507f1f77bcf86cd799439011',
  courseId: '507f1f77bcf86cd799439012',
  classId: '507f1f77bcf86cd799439013',
  contentId: '507f1f77bcf86cd799439014',
  moduleId: '507f1f77bcf86cd799439015',
  score: 88.5,
  duration: 2400,
  metadata: {
    source: 'manual_entry',
    notes: 'Offline workshop completion',
  },
  timestamp: '2026-01-08T10:00:00.000Z',
};

/**
 * Mock list response
 */
export const mockLearningEventsListResponse: LearningEventsListResponse = {
  events: mockLearningEvents,
  pagination: {
    page: 1,
    limit: 20,
    total: mockLearningEvents.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

/**
 * Mock learner activity response
 */
export const mockLearnerActivityResponse: LearnerActivityResponse = {
  learner: {
    id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  },
  events: mockLearningEvents,
  summary: {
    totalEvents: 45,
    coursesStarted: 3,
    coursesCompleted: 1,
    contentCompleted: 28,
    averageScore: 87.3,
    totalStudyTime: 86400,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 45,
    totalPages: 3,
    hasNext: true,
    hasPrev: false,
  },
};

/**
 * Mock course activity response
 */
export const mockCourseActivityResponse: CourseActivityResponse = {
  course: {
    id: '507f1f77bcf86cd799439012',
    title: 'Introduction to Programming',
    code: 'CS101',
  },
  events: mockLearningEvents,
  summary: {
    totalEvents: 342,
    totalLearners: 45,
    enrollments: 45,
    completions: 12,
    averageScore: 83.7,
    averageCompletionTime: 172800,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 342,
    totalPages: 18,
    hasNext: true,
    hasPrev: false,
  },
};

/**
 * Mock class activity response
 */
export const mockClassActivityResponse: ClassActivityResponse = {
  class: {
    id: '507f1f77bcf86cd799439013',
    name: 'CS101 - Spring 2026',
    course: {
      id: '507f1f77bcf86cd799439012',
      title: 'Introduction to Programming',
      code: 'CS101',
    },
  },
  events: mockLearningEvents,
  summary: {
    totalEvents: 156,
    totalLearners: 25,
    enrollments: 25,
    completions: 8,
    averageScore: 85.2,
    averageProgress: 42.5,
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 156,
    totalPages: 8,
    hasNext: true,
    hasPrev: false,
  },
};

/**
 * Mock activity statistics response
 */
export const mockActivityStatsResponse: ActivityStatsResponse = {
  period: {
    from: '2026-01-01T00:00:00.000Z',
    to: '2026-01-08T23:59:59.999Z',
  },
  overall: {
    totalEvents: 1842,
    totalLearners: 156,
    activeUsers: 142,
    dailyActiveUsers: 89,
    weeklyActiveUsers: 142,
    monthlyActiveUsers: 156,
    totalStudyTime: 2592000,
    averageStudyTime: 18254,
  },
  eventsByType: [
    { type: 'content_completed', count: 564, percentage: 30.6 },
    { type: 'content_started', count: 612, percentage: 33.2 },
    { type: 'assessment_completed', count: 234, percentage: 12.7 },
    { type: 'login', count: 312, percentage: 16.9 },
    { type: 'module_completed', count: 89, percentage: 4.8 },
    { type: 'course_completed', count: 31, percentage: 1.7 },
  ],
  completionRates: {
    courses: {
      started: 45,
      completed: 31,
      rate: 68.9,
    },
    content: {
      started: 612,
      completed: 564,
      rate: 92.2,
    },
    assessments: {
      started: 267,
      completed: 234,
      rate: 87.6,
    },
  },
  performance: {
    averageScore: 84.3,
    passRate: 91.2,
    topPerformers: [
      {
        learner: {
          id: '507f1f77bcf86cd799439011',
          firstName: 'John',
          lastName: 'Doe',
        },
        averageScore: 96.5,
        completedCount: 28,
      },
      {
        learner: {
          id: '507f1f77bcf86cd799439022',
          firstName: 'Jane',
          lastName: 'Smith',
        },
        averageScore: 94.8,
        completedCount: 32,
      },
    ],
  },
  timeline: [
    {
      period: '2026-01-08',
      date: '2026-01-08T00:00:00.000Z',
      events: 287,
      activeUsers: 89,
      completions: 78,
    },
    {
      period: '2026-01-07',
      date: '2026-01-07T00:00:00.000Z',
      events: 245,
      activeUsers: 82,
      completions: 64,
    },
  ],
};

/**
 * Mock batch create response
 */
export const mockBatchCreateEventsResponse: BatchCreateEventsResponse = {
  created: 2,
  failed: 0,
  events: [
    createMockLearningEvent({
      id: '507f1f77bcf86cd799439020',
      type: 'content_completed',
    }),
    createMockLearningEvent({
      id: '507f1f77bcf86cd799439021',
      type: 'module_completed',
    }),
  ],
  errors: [],
};

/**
 * Mock batch create with partial failure
 */
export const mockBatchCreateWithErrorsResponse: BatchCreateEventsResponse = {
  created: 1,
  failed: 1,
  events: [
    createMockLearningEvent({
      id: '507f1f77bcf86cd799439020',
      type: 'content_completed',
    }),
  ],
  errors: [
    {
      index: 1,
      error: 'Learner not found',
    },
  ],
};
