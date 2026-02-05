/**
 * Mock course data for testing
 */

import type {
  Course,
  CourseListItem,
  CreateCoursePayload,
  UpdateCoursePayload,
  CourseSettings,
  DepartmentRef,
  ProgramRef,
  InstructorRef,
  UserRef,
  CourseModule,
  CourseStatusResponse,
  DuplicateCourseResponse,
  ExportCourseResponse,
} from '@/entities/course/model/types';

// =====================
// MOCK REFERENCE DATA
// =====================

export const mockDepartments: DepartmentRef[] = [
  { id: 'dept-1', name: 'Computer Science' },
  { id: 'dept-2', name: 'Mathematics' },
  { id: 'dept-3', name: 'Business Administration' },
];

export const mockPrograms: ProgramRef[] = [
  { id: 'prog-1', name: 'Bachelor of Science in Computer Science' },
  { id: 'prog-2', name: 'Master of Business Administration' },
  { id: 'prog-3', name: 'Data Science Certificate' },
];

export const mockInstructors: InstructorRef[] = [
  {
    id: 'inst-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@university.edu',
    role: 'Professor',
  },
  {
    id: 'inst-2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'Associate Professor',
  },
  {
    id: 'inst-3',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@university.edu',
    role: 'Lecturer',
  },
];

export const mockCreator: UserRef = {
  id: 'user-admin-1',
  firstName: 'Admin',
  lastName: 'User',
};

// =====================
// MOCK COURSE SETTINGS
// =====================

export const mockCourseSettings: CourseSettings = {
  allowSelfEnrollment: true,
  passingScore: 70,
  maxAttempts: 3,
  certificateEnabled: true,
};

export const mockRestrictedCourseSettings: CourseSettings = {
  allowSelfEnrollment: false,
  passingScore: 80,
  maxAttempts: 2,
  certificateEnabled: false,
};

// =====================
// MOCK COURSE MODULES
// =====================

export const mockModules: CourseModule[] = [
  {
    id: 'module-1',
    title: 'Introduction to Web Development',
    type: 'custom',
    order: 1,
    isPublished: true,
  },
  {
    id: 'module-2',
    title: 'HTML and CSS Basics',
    type: 'scorm',
    order: 2,
    isPublished: true,
  },
  {
    id: 'module-3',
    title: 'JavaScript Fundamentals',
    type: 'custom',
    order: 3,
    isPublished: false,
  },
  {
    id: 'module-4',
    title: 'Final Assessment',
    type: 'exercise',
    order: 4,
    isPublished: true,
  },
];

// =====================
// MOCK COURSE LIST ITEMS
// =====================

export const mockCourseListItems: CourseListItem[] = [
  {
    id: 'course-1',
    title: 'Introduction to Web Development',
    code: 'WEB101',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
    department: mockDepartments[0],
    program: mockPrograms[0],
    credits: 3,
    duration: 40,
    status: 'published',
    instructors: [mockInstructors[0]],
    settings: mockCourseSettings,
    moduleCount: 4,
    enrollmentCount: 150,
    publishedAt: '2025-09-01T00:00:00Z',
    archivedAt: null,
    createdBy: mockCreator.id,
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
    // Versioning fields
    version: 2,
    canonicalCourseId: 'canonical-web101',
    isLocked: false,
    isLatest: true,
    parentVersionId: 'course-1-v1',
    lockedAt: null,
    lockedReason: null,
  },
  {
    id: 'course-1-v1',
    title: 'Introduction to Web Development',
    code: 'WEB101',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
    department: mockDepartments[0],
    program: mockPrograms[0],
    credits: 3,
    duration: 40,
    status: 'published',
    instructors: [mockInstructors[0]],
    settings: mockCourseSettings,
    moduleCount: 4,
    enrollmentCount: 120,
    publishedAt: '2025-06-01T00:00:00Z',
    archivedAt: null,
    createdBy: mockCreator.id,
    createdAt: '2025-05-15T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
    // Versioning fields - locked previous version
    version: 1,
    canonicalCourseId: 'canonical-web101',
    isLocked: true,
    isLatest: false,
    parentVersionId: null,
    lockedAt: '2025-09-01T00:00:00Z',
    lockedReason: 'superseded',
  },
  {
    id: 'course-2',
    title: 'Advanced Database Design',
    code: 'DB301',
    description: 'Master advanced database concepts including normalization, indexing, and query optimization.',
    department: mockDepartments[0],
    program: mockPrograms[0],
    credits: 4,
    duration: 60,
    status: 'published',
    instructors: [mockInstructors[1], mockInstructors[2]],
    settings: mockRestrictedCourseSettings,
    moduleCount: 8,
    enrollmentCount: 85,
    publishedAt: '2025-10-01T00:00:00Z',
    archivedAt: null,
    createdBy: mockCreator.id,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-10-15T10:00:00Z',
    // Versioning fields
    version: 1,
    canonicalCourseId: 'canonical-db301',
    isLocked: false,
    isLatest: true,
    parentVersionId: null,
    lockedAt: null,
    lockedReason: null,
  },
  {
    id: 'course-3',
    title: 'Business Analytics Fundamentals',
    code: 'BUS201',
    description: 'Introduction to business analytics and data-driven decision making.',
    department: mockDepartments[2],
    program: mockPrograms[1],
    credits: 3,
    duration: 45,
    status: 'draft',
    instructors: [mockInstructors[1]],
    settings: mockCourseSettings,
    moduleCount: 5,
    enrollmentCount: 0,
    publishedAt: null,
    archivedAt: null,
    createdBy: mockCreator.id,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-15T10:00:00Z',
    // Versioning fields - draft course
    version: 1,
    canonicalCourseId: 'canonical-bus201',
    isLocked: false,
    isLatest: true,
    parentVersionId: null,
    lockedAt: null,
    lockedReason: null,
  },
  {
    id: 'course-4',
    title: 'Legacy Programming Course',
    code: 'OLD101',
    description: 'An archived course that is no longer active.',
    department: mockDepartments[0],
    program: null,
    credits: 2,
    duration: 20,
    status: 'archived',
    instructors: [mockInstructors[2]],
    settings: mockRestrictedCourseSettings,
    moduleCount: 3,
    enrollmentCount: 45,
    publishedAt: '2024-01-01T00:00:00Z',
    archivedAt: '2025-06-01T00:00:00Z',
    createdBy: mockCreator.id,
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
    // Versioning fields - archived and locked
    version: 1,
    canonicalCourseId: 'canonical-old101',
    isLocked: true,
    isLatest: true,
    parentVersionId: null,
    lockedAt: '2025-06-01T00:00:00Z',
    lockedReason: 'archived',
  },
];

// =====================
// MOCK FULL COURSES
// =====================

export const mockPublishedCourse: Course = {
  id: 'course-1',
  title: 'Introduction to Web Development',
  code: 'WEB101',
  description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
  department: mockDepartments[0],
  program: mockPrograms[0],
  credits: 3,
  duration: 40,
  status: 'published',
  instructors: [mockInstructors[0]],
  settings: mockCourseSettings,
  modules: mockModules,
  enrollmentCount: 150,
  completionRate: 82.5,
  publishedAt: '2025-09-01T00:00:00Z',
  archivedAt: null,
  createdBy: mockCreator,
  createdAt: '2025-08-15T10:00:00Z',
  updatedAt: '2025-09-01T10:00:00Z',
  // Versioning fields
  version: 2,
  canonicalCourseId: 'canonical-web101',
  isLocked: false,
  isLatest: true,
  parentVersionId: 'course-1-v1',
  lockedAt: null,
  lockedBy: null,
  lockedReason: null,
  changeNotes: 'Updated JavaScript section with ES2024 features',
};

export const mockDraftCourse: Course = {
  id: 'course-3',
  title: 'Business Analytics Fundamentals',
  code: 'BUS201',
  description: 'Introduction to business analytics and data-driven decision making.',
  department: mockDepartments[2],
  program: mockPrograms[1],
  credits: 3,
  duration: 45,
  status: 'draft',
  instructors: [mockInstructors[1]],
  settings: mockCourseSettings,
  modules: [],
  enrollmentCount: 0,
  completionRate: 0,
  publishedAt: null,
  archivedAt: null,
  createdBy: mockCreator,
  createdAt: '2025-11-01T10:00:00Z',
  updatedAt: '2025-11-15T10:00:00Z',
  // Versioning fields - draft course
  version: 1,
  canonicalCourseId: 'canonical-bus201',
  isLocked: false,
  isLatest: true,
  parentVersionId: null,
  lockedAt: null,
  lockedBy: null,
  lockedReason: null,
  changeNotes: null,
};

export const mockArchivedCourse: Course = {
  id: 'course-4',
  title: 'Legacy Programming Course',
  code: 'OLD101',
  description: 'An archived course that is no longer active.',
  department: mockDepartments[0],
  program: null,
  credits: 2,
  duration: 20,
  status: 'archived',
  instructors: [mockInstructors[2]],
  settings: mockRestrictedCourseSettings,
  modules: mockModules.slice(0, 3),
  enrollmentCount: 45,
  completionRate: 95.5,
  publishedAt: '2024-01-01T00:00:00Z',
  archivedAt: '2025-06-01T00:00:00Z',
  createdBy: mockCreator,
  createdAt: '2023-12-01T10:00:00Z',
  updatedAt: '2025-06-01T10:00:00Z',
  // Versioning fields - archived and locked
  version: 1,
  canonicalCourseId: 'canonical-old101',
  isLocked: true,
  isLatest: true,
  parentVersionId: null,
  lockedAt: '2025-06-01T00:00:00Z',
  lockedBy: mockCreator,
  lockedReason: 'archived',
  changeNotes: null,
};

// =====================
// MOCK FORM PAYLOADS
// =====================

export const mockCreateCoursePayload: CreateCoursePayload = {
  title: 'New Course Title',
  code: 'NEW101',
  description: 'A brand new course for testing.',
  department: 'dept-1',
  program: 'prog-1',
  credits: 3,
  duration: 40,
  instructors: ['inst-1'],
  settings: {
    allowSelfEnrollment: true,
    passingScore: 70,
    maxAttempts: 3,
    certificateEnabled: true,
  },
};

export const mockUpdateCoursePayload: UpdateCoursePayload = {
  title: 'Updated Course Title',
  code: 'UPD101',
  description: 'An updated course description.',
  department: 'dept-2',
  program: 'prog-2',
  credits: 4,
  duration: 50,
  instructors: ['inst-1', 'inst-2'],
  settings: {
    allowSelfEnrollment: false,
    passingScore: 80,
    maxAttempts: 2,
    certificateEnabled: false,
  },
};

// =====================
// MOCK API RESPONSES
// =====================

export const mockCourseStatusResponse: CourseStatusResponse = {
  id: 'course-1',
  status: 'published',
  publishedAt: '2025-09-01T00:00:00Z',
  archivedAt: null,
};

export const mockDuplicateCourseResponse: DuplicateCourseResponse = {
  id: 'course-5',
  title: 'Introduction to Web Development (Copy)',
  code: 'WEB102',
  status: 'draft',
  moduleCount: 4,
  sourceCourseId: 'course-1',
};

export const mockExportCourseResponse: ExportCourseResponse = {
  downloadUrl: 'https://storage.example.com/exports/course-1-export.zip',
  filename: 'WEB101-export.zip',
  format: 'scorm2004',
  size: 15728640, // 15 MB
  expiresAt: '2026-01-09T00:00:00Z',
};

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockCourse = (overrides?: Partial<Course>): Course => {
  const id = `course-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    title: 'Test Course',
    code: `TST${Math.floor(100 + Math.random() * 900)}`,
    description: 'A test course for unit testing.',
    department: mockDepartments[0],
    program: mockPrograms[0],
    credits: 3,
    duration: 40,
    status: 'draft',
    instructors: [mockInstructors[0]],
    settings: mockCourseSettings,
    modules: [],
    enrollmentCount: 0,
    completionRate: 0,
    publishedAt: null,
    archivedAt: null,
    createdBy: mockCreator,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Versioning fields
    version: 1,
    canonicalCourseId: `canonical-${id}`,
    isLocked: false,
    isLatest: true,
    parentVersionId: null,
    lockedAt: null,
    lockedBy: null,
    lockedReason: null,
    changeNotes: null,
    ...overrides,
  };
};

export const createMockCourseListItem = (overrides?: Partial<CourseListItem>): CourseListItem => {
  const id = `course-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    title: 'Test Course',
    code: `TST${Math.floor(100 + Math.random() * 900)}`,
    description: 'A test course for unit testing.',
    department: mockDepartments[0],
    program: mockPrograms[0],
    credits: 3,
    duration: 40,
    status: 'draft',
    instructors: [mockInstructors[0]],
    settings: mockCourseSettings,
    moduleCount: 0,
    enrollmentCount: 0,
    publishedAt: null,
    archivedAt: null,
    createdBy: mockCreator.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Versioning fields
    version: 1,
    canonicalCourseId: `canonical-${id}`,
    isLocked: false,
    isLatest: true,
    parentVersionId: null,
    lockedAt: null,
    lockedReason: null,
    ...overrides,
  };
};
