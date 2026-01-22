/**
 * Mock course segment data for testing
 */

import type {
  CourseModule,
  CourseModuleListItem,
  CreateCourseModulePayload,
  UpdateCourseModulePayload,
  CourseModuleSettings,
  CourseModuleType,
} from '@/entities/course-module/model/types';

// Default settings
const defaultSettings: CourseModuleSettings = {
  allowMultipleAttempts: true,
  maxAttempts: null,
  timeLimit: null,
  showFeedback: true,
  shuffleQuestions: false,
};

// Mock course segments list items
export const mockCourseModulesList: CourseModuleListItem[] = [
  {
    id: 'segment-1',
    title: 'Introduction to TypeScript',
    description: 'Learn the basics of TypeScript and type safety',
    order: 1,
    type: 'video',
    contentId: 'content-video-1',
    settings: defaultSettings,
    isPublished: true,
    passingScore: 70,
    duration: 1800, // 30 minutes
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'segment-2',
    title: 'SCORM Package - React Basics',
    description: 'Interactive SCORM module for learning React',
    order: 2,
    type: 'scorm',
    contentId: 'content-scorm-1',
    settings: {
      ...defaultSettings,
      maxAttempts: 3,
      timeLimit: 3600,
    },
    isPublished: true,
    passingScore: 80,
    duration: 3600, // 1 hour
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-06T10:00:00Z',
  },
  {
    id: 'segment-3',
    title: 'Practice Exercises',
    description: 'Hands-on coding exercises',
    order: 3,
    type: 'exercise',
    contentId: 'content-exercise-1',
    settings: {
      ...defaultSettings,
      shuffleQuestions: true,
      showFeedback: true,
    },
    isPublished: false,
    passingScore: 75,
    duration: 2400, // 40 minutes
    createdAt: '2026-01-03T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
  },
  {
    id: 'segment-4',
    title: 'Documentation Review',
    description: null,
    order: 4,
    type: 'document',
    contentId: null,
    settings: defaultSettings,
    isPublished: true,
    passingScore: null,
    duration: 600, // 10 minutes
    createdAt: '2026-01-04T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'segment-5',
    title: 'Custom Module',
    description: 'A custom learning module',
    order: 5,
    type: 'custom',
    contentId: 'content-custom-1',
    settings: {
      ...defaultSettings,
      allowMultipleAttempts: false,
      maxAttempts: 1,
    },
    isPublished: true,
    passingScore: 85,
    duration: 5400, // 1.5 hours
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
];

// Mock full course segment with additional details
export const mockFullCourseModule: CourseModule = {
  id: 'segment-1',
  courseId: 'course-1',
  courseTitle: 'Advanced Web Development',
  title: 'Introduction to TypeScript',
  description: 'Learn the basics of TypeScript and type safety',
  order: 1,
  type: 'video',
  contentId: 'content-video-1',
  content: {
    type: 'video',
    url: 'https://example.com/video.mp4',
    duration: 1800,
  },
  settings: defaultSettings,
  isPublished: true,
  passingScore: 70,
  duration: 1800,
  prerequisites: [],
  completionCount: 45,
  averageScore: 82.5,
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-05T10:00:00Z',
  createdBy: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
  },
};

// Mock SCORM segment with complex settings
export const mockScormSegment: CourseModule = {
  id: 'segment-scorm',
  courseId: 'course-1',
  courseTitle: 'Advanced Web Development',
  title: 'SCORM Package - React Basics',
  description: 'Interactive SCORM module for learning React',
  order: 2,
  type: 'scorm',
  contentId: 'content-scorm-1',
  settings: {
    allowMultipleAttempts: true,
    maxAttempts: 3,
    timeLimit: 3600,
    showFeedback: true,
    shuffleQuestions: false,
  },
  isPublished: true,
  passingScore: 80,
  duration: 3600,
  prerequisites: ['segment-1'],
  completionCount: 38,
  averageScore: 78.3,
  createdAt: '2026-01-02T10:00:00Z',
  updatedAt: '2026-01-06T10:00:00Z',
  createdBy: {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
  },
};

// Mock exercise segment
export const mockExerciseSegment: CourseModuleListItem = {
  id: 'segment-exercise',
  title: 'JavaScript Coding Challenge',
  description: 'Test your JavaScript skills with these exercises',
  order: 3,
  type: 'exercise',
  contentId: 'content-exercise-1',
  settings: {
    allowMultipleAttempts: true,
    maxAttempts: null,
    timeLimit: 2400,
    showFeedback: true,
    shuffleQuestions: true,
  },
  isPublished: false,
  passingScore: 75,
  duration: 2400,
  createdAt: '2026-01-03T10:00:00Z',
  updatedAt: '2026-01-07T10:00:00Z',
};

// Mock create payload
export const mockCreateCourseModulePayload: CreateCourseModulePayload = {
  title: 'New Module',
  description: 'A new learning module',
  order: 6,
  type: 'custom',
  contentId: 'content-custom-2',
  settings: {
    allowMultipleAttempts: true,
    maxAttempts: null,
    timeLimit: null,
    showFeedback: true,
    shuffleQuestions: false,
  },
  isPublished: false,
  passingScore: 70,
  duration: 3000,
};

// Mock update payload
export const mockUpdateCourseModulePayload: UpdateCourseModulePayload = {
  title: 'Updated Module Title',
  description: 'Updated module description',
  isPublished: true,
  passingScore: 85,
  settings: {
    allowMultipleAttempts: true,
    maxAttempts: 5,
    showFeedback: true,
  },
};

// Factory function to create mock course segment
export const createMockCourseModule = (
  overrides?: Partial<CourseModule>
): CourseModule => ({
  id: `segment-${Math.random().toString(36).substr(2, 9)}`,
  courseId: 'course-1',
  courseTitle: 'Test Course',
  title: 'Test Module',
  description: 'Test module description',
  order: 1,
  type: 'custom',
  contentId: null,
  settings: defaultSettings,
  isPublished: false,
  passingScore: 70,
  duration: 1800,
  prerequisites: [],
  completionCount: 0,
  averageScore: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
  },
  ...overrides,
});

// Factory function to create mock course segment list item
export const createMockCourseModuleListItem = (
  overrides?: Partial<CourseModuleListItem>
): CourseModuleListItem => ({
  id: `segment-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Module',
  description: 'Test module description',
  order: 1,
  type: 'custom',
  contentId: null,
  settings: defaultSettings,
  isPublished: false,
  passingScore: 70,
  duration: 1800,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Mock segments with different types
export const mockSegmentsByType: Record<CourseModuleType, CourseModuleListItem> = {
  scorm: {
    id: 'seg-scorm',
    title: 'SCORM Module',
    description: 'SCORM-based learning module',
    order: 1,
    type: 'scorm',
    contentId: 'scorm-1',
    settings: defaultSettings,
    isPublished: true,
    passingScore: 80,
    duration: 3600,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
  custom: {
    id: 'seg-custom',
    title: 'Custom Module',
    description: 'Custom learning module',
    order: 2,
    type: 'custom',
    contentId: 'custom-1',
    settings: defaultSettings,
    isPublished: true,
    passingScore: 70,
    duration: 2400,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
  exercise: {
    id: 'seg-exercise',
    title: 'Exercise Module',
    description: 'Practice exercises',
    order: 3,
    type: 'exercise',
    contentId: 'exercise-1',
    settings: { ...defaultSettings, shuffleQuestions: true },
    isPublished: true,
    passingScore: 75,
    duration: 1800,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
  video: {
    id: 'seg-video',
    title: 'Video Module',
    description: 'Video lesson',
    order: 4,
    type: 'video',
    contentId: 'video-1',
    settings: defaultSettings,
    isPublished: true,
    passingScore: null,
    duration: 1200,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
  document: {
    id: 'seg-document',
    title: 'Document Module',
    description: 'Reading material',
    order: 5,
    type: 'document',
    contentId: 'doc-1',
    settings: defaultSettings,
    isPublished: true,
    passingScore: null,
    duration: 600,
    createdAt: '2026-01-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
  // Note: quiz and exam mocks will be added when Assessment module type is implemented
  // See: specs/ASSESSMENT_MODULE_SPEC.md
};
