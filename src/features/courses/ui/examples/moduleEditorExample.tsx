/**
 * Module Editor Example Data
 * Example lesson data for testing and demonstration
 */

import type { LessonListItem } from '@/entities/course-module/model/lessonTypes';

/**
 * Example lesson data for a typical course module
 */
export const exampleLessons: LessonListItem[] = [
  {
    id: 'lesson-1',
    order: 1,
    title: 'Introduction to React Hooks',
    type: 'video',
    duration: 1200, // 20 minutes
    settings: {
      isRequired: true,
      completionCriteria: {
        type: 'view_time',
        requiredPercentage: 80,
        allowEarlyCompletion: false,
      },
      customTitle: undefined,
    },
    isPublished: true,
  },
  {
    id: 'lesson-2',
    order: 2,
    title: 'useState and useEffect',
    type: 'scorm',
    duration: 1800, // 30 minutes
    settings: {
      isRequired: true,
      completionCriteria: {
        type: 'quiz_score',
        minimumScore: 70,
        allowEarlyCompletion: false,
      },
      unlockConditions: {
        previousLessonId: 'lesson-1',
      },
      customTitle: undefined,
    },
    isPublished: true,
  },
  {
    id: 'lesson-3',
    order: 3,
    title: 'Custom Hooks Exercise',
    type: 'exercise',
    duration: 3600, // 60 minutes
    settings: {
      isRequired: true,
      completionCriteria: {
        type: 'quiz_score',
        minimumScore: 80,
        allowEarlyCompletion: false,
      },
      unlockConditions: {
        previousLessonId: 'lesson-2',
      },
      customTitle: undefined,
    },
    isPublished: true,
  },
  {
    id: 'lesson-4',
    order: 4,
    title: 'React Hooks Best Practices',
    type: 'document',
    duration: 900, // 15 minutes
    settings: {
      isRequired: false,
      completionCriteria: {
        type: 'view_time',
        requiredPercentage: 100,
        allowEarlyCompletion: true,
      },
      unlockConditions: {
        previousLessonId: 'lesson-2',
      },
      customTitle: undefined,
    },
    isPublished: true,
  },
  {
    id: 'lesson-5',
    order: 5,
    title: 'Advanced Patterns - Optional Reading',
    type: 'document',
    duration: 600, // 10 minutes
    settings: {
      isRequired: false,
      completionCriteria: {
        type: 'manual',
        allowEarlyCompletion: true,
      },
      customTitle: 'Bonus: Advanced React Patterns',
    },
    isPublished: false,
  },
];

/**
 * Example module data
 */
export const exampleModule = {
  id: 'module-123',
  courseId: 'course-456',
  courseTitle: 'React Development Masterclass',
  title: 'React Hooks Deep Dive',
  description:
    'Master React Hooks with hands-on exercises and real-world examples. Learn useState, useEffect, and custom hooks.',
  order: 2,
  type: 'custom' as const,
  contentId: null,
  settings: {
    allowMultipleAttempts: true,
    maxAttempts: 3,
    timeLimit: null,
    showFeedback: true,
    shuffleQuestions: false,
  },
  isPublished: true,
  passingScore: 70,
  duration: 7200, // 120 minutes total
  prerequisites: ['module-122'],
  completionCount: 45,
  averageScore: 85.5,
  createdAt: '2025-01-01T10:00:00Z',
  updatedAt: '2025-01-08T15:30:00Z',
  createdBy: {
    id: 'staff-789',
    firstName: 'Sarah',
    lastName: 'Johnson',
  },
};

/**
 * Example usage in ModuleEditorPage
 *
 * ```tsx
 * import { exampleLessons, exampleModule } from '@/features/courses/ui/examples/moduleEditorExample';
 *
 * // In development mode, use example data
 * React.useEffect(() => {
 *   if (process.env.NODE_ENV === 'development' && !module) {
 *     setModuleTitle(exampleModule.title);
 *     setModuleDescription(exampleModule.description);
 *     setModuleDuration(exampleModule.duration);
 *     setLessons(exampleLessons);
 *   }
 * }, [module]);
 * ```
 */
