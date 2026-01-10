/**
 * Mock data for Enrollment entity tests
 */

import type {
  EnrollmentListItem,
  Enrollment,
  ProgramEnrollment,
  CourseEnrollment,
  ClassEnrollment,
  EnrollmentStatus,
  Progress,
  Grade,
  DetailedProgress,
  ModuleProgress,
  Attendance,
} from '@/entities/enrollment/model/types';

// =====================
// MOCK LEARNERS
// =====================

export const mockLearners = [
  {
    id: 'learner-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    profileImage: 'https://cdn.example.com/profiles/john.jpg',
  },
  {
    id: 'learner-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    profileImage: null,
  },
  {
    id: 'learner-3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    profileImage: null,
  },
];

// =====================
// MOCK DEPARTMENTS
// =====================

export const mockDepartments = [
  { id: 'dept-1', name: 'Computer Science', code: 'CS' },
  { id: 'dept-2', name: 'Mathematics', code: 'MATH' },
];

// =====================
// MOCK PROGRESS
// =====================

export const mockProgress: Progress = {
  percentage: 65,
  completedItems: 13,
  totalItems: 20,
  lastActivityAt: '2026-01-08T10:30:00.000Z',
};

export const mockModuleProgress: ModuleProgress[] = [
  {
    moduleId: 'module-1',
    moduleName: 'Introduction to ES6+',
    status: 'completed',
    percentage: 100,
    completedAt: '2026-01-02T14:30:00.000Z',
  },
  {
    moduleId: 'module-2',
    moduleName: 'Async Programming',
    status: 'in-progress',
    percentage: 60,
    completedAt: null,
  },
  {
    moduleId: 'module-3',
    moduleName: 'Advanced Patterns',
    status: 'not-started',
    percentage: 0,
    completedAt: null,
  },
];

export const mockDetailedProgress: DetailedProgress = {
  ...mockProgress,
  moduleProgress: mockModuleProgress,
};

// =====================
// MOCK GRADE
// =====================

export const mockGrade: Grade = {
  score: 87.5,
  letter: 'B+',
  passed: null,
  gradedAt: null,
  gradedBy: null,
};

export const mockCompletedGrade: Grade = {
  score: 92.5,
  letter: 'A-',
  passed: true,
  gradedAt: '2026-01-08T15:30:00.000Z',
  gradedBy: {
    id: 'instructor-1',
    firstName: 'Jane',
    lastName: 'Smith',
  },
};

// =====================
// MOCK ATTENDANCE
// =====================

export const mockAttendance: Attendance = {
  sessionsAttended: 8,
  totalSessions: 10,
  attendanceRate: 80.0,
};

// =====================
// MOCK ENROLLMENT LIST ITEMS
// =====================

export const mockEnrollmentListItems: EnrollmentListItem[] = [
  {
    id: 'enrollment-1',
    type: 'course',
    learner: mockLearners[0],
    target: {
      id: 'course-1',
      name: 'Advanced JavaScript Programming',
      code: 'CS301',
      type: 'course',
    },
    status: 'active',
    enrolledAt: '2026-01-01T00:00:00.000Z',
    completedAt: null,
    withdrawnAt: null,
    expiresAt: '2026-12-31T23:59:59.000Z',
    progress: mockProgress,
    grade: mockGrade,
    department: mockDepartments[0],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-08T10:30:00.000Z',
  },
  {
    id: 'enrollment-2',
    type: 'program',
    learner: mockLearners[0],
    target: {
      id: 'program-1',
      name: 'Computer Science Degree',
      code: 'CS-BSCS',
      type: 'program',
    },
    status: 'active',
    enrolledAt: '2025-09-01T00:00:00.000Z',
    completedAt: null,
    withdrawnAt: null,
    expiresAt: '2029-06-01T23:59:59.000Z',
    progress: {
      percentage: 35,
      completedItems: 14,
      totalItems: 40,
    },
    grade: {
      score: 88.5,
      letter: 'B+',
      passed: null,
    },
    department: mockDepartments[0],
    createdAt: '2025-09-01T00:00:00.000Z',
    updatedAt: '2026-01-08T10:30:00.000Z',
  },
  {
    id: 'enrollment-3',
    type: 'class',
    learner: mockLearners[1],
    target: {
      id: 'class-1',
      name: 'JavaScript - Spring 2026',
      code: 'CS301-S26',
      type: 'class',
    },
    status: 'completed',
    enrolledAt: '2026-01-08T00:00:00.000Z',
    completedAt: '2026-01-08T15:30:00.000Z',
    withdrawnAt: null,
    expiresAt: '2026-05-15T23:59:59.000Z',
    progress: {
      percentage: 100,
      completedItems: 12,
      totalItems: 12,
    },
    grade: mockCompletedGrade,
    department: mockDepartments[0],
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-01-08T15:30:00.000Z',
  },
];

// =====================
// MOCK DETAILED ENROLLMENT
// =====================

export const mockEnrollmentDetail: Enrollment = {
  ...mockEnrollmentListItems[0],
  progress: mockDetailedProgress,
  notes: 'Accelerated track student',
  metadata: {
    source: 'self-enrollment',
    paymentStatus: 'paid',
  },
};

// =====================
// MOCK PROGRAM ENROLLMENT
// =====================

export const mockProgramEnrollment: ProgramEnrollment = {
  id: 'enrollment-4',
  type: 'program',
  learner: mockLearners[0],
  program: {
    id: 'program-1',
    name: 'Computer Science Degree',
    code: 'CS-BSCS',
    levels: 4,
    department: mockDepartments[0],
  },
  status: 'active',
  enrolledAt: '2025-09-01T00:00:00.000Z',
  completedAt: null,
  withdrawnAt: null,
  expiresAt: '2029-06-01T23:59:59.000Z',
  progress: {
    percentage: 35,
    completedItems: 14,
    totalItems: 40,
  },
  createdAt: '2025-09-01T00:00:00.000Z',
  updatedAt: '2026-01-08T10:30:00.000Z',
};

// =====================
// MOCK COURSE ENROLLMENT
// =====================

export const mockCourseEnrollment: CourseEnrollment = {
  id: 'enrollment-5',
  type: 'course',
  learner: mockLearners[0],
  course: {
    id: 'course-1',
    title: 'Advanced JavaScript Programming',
    code: 'CS301',
    modules: 12,
    department: mockDepartments[0],
  },
  status: 'active',
  enrolledAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
  withdrawnAt: null,
  expiresAt: '2026-12-31T23:59:59.000Z',
  progress: mockProgress,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-08T10:30:00.000Z',
};

// =====================
// MOCK CLASS ENROLLMENT
// =====================

export const mockClassEnrollment: ClassEnrollment = {
  id: 'enrollment-6',
  type: 'class',
  learner: mockLearners[1],
  class: {
    id: 'class-1',
    name: 'JavaScript - Spring 2026',
    course: {
      id: 'course-1',
      title: 'Advanced JavaScript Programming',
      code: 'CS301',
    },
    instructor: {
      id: 'instructor-1',
      firstName: 'Jane',
      lastName: 'Smith',
    },
    schedule: {
      startDate: '2026-01-15T00:00:00.000Z',
      endDate: '2026-05-15T23:59:59.000Z',
      capacity: 30,
      enrolled: 25,
    },
    department: mockDepartments[0],
  },
  status: 'active',
  enrolledAt: '2026-01-08T00:00:00.000Z',
  completedAt: null,
  withdrawnAt: null,
  expiresAt: '2026-05-15T23:59:59.000Z',
  progress: {
    percentage: 45,
    completedItems: 5,
    totalItems: 12,
  },
  createdAt: '2026-01-08T00:00:00.000Z',
  updatedAt: '2026-01-08T10:30:00.000Z',
};

// =====================
// HELPER FUNCTIONS
// =====================

export function createMockEnrollment(
  overrides: Partial<EnrollmentListItem> = {}
): EnrollmentListItem {
  return {
    ...mockEnrollmentListItems[0],
    ...overrides,
  };
}

export function createMockEnrollmentWithProgress(
  status: EnrollmentStatus,
  progress: number
): EnrollmentListItem {
  const completedItems = Math.floor((progress / 100) * 20);
  return createMockEnrollment({
    status,
    progress: {
      percentage: progress,
      completedItems,
      totalItems: 20,
    },
    completedAt: status === 'completed' ? '2026-01-08T15:30:00.000Z' : null,
    withdrawnAt: status === 'withdrawn' ? '2026-01-07T10:00:00.000Z' : null,
  });
}
