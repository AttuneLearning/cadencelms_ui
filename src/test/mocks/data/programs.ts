/**
 * Mock program data for testing
 */

import type {
  Program,
  ProgramListItem,
  ProgramFormData,
  ProgramLevel,
  ProgramStatistics,
  CreateProgramPayload,
  UpdateProgramPayload,
  ProgramLevelDetail,
  ProgramEnrollment,
} from '@/entities/program/model/types';

export const mockProgramListItems: ProgramListItem[] = [
  {
    id: 'program-1',
    name: 'Certified Business Technician',
    code: 'CBT-101',
    description: 'Comprehensive business technology certification program',
    department: {
      id: 'dept-1',
      name: 'Business Technology',
    },
    credential: 'certificate',
    duration: 6,
    durationUnit: 'months',
    isPublished: true,
    status: 'active',
    totalLevels: 3,
    totalCourses: 12,
    activeEnrollments: 45,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'program-2',
    name: 'Advanced Software Engineering Diploma',
    code: 'ASED-202',
    description: 'Professional diploma in software engineering practices',
    department: {
      id: 'dept-2',
      name: 'Computer Science',
    },
    credential: 'diploma',
    duration: 12,
    durationUnit: 'months',
    isPublished: true,
    status: 'active',
    totalLevels: 4,
    totalCourses: 18,
    activeEnrollments: 32,
    createdAt: '2025-11-15T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'program-3',
    name: 'Bachelor of Information Technology',
    code: 'BIT-301',
    description: 'Undergraduate degree in information technology',
    department: {
      id: 'dept-2',
      name: 'Computer Science',
    },
    credential: 'degree',
    duration: 3,
    durationUnit: 'years',
    isPublished: false,
    status: 'active',
    totalLevels: 6,
    totalCourses: 36,
    activeEnrollments: 0,
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
  },
  {
    id: 'program-4',
    name: 'Healthcare Administration Certificate',
    code: 'HAC-401',
    description: 'Certificate in healthcare administration and management',
    department: {
      id: 'dept-3',
      name: 'Healthcare',
    },
    credential: 'certificate',
    duration: 4,
    durationUnit: 'months',
    isPublished: true,
    status: 'inactive',
    totalLevels: 2,
    totalCourses: 8,
    activeEnrollments: 12,
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'program-5',
    name: 'Digital Marketing Essentials',
    code: 'DME-501',
    description: 'Essential digital marketing skills and strategies',
    department: {
      id: 'dept-4',
      name: 'Marketing',
    },
    credential: 'certificate',
    duration: 8,
    durationUnit: 'weeks',
    isPublished: true,
    status: 'archived',
    totalLevels: 2,
    totalCourses: 6,
    activeEnrollments: 0,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-11-30T10:00:00Z',
  },
];

export const mockProgramLevels: ProgramLevel[] = [
  {
    id: 'level-1',
    name: 'Foundation Level',
    levelNumber: 1,
    courseCount: 4,
  },
  {
    id: 'level-2',
    name: 'Intermediate Level',
    levelNumber: 2,
    courseCount: 4,
  },
  {
    id: 'level-3',
    name: 'Advanced Level',
    levelNumber: 3,
    courseCount: 4,
  },
];

export const mockProgramStatistics: ProgramStatistics = {
  totalLevels: 3,
  totalCourses: 12,
  totalEnrollments: 60,
  activeEnrollments: 45,
  completedEnrollments: 15,
  completionRate: 0.25,
};

export const mockFullProgram: Program = {
  id: 'program-1',
  name: 'Certified Business Technician',
  code: 'CBT-101',
  description: 'Comprehensive business technology certification program',
  department: {
    id: 'dept-1',
    name: 'Business Technology',
    code: 'BT',
  },
  credential: 'certificate',
  duration: 6,
  durationUnit: 'months',
  isPublished: true,
  status: 'active',
  levels: mockProgramLevels,
  statistics: mockProgramStatistics,
  createdAt: '2025-12-01T10:00:00Z',
  updatedAt: '2026-01-08T10:00:00Z',
  createdBy: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
  },
};

export const mockProgramFormData: ProgramFormData = {
  name: 'New Test Program',
  code: 'NTP-999',
  description: 'Test program for unit testing',
  department: 'dept-1',
  credential: 'certificate',
  duration: 3,
  durationUnit: 'months',
  isPublished: false,
};

export const mockCreateProgramPayload: CreateProgramPayload = {
  name: 'New Test Program',
  code: 'NTP-999',
  description: 'Test program for unit testing',
  department: 'dept-1',
  credential: 'certificate',
  duration: 3,
  durationUnit: 'months',
  isPublished: false,
};

export const mockUpdateProgramPayload: UpdateProgramPayload = {
  name: 'Updated Program Name',
  description: 'Updated description',
  credential: 'diploma',
  duration: 9,
  durationUnit: 'months',
  isPublished: true,
  status: 'active',
};

export const mockProgramLevelDetails: ProgramLevelDetail[] = [
  {
    id: 'level-1',
    name: 'Foundation Level',
    levelNumber: 1,
    description: 'Introduction to business technology fundamentals',
    courses: [
      {
        id: 'course-1',
        title: 'Business Fundamentals',
        code: 'BF-101',
        isPublished: true,
      },
      {
        id: 'course-2',
        title: 'Technology Basics',
        code: 'TB-101',
        isPublished: true,
      },
    ],
    courseCount: 2,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
  {
    id: 'level-2',
    name: 'Intermediate Level',
    levelNumber: 2,
    description: 'Building on foundation knowledge',
    courses: [
      {
        id: 'course-3',
        title: 'Advanced Business Analysis',
        code: 'ABA-201',
        isPublished: true,
      },
      {
        id: 'course-4',
        title: 'Systems Integration',
        code: 'SI-201',
        isPublished: false,
      },
    ],
    courseCount: 2,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
];

export const mockProgramEnrollments: ProgramEnrollment[] = [
  {
    id: 'enrollment-1',
    learner: {
      id: 'learner-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      studentId: 'STU-001',
    },
    credentialGoal: 'certificate',
    status: 'active',
    progress: 65,
    enrolledAt: '2025-12-15T10:00:00Z',
    completedAt: null,
    withdrawnAt: null,
    coursesCompleted: 8,
    coursesTotal: 12,
  },
  {
    id: 'enrollment-2',
    learner: {
      id: 'learner-2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      studentId: 'STU-002',
    },
    credentialGoal: 'certificate',
    status: 'completed',
    progress: 100,
    enrolledAt: '2025-11-01T10:00:00Z',
    completedAt: '2026-01-05T10:00:00Z',
    withdrawnAt: null,
    coursesCompleted: 12,
    coursesTotal: 12,
  },
  {
    id: 'enrollment-3',
    learner: {
      id: 'learner-3',
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      studentId: 'STU-003',
    },
    credentialGoal: 'certificate',
    status: 'withdrawn',
    progress: 25,
    enrolledAt: '2025-12-01T10:00:00Z',
    completedAt: null,
    withdrawnAt: '2025-12-20T10:00:00Z',
    coursesCompleted: 3,
    coursesTotal: 12,
  },
];

export const createMockProgram = (overrides?: Partial<Program>): Program => ({
  id: `program-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Program',
  code: `TEST-${Math.floor(Math.random() * 1000)}`,
  description: 'Test program description',
  department: {
    id: 'dept-1',
    name: 'Test Department',
    code: 'TD',
  },
  credential: 'certificate',
  duration: 6,
  durationUnit: 'months',
  isPublished: false,
  status: 'active',
  levels: [],
  statistics: {
    totalLevels: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    completionRate: 0,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
  },
  ...overrides,
});

export const createMockProgramListItem = (
  overrides?: Partial<ProgramListItem>
): ProgramListItem => ({
  id: `program-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Program',
  code: `TEST-${Math.floor(Math.random() * 1000)}`,
  description: 'Test program description',
  department: {
    id: 'dept-1',
    name: 'Test Department',
  },
  credential: 'certificate',
  duration: 6,
  durationUnit: 'months',
  isPublished: false,
  status: 'active',
  totalLevels: 0,
  totalCourses: 0,
  activeEnrollments: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const mockDepartments = [
  { id: 'dept-1', name: 'Business Technology', code: 'BT' },
  { id: 'dept-2', name: 'Computer Science', code: 'CS' },
  { id: 'dept-3', name: 'Healthcare', code: 'HC' },
  { id: 'dept-4', name: 'Marketing', code: 'MKT' },
];
