/**
 * Mock class data for testing
 */

import type {
  Class,
  ClassListItem,
  CreateClassPayload,
  ClassRoster,
  ClassEnrollment,
  ClassProgress,
  ClassEnrollmentsResponse,
  EnrollmentResult,
  DeleteClassResponse,
  DropEnrollmentResponse,
  RosterItem,
} from '@/entities/class/model/types';

/**
 * Mock class list items
 */
export const mockClasses: ClassListItem[] = [
  {
    id: 'class-1',
    name: 'Introduction to Programming - Spring 2026',
    course: {
      id: 'course-1',
      title: 'Introduction to Programming',
      code: 'CS101',
    },
    program: {
      id: 'program-1',
      name: 'Computer Science',
    },
    programLevel: {
      id: 'level-1',
      name: 'Level 1',
      levelNumber: 1,
    },
    instructors: [
      {
        id: 'instructor-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        role: 'primary',
        profileImage: null,
      },
    ],
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-05-20T00:00:00Z',
    duration: 16,
    capacity: 30,
    enrolledCount: 25,
    academicTerm: {
      id: 'term-1',
      name: 'Spring 2026',
    },
    status: 'active',
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'class-2',
    name: 'Advanced Database Systems - Spring 2026',
    course: {
      id: 'course-2',
      title: 'Advanced Database Systems',
      code: 'CS401',
    },
    program: {
      id: 'program-1',
      name: 'Computer Science',
    },
    programLevel: {
      id: 'level-4',
      name: 'Level 4',
      levelNumber: 4,
    },
    instructors: [
      {
        id: 'instructor-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        role: 'primary',
        profileImage: null,
      },
      {
        id: 'instructor-3',
        firstName: 'Mike',
        lastName: 'Williams',
        email: 'mike.williams@example.com',
        role: 'secondary',
        profileImage: null,
      },
    ],
    startDate: '2026-02-01T00:00:00Z',
    endDate: '2026-06-01T00:00:00Z',
    duration: 16,
    capacity: 20,
    enrolledCount: 18,
    academicTerm: {
      id: 'term-1',
      name: 'Spring 2026',
    },
    status: 'active',
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'class-3',
    name: 'Web Development Fundamentals - Fall 2026',
    course: {
      id: 'course-3',
      title: 'Web Development Fundamentals',
      code: 'CS201',
    },
    program: {
      id: 'program-1',
      name: 'Computer Science',
    },
    programLevel: {
      id: 'level-2',
      name: 'Level 2',
      levelNumber: 2,
    },
    instructors: [
      {
        id: 'instructor-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        role: 'primary',
        profileImage: null,
      },
    ],
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-12-15T00:00:00Z',
    duration: 14,
    capacity: 25,
    enrolledCount: 5,
    academicTerm: {
      id: 'term-2',
      name: 'Fall 2026',
    },
    status: 'upcoming',
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'class-4',
    name: 'Data Structures - Fall 2025',
    course: {
      id: 'course-4',
      title: 'Data Structures',
      code: 'CS202',
    },
    program: {
      id: 'program-1',
      name: 'Computer Science',
    },
    instructors: [
      {
        id: 'instructor-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        role: 'primary',
        profileImage: null,
      },
    ],
    startDate: '2025-09-01T00:00:00Z',
    endDate: '2025-12-15T00:00:00Z',
    duration: 14,
    capacity: 30,
    enrolledCount: 28,
    academicTerm: {
      id: 'term-3',
      name: 'Fall 2025',
    },
    status: 'completed',
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
  },
  {
    id: 'class-5',
    name: 'Machine Learning - Spring 2026 (Cancelled)',
    course: {
      id: 'course-5',
      title: 'Machine Learning',
      code: 'CS501',
    },
    program: {
      id: 'program-1',
      name: 'Computer Science',
    },
    programLevel: {
      id: 'level-5',
      name: 'Level 5',
      levelNumber: 5,
    },
    instructors: [],
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-05-20T00:00:00Z',
    duration: 16,
    capacity: 15,
    enrolledCount: 0,
    academicTerm: {
      id: 'term-1',
      name: 'Spring 2026',
    },
    status: 'cancelled',
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-12-30T10:00:00Z',
  },
  {
    id: 'class-6',
    name: 'Algorithms - Spring 2026 (Full)',
    course: {
      id: 'course-6',
      title: 'Algorithms',
      code: 'CS301',
    },
    program: {
      id: 'program-1',
      name: 'Computer Science',
    },
    programLevel: {
      id: 'level-3',
      name: 'Level 3',
      levelNumber: 3,
    },
    instructors: [
      {
        id: 'instructor-3',
        firstName: 'Mike',
        lastName: 'Williams',
        email: 'mike.williams@example.com',
        role: 'primary',
        profileImage: null,
      },
    ],
    startDate: '2026-01-20T00:00:00Z',
    endDate: '2026-05-20T00:00:00Z',
    duration: 16,
    capacity: 20,
    enrolledCount: 20,
    academicTerm: {
      id: 'term-1',
      name: 'Spring 2026',
    },
    status: 'active',
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
];

/**
 * Mock full class details
 */
export const mockFullClass: Class = {
  id: 'class-1',
  name: 'Introduction to Programming - Spring 2026',
  course: {
    id: 'course-1',
    title: 'Introduction to Programming',
    code: 'CS101',
    description: 'An introductory course covering fundamental programming concepts',
    credits: 3,
  },
  program: {
    id: 'program-1',
    name: 'Computer Science',
    code: 'CS',
  },
  programLevel: {
    id: 'level-1',
    name: 'Level 1',
    levelNumber: 1,
  },
  instructors: [
    {
      id: 'instructor-1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      role: 'primary',
      profileImage: 'https://example.com/avatars/john.jpg',
    },
  ],
  startDate: '2026-01-20T00:00:00Z',
  endDate: '2026-05-20T00:00:00Z',
  duration: 16,
  capacity: 30,
  enrolledCount: 25,
  waitlistCount: 0,
  academicTerm: {
    id: 'term-1',
    name: 'Spring 2026',
    startDate: '2026-01-15T00:00:00Z',
    endDate: '2026-05-25T00:00:00Z',
  },
  status: 'active',
  department: {
    id: 'dept-1',
    name: 'Computer Science',
    code: 'CS',
  },
  createdAt: '2025-12-01T10:00:00Z',
  updatedAt: '2026-01-08T10:00:00Z',
};

/**
 * Mock class enrollments
 */
export const mockClassEnrollments: ClassEnrollment[] = [
  {
    id: 'enrollment-1',
    learner: {
      id: 'learner-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      studentId: 'STU001',
      profileImage: null,
    },
    enrolledAt: '2026-01-10T10:00:00Z',
    status: 'active',
  },
  {
    id: 'enrollment-2',
    learner: {
      id: 'learner-2',
      firstName: 'Bob',
      lastName: 'Williams',
      email: 'bob.williams@example.com',
      studentId: 'STU002',
      profileImage: null,
    },
    enrolledAt: '2026-01-11T10:00:00Z',
    status: 'active',
  },
  {
    id: 'enrollment-3',
    learner: {
      id: 'learner-3',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      studentId: 'STU003',
      profileImage: null,
    },
    enrolledAt: '2026-01-12T10:00:00Z',
    status: 'withdrawn',
    withdrawnAt: '2026-01-25T10:00:00Z',
  },
];

/**
 * Mock roster items with progress
 */
export const mockRosterItems: RosterItem[] = [
  {
    enrollmentId: 'enrollment-1',
    learner: {
      id: 'learner-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      studentId: 'STU001',
      profileImage: null,
    },
    enrolledAt: '2026-01-10T10:00:00Z',
    status: 'active',
    progress: {
      completionPercent: 75,
      modulesCompleted: 6,
      modulesTotal: 8,
      currentScore: 92,
      lastAccessedAt: '2026-01-08T14:30:00Z',
    },
    attendance: {
      sessionsAttended: 14,
      totalSessions: 16,
      attendanceRate: 87.5,
    },
  },
  {
    enrollmentId: 'enrollment-2',
    learner: {
      id: 'learner-2',
      firstName: 'Bob',
      lastName: 'Williams',
      email: 'bob.williams@example.com',
      studentId: 'STU002',
      profileImage: null,
    },
    enrolledAt: '2026-01-11T10:00:00Z',
    status: 'active',
    progress: {
      completionPercent: 50,
      modulesCompleted: 4,
      modulesTotal: 8,
      currentScore: 78,
      lastAccessedAt: '2026-01-07T10:15:00Z',
    },
    attendance: {
      sessionsAttended: 12,
      totalSessions: 16,
      attendanceRate: 75,
    },
  },
  {
    enrollmentId: 'enrollment-3',
    learner: {
      id: 'learner-3',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      studentId: 'STU003',
      profileImage: null,
    },
    enrolledAt: '2026-01-12T10:00:00Z',
    status: 'withdrawn',
    progress: {
      completionPercent: 25,
      modulesCompleted: 2,
      modulesTotal: 8,
      currentScore: 65,
      lastAccessedAt: '2026-01-20T09:00:00Z',
    },
    attendance: {
      sessionsAttended: 5,
      totalSessions: 16,
      attendanceRate: 31.25,
    },
  },
];

/**
 * Mock class roster
 */
export const mockClassRoster: ClassRoster = {
  classId: 'class-1',
  className: 'Introduction to Programming - Spring 2026',
  totalEnrolled: 3,
  roster: mockRosterItems,
};

/**
 * Mock class progress
 */
export const mockClassProgress: ClassProgress = {
  classId: 'class-1',
  className: 'Introduction to Programming - Spring 2026',
  totalLearners: 25,
  activeEnrollments: 24,
  averageProgress: 62.5,
  averageScore: 84.5,
  completedCount: 5,
  inProgressCount: 18,
  notStartedCount: 2,
  averageTimeSpent: 1800, // 30 minutes in seconds
  byModule: [
    {
      moduleId: 'module-1',
      title: 'Introduction to Programming',
      order: 1,
      completedCount: 22,
      inProgressCount: 2,
      notStartedCount: 1,
      averageScore: 88,
      averageAttempts: 1.2,
      averageTimeSpent: 1200,
    },
    {
      moduleId: 'module-2',
      title: 'Variables and Data Types',
      order: 2,
      completedCount: 20,
      inProgressCount: 3,
      notStartedCount: 2,
      averageScore: 85,
      averageAttempts: 1.5,
      averageTimeSpent: 1500,
    },
    {
      moduleId: 'module-3',
      title: 'Control Flow',
      order: 3,
      completedCount: 15,
      inProgressCount: 5,
      notStartedCount: 5,
      averageScore: 82,
      averageAttempts: 1.8,
      averageTimeSpent: 2000,
    },
  ],
  progressDistribution: {
    '0-25': 3,
    '26-50': 5,
    '51-75': 8,
    '76-100': 9,
  },
  scoreDistribution: {
    'A (90-100)': 8,
    'B (80-89)': 10,
    'C (70-79)': 5,
    'D (60-69)': 1,
    'F (0-59)': 1,
  },
};

/**
 * Mock class enrollments response
 */
export const mockClassEnrollmentsResponse: ClassEnrollmentsResponse = {
  classId: 'class-1',
  enrollments: mockClassEnrollments,
  pagination: {
    page: 1,
    limit: 20,
    total: 3,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

/**
 * Mock enrollment result
 */
export const mockEnrollmentResult: EnrollmentResult = {
  classId: 'class-1',
  enrollments: [
    {
      id: 'enrollment-4',
      learner: {
        id: 'learner-4',
        firstName: 'David',
        lastName: 'Smith',
        email: 'david.smith@example.com',
        studentId: 'STU004',
        profileImage: null,
      },
      enrolledAt: '2026-01-08T15:00:00Z',
      status: 'active',
    },
  ],
  successCount: 1,
  failedCount: 0,
  errors: [],
};

/**
 * Mock enrollment result with errors
 */
export const mockEnrollmentResultWithErrors: EnrollmentResult = {
  classId: 'class-1',
  enrollments: [],
  successCount: 0,
  failedCount: 2,
  errors: [
    {
      learnerId: 'learner-5',
      reason: 'Class is full',
    },
    {
      learnerId: 'learner-6',
      reason: 'Learner already enrolled',
    },
  ],
};

/**
 * Mock delete class response
 */
export const mockDeleteClassResponse: DeleteClassResponse = {
  id: 'class-1',
  deleted: true,
  deletedAt: '2026-01-08T16:00:00Z',
};

/**
 * Mock drop enrollment response
 */
export const mockDropEnrollmentResponse: DropEnrollmentResponse = {
  enrollmentId: 'enrollment-1',
  status: 'withdrawn',
  withdrawnAt: '2026-01-08T16:00:00Z',
};

/**
 * Mock create class payload
 */
export const mockCreateClassPayload: CreateClassPayload = {
  name: 'New Class - Spring 2026',
  course: 'course-1',
  program: 'program-1',
  programLevel: 'level-1',
  instructors: [
    {
      userId: 'instructor-1',
      role: 'primary',
    },
  ],
  startDate: '2026-02-01T00:00:00Z',
  endDate: '2026-06-01T00:00:00Z',
  duration: 16,
  capacity: 25,
  academicTerm: 'term-1',
};

/**
 * Factory function to create mock class
 */
export const createMockClass = (overrides?: Partial<Class>): Class => ({
  id: `class-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test Class - ${new Date().toISOString()}`,
  course: {
    id: 'course-1',
    title: 'Test Course',
    code: 'TEST101',
    description: 'A test course',
    credits: 3,
  },
  program: {
    id: 'program-1',
    name: 'Test Program',
    code: 'TEST',
  },
  instructors: [
    {
      id: 'instructor-1',
      firstName: 'Test',
      lastName: 'Instructor',
      email: 'test.instructor@example.com',
      role: 'primary',
      profileImage: null,
    },
  ],
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  duration: 12,
  capacity: 20,
  enrolledCount: 0,
  waitlistCount: 0,
  status: 'upcoming',
  department: {
    id: 'dept-1',
    name: 'Test Department',
    code: 'TEST',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory function to create mock class list item
 */
export const createMockClassListItem = (overrides?: Partial<ClassListItem>): ClassListItem => ({
  id: `class-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test Class - ${new Date().toISOString()}`,
  course: {
    id: 'course-1',
    title: 'Test Course',
    code: 'TEST101',
  },
  program: {
    id: 'program-1',
    name: 'Test Program',
  },
  instructors: [
    {
      id: 'instructor-1',
      firstName: 'Test',
      lastName: 'Instructor',
      email: 'test.instructor@example.com',
      role: 'primary',
      profileImage: null,
    },
  ],
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
  duration: 12,
  capacity: 20,
  enrolledCount: 0,
  status: 'upcoming',
  department: {
    id: 'dept-1',
    name: 'Test Department',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
