/**
 * Mock course version data for testing
 */

import type {
  CourseVersion,
  CourseVersionListItem,
  CourseVersionDetail,
  CanonicalCourse,
  CanonicalCourseListItem,
  CourseVersionsListResponse,
  ModuleEditLockResponse,
} from '@/entities/course-version';
import { mockDepartments, mockPrograms, mockInstructors, mockCreator } from './courses';

// =====================
// MOCK CANONICAL COURSES
// =====================

export const mockCanonicalCourses: CanonicalCourse[] = [
  {
    id: 'canonical-web101',
    code: 'WEB101',
    departmentId: 'dept-1',
    programId: 'prog-1',
    currentPublishedVersionId: 'course-1',
    latestDraftVersionId: null,
    totalVersions: 2,
    createdBy: 'user-admin-1',
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'canonical-db301',
    code: 'DB301',
    departmentId: 'dept-1',
    programId: 'prog-1',
    currentPublishedVersionId: 'course-2',
    latestDraftVersionId: null,
    totalVersions: 1,
    createdBy: 'user-admin-1',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-10-15T10:00:00Z',
  },
  {
    id: 'canonical-bus201',
    code: 'BUS201',
    departmentId: 'dept-3',
    programId: 'prog-2',
    currentPublishedVersionId: null,
    latestDraftVersionId: 'course-3',
    totalVersions: 1,
    createdBy: 'user-admin-1',
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-15T10:00:00Z',
  },
];

export const mockCanonicalCourseListItems: CanonicalCourseListItem[] = [
  {
    id: 'canonical-web101',
    code: 'WEB101',
    department: mockDepartments[0],
    program: mockPrograms[0],
    currentPublishedVersion: {
      id: 'course-1',
      version: 2,
      title: 'Introduction to Web Development',
    },
    latestDraftVersion: null,
    totalVersions: 2,
    createdAt: '2025-05-15T10:00:00Z',
  },
  {
    id: 'canonical-db301',
    code: 'DB301',
    department: mockDepartments[0],
    program: mockPrograms[0],
    currentPublishedVersion: {
      id: 'course-2',
      version: 1,
      title: 'Advanced Database Design',
    },
    latestDraftVersion: null,
    totalVersions: 1,
    createdAt: '2025-09-01T10:00:00Z',
  },
];

// =====================
// MOCK COURSE VERSIONS
// =====================

export const mockCourseVersionListItems: CourseVersionListItem[] = [
  {
    id: 'course-1',
    canonicalCourseId: 'canonical-web101',
    canonicalCourseCode: 'WEB101',
    version: 2,
    title: 'Introduction to Web Development',
    status: 'published',
    isLocked: false,
    isLatest: true,
    moduleCount: 4,
    enrollmentCount: 150,
    createdAt: '2025-08-15T10:00:00Z',
    publishedAt: '2025-09-01T00:00:00Z',
    lockedAt: null,
    lockedReason: null,
    changeNotes: 'Updated JavaScript section with ES2024 features',
  },
  {
    id: 'course-1-v1',
    canonicalCourseId: 'canonical-web101',
    canonicalCourseCode: 'WEB101',
    version: 1,
    title: 'Introduction to Web Development',
    status: 'published',
    isLocked: true,
    isLatest: false,
    moduleCount: 4,
    enrollmentCount: 120,
    createdAt: '2025-05-15T10:00:00Z',
    publishedAt: '2025-06-01T00:00:00Z',
    lockedAt: '2025-09-01T00:00:00Z',
    lockedReason: 'superseded',
    changeNotes: null,
  },
  {
    id: 'course-2',
    canonicalCourseId: 'canonical-db301',
    canonicalCourseCode: 'DB301',
    version: 1,
    title: 'Advanced Database Design',
    status: 'published',
    isLocked: false,
    isLatest: true,
    moduleCount: 8,
    enrollmentCount: 85,
    createdAt: '2025-09-01T10:00:00Z',
    publishedAt: '2025-10-01T00:00:00Z',
    lockedAt: null,
    lockedReason: null,
    changeNotes: null,
  },
  {
    id: 'course-3',
    canonicalCourseId: 'canonical-bus201',
    canonicalCourseCode: 'BUS201',
    version: 1,
    title: 'Business Analytics Fundamentals',
    status: 'draft',
    isLocked: false,
    isLatest: true,
    moduleCount: 5,
    enrollmentCount: 0,
    createdAt: '2025-11-01T10:00:00Z',
    publishedAt: null,
    lockedAt: null,
    lockedReason: null,
    changeNotes: null,
  },
];

export const mockCourseVersionDetail: CourseVersionDetail = {
  id: 'course-1',
  canonicalCourseId: 'canonical-web101',
  version: 2,
  title: 'Introduction to Web Development',
  description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
  credits: 3,
  duration: 40,
  settings: {
    allowSelfEnrollment: true,
    passingScore: 70,
    maxAttempts: 3,
    certificateEnabled: true,
  },
  instructorIds: ['inst-1'],
  status: 'published',
  isLocked: false,
  isLatest: true,
  parentVersionId: 'course-1-v1',
  createdBy: 'user-admin-1',
  createdAt: '2025-08-15T10:00:00Z',
  publishedAt: '2025-09-01T00:00:00Z',
  publishedBy: 'user-admin-1',
  lockedAt: null,
  lockedBy: null,
  lockedReason: null,
  changeNotes: 'Updated JavaScript section with ES2024 features',
  statsAtLock: null,
  canonicalCourse: {
    id: 'canonical-web101',
    code: 'WEB101',
    department: mockDepartments[0],
    program: mockPrograms[0],
  },
  instructors: [mockInstructors[0]],
  modules: [
    {
      id: 'cvm-1',
      courseVersionId: 'course-1',
      moduleId: 'module-1',
      order: 1,
      isRequired: true,
      availableFrom: null,
      availableUntil: null,
      createdAt: '2025-08-15T10:00:00Z',
      module: {
        id: 'module-1',
        title: 'Introduction to Web Development',
        description: 'Overview of web technologies and development workflow',
        estimatedDuration: 60,
        learningUnitCount: 5,
        isPublished: true,
      },
    },
    {
      id: 'cvm-2',
      courseVersionId: 'course-1',
      moduleId: 'module-2',
      order: 2,
      isRequired: true,
      availableFrom: null,
      availableUntil: null,
      createdAt: '2025-08-15T10:00:00Z',
      module: {
        id: 'module-2',
        title: 'HTML and CSS Basics',
        description: 'Learn the building blocks of web pages',
        estimatedDuration: 120,
        learningUnitCount: 8,
        isPublished: true,
      },
    },
  ],
  parentVersion: {
    id: 'course-1-v1',
    version: 1,
    title: 'Introduction to Web Development',
  },
  statistics: {
    moduleCount: 4,
    learningUnitCount: 20,
    totalDuration: 600,
    enrollmentCount: 150,
    completionRate: 82.5,
  },
};

// =====================
// MOCK VERSION HISTORY RESPONSE
// =====================

export const mockCourseVersionsListResponse: CourseVersionsListResponse = {
  canonicalCourseId: 'canonical-web101',
  canonicalCourseCode: 'WEB101',
  versions: [
    mockCourseVersionListItems[0], // v2 (current)
    mockCourseVersionListItems[1], // v1 (locked)
  ],
  totalVersions: 2,
};

// =====================
// MOCK EDIT LOCKS
// =====================

export const mockModuleEditLockResponse: ModuleEditLockResponse = {
  moduleId: 'module-1',
  isLocked: false,
  lock: null,
  accessRequest: null,
};

export const mockModuleEditLockResponseLocked: ModuleEditLockResponse = {
  moduleId: 'module-1',
  isLocked: true,
  lock: {
    userId: 'user-2',
    userName: 'Jane Instructor',
    acquiredAt: '2026-02-04T10:00:00Z',
    expiresAt: '2026-02-04T10:30:00Z',
  },
  accessRequest: null,
};

export const mockModuleEditLockResponseWithRequest: ModuleEditLockResponse = {
  moduleId: 'module-1',
  isLocked: true,
  lock: {
    userId: 'user-2',
    userName: 'Jane Instructor',
    acquiredAt: '2026-02-04T10:00:00Z',
    expiresAt: '2026-02-04T10:30:00Z',
  },
  accessRequest: {
    userId: 'user-3',
    userName: 'Bob Admin',
    requestedAt: '2026-02-04T10:15:00Z',
  },
};

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockCourseVersionListItem = (
  overrides?: Partial<CourseVersionListItem>
): CourseVersionListItem => {
  const id = `course-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    canonicalCourseId: `canonical-${id}`,
    canonicalCourseCode: `TST${Math.floor(100 + Math.random() * 900)}`,
    version: 1,
    title: 'Test Course Version',
    status: 'draft',
    isLocked: false,
    isLatest: true,
    moduleCount: 0,
    enrollmentCount: 0,
    createdAt: new Date().toISOString(),
    publishedAt: null,
    lockedAt: null,
    lockedReason: null,
    changeNotes: null,
    ...overrides,
  };
};
