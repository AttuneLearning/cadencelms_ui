/**
 * Mock module library data for testing
 */

import type {
  ModuleLibraryItem,
  ModuleUsage,
  ModuleLibraryResponse,
} from '@/entities/module';
// =====================
// MOCK MODULE LIBRARY ITEMS
// =====================

export const mockModuleLibraryItems: ModuleLibraryItem[] = [
  {
    id: 'module-1',
    title: 'Introduction to Web Development',
    description: 'Overview of web technologies and development workflow',
    estimatedDuration: 60,
    learningUnitCount: 5,
    isPublished: true,
    ownerDepartment: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdBy: {
      id: 'user-admin-1',
      firstName: 'John',
      lastName: 'Admin',
    },
    usedInCourseVersionsCount: 3,
    totalEnrollments: 450,
    averageCompletionRate: 87.5,
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'module-2',
    title: 'HTML and CSS Basics',
    description: 'Learn the building blocks of web pages',
    estimatedDuration: 120,
    learningUnitCount: 8,
    isPublished: true,
    ownerDepartment: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdBy: {
      id: 'user-inst-1',
      firstName: 'Jane',
      lastName: 'Instructor',
    },
    usedInCourseVersionsCount: 5,
    totalEnrollments: 620,
    averageCompletionRate: 82.3,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-11-15T10:00:00Z',
  },
  {
    id: 'module-3',
    title: 'JavaScript Fundamentals',
    description: 'Core JavaScript concepts including variables, functions, and control flow',
    estimatedDuration: 180,
    learningUnitCount: 12,
    isPublished: true,
    ownerDepartment: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdBy: {
      id: 'user-inst-1',
      firstName: 'Jane',
      lastName: 'Instructor',
    },
    usedInCourseVersionsCount: 4,
    totalEnrollments: 380,
    averageCompletionRate: 75.8,
    createdAt: '2025-07-01T10:00:00Z',
    updatedAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'module-4',
    title: 'Database Fundamentals',
    description: 'Introduction to relational databases and SQL',
    estimatedDuration: 150,
    learningUnitCount: 10,
    isPublished: true,
    ownerDepartment: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdBy: {
      id: 'user-admin-1',
      firstName: 'John',
      lastName: 'Admin',
    },
    usedInCourseVersionsCount: 2,
    totalEnrollments: 215,
    averageCompletionRate: 89.2,
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-09-15T10:00:00Z',
  },
  {
    id: 'module-5',
    title: 'Business Communication',
    description: 'Professional communication skills for the workplace',
    estimatedDuration: 90,
    learningUnitCount: 6,
    isPublished: true,
    ownerDepartment: {
      id: 'dept-3',
      name: 'Business Administration',
    },
    createdBy: {
      id: 'user-admin-2',
      firstName: 'Sarah',
      lastName: 'Manager',
    },
    usedInCourseVersionsCount: 7,
    totalEnrollments: 890,
    averageCompletionRate: 91.5,
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-12-10T10:00:00Z',
  },
  {
    id: 'module-6',
    title: 'Data Analysis Basics',
    description: 'Introduction to data analysis concepts and tools',
    estimatedDuration: 120,
    learningUnitCount: 8,
    isPublished: false,
    ownerDepartment: {
      id: 'dept-3',
      name: 'Business Administration',
    },
    createdBy: {
      id: 'user-inst-2',
      firstName: 'Mike',
      lastName: 'Analyst',
    },
    usedInCourseVersionsCount: 0,
    totalEnrollments: 0,
    averageCompletionRate: null,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-20T10:00:00Z',
  },
];

export const mockModuleLibraryResponse: ModuleLibraryResponse = {
  modules: mockModuleLibraryItems,
  pagination: {
    page: 1,
    limit: 20,
    total: 6,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

// =====================
// MOCK MODULE USAGE
// =====================

export const mockModuleUsage: ModuleUsage = {
  moduleId: 'module-1',
  moduleTitle: 'Introduction to Web Development',
  usedInCourseVersions: [
    {
      courseVersionId: 'course-1',
      canonicalCourseId: 'canonical-web101',
      courseCode: 'WEB101',
      courseTitle: 'Introduction to Web Development',
      version: 2,
      status: 'published',
      isLocked: false,
    },
    {
      courseVersionId: 'course-1-v1',
      canonicalCourseId: 'canonical-web101',
      courseCode: 'WEB101',
      courseTitle: 'Introduction to Web Development',
      version: 1,
      status: 'published',
      isLocked: true,
    },
    {
      courseVersionId: 'course-5',
      canonicalCourseId: 'canonical-web201',
      courseCode: 'WEB201',
      courseTitle: 'Intermediate Web Development',
      version: 1,
      status: 'draft',
      isLocked: false,
    },
  ],
  totalCourseVersions: 3,
  affectedPublishedCourses: 2,
  affectedDraftCourses: 1,
};

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockModuleLibraryItem = (
  overrides?: Partial<ModuleLibraryItem>
): ModuleLibraryItem => {
  const id = `module-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    title: 'Test Module',
    description: 'A test module for unit testing',
    estimatedDuration: 60,
    learningUnitCount: 5,
    isPublished: true,
    ownerDepartment: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdBy: {
      id: 'user-1',
      firstName: 'Test',
      lastName: 'User',
    },
    usedInCourseVersionsCount: 0,
    totalEnrollments: 0,
    averageCompletionRate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};
