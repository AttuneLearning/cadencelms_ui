/**
 * Mock program level data for testing
 */

import type {
  ProgramLevel,
  ProgramLevelListItem,
  ProgramLevelFormData,
  ProgramLevelProgramRef,
  ReorderedProgramLevel,
} from '@/entities/program-level/model/types';

/**
 * Mock program reference
 */
export const mockProgramRef: ProgramLevelProgramRef = {
  id: 'prog-1',
  name: 'Bachelor of Science in Computer Science',
  code: 'CS-BSC',
  departmentId: 'dept-1',
};

/**
 * Mock program levels list items
 */
export const mockProgramLevelListItems: ProgramLevelListItem[] = [
  {
    id: 'level-1',
    name: 'Year 1: Foundation',
    order: 1,
    programId: 'prog-1',
    description: 'Introduction to computer science fundamentals and programming basics',
    requiredCredits: 30,
    courseCount: 6,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'level-2',
    name: 'Year 2: Core Concepts',
    order: 2,
    programId: 'prog-1',
    description: 'Data structures, algorithms, and software engineering principles',
    requiredCredits: 30,
    courseCount: 8,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'level-3',
    name: 'Year 3: Advanced Topics',
    order: 3,
    programId: 'prog-1',
    description: 'Advanced algorithms, system design, and specialized areas',
    requiredCredits: 30,
    courseCount: 7,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'level-4',
    name: 'Year 4: Capstone',
    order: 4,
    programId: 'prog-1',
    description: 'Final year project, electives, and career preparation',
    requiredCredits: 30,
    courseCount: 5,
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
];

/**
 * Mock full program level with program reference
 */
export const mockProgramLevel: ProgramLevel = {
  id: 'level-1',
  name: 'Year 1: Foundation',
  order: 1,
  programId: 'prog-1',
  program: mockProgramRef,
  description: 'Introduction to computer science fundamentals and programming basics',
  requiredCredits: 30,
  courses: ['course-1', 'course-2', 'course-3', 'course-4', 'course-5', 'course-6'],
  createdAt: '2025-09-01T10:00:00Z',
  updatedAt: '2025-09-01T10:00:00Z',
};

/**
 * Mock program level with courses
 */
export const mockProgramLevelWithCourses: ProgramLevel = {
  id: 'level-2',
  name: 'Year 2: Core Concepts',
  order: 2,
  programId: 'prog-1',
  program: mockProgramRef,
  description: 'Data structures, algorithms, and software engineering principles',
  requiredCredits: 30,
  courses: [
    'course-7',
    'course-8',
    'course-9',
    'course-10',
    'course-11',
    'course-12',
    'course-13',
    'course-14',
  ],
  createdAt: '2025-09-01T10:00:00Z',
  updatedAt: '2025-09-01T10:00:00Z',
};

/**
 * Mock program level without optional fields
 */
export const mockMinimalProgramLevel: ProgramLevel = {
  id: 'level-5',
  name: 'Elective Level',
  order: 5,
  programId: 'prog-1',
  program: mockProgramRef,
  description: null,
  requiredCredits: null,
  courses: [],
  createdAt: '2025-09-01T10:00:00Z',
  updatedAt: '2025-09-01T10:00:00Z',
};

/**
 * Mock program level list item with no courses
 */
export const mockEmptyProgramLevelListItem: ProgramLevelListItem = {
  id: 'level-6',
  name: 'New Level',
  order: 6,
  programId: 'prog-1',
  description: null,
  requiredCredits: null,
  courseCount: 0,
  createdAt: '2025-12-01T10:00:00Z',
  updatedAt: '2025-12-01T10:00:00Z',
};

/**
 * Mock form data for creating program level
 */
export const mockCreateProgramLevelFormData: ProgramLevelFormData = {
  name: 'Year 1: Foundation',
  description: 'Introduction to computer science fundamentals and programming basics',
  requiredCredits: 30,
  courses: ['course-1', 'course-2', 'course-3'],
};

/**
 * Mock form data for updating program level
 */
export const mockUpdateProgramLevelFormData: ProgramLevelFormData = {
  name: 'Year 1: Foundation (Updated)',
  description: 'Updated description for the foundation year',
  requiredCredits: 32,
  courses: ['course-1', 'course-2', 'course-3', 'course-4'],
};

/**
 * Mock minimal form data (only required fields)
 */
export const mockMinimalFormData: ProgramLevelFormData = {
  name: 'New Level',
};

/**
 * Mock reordered program levels
 */
export const mockReorderedLevels: ReorderedProgramLevel[] = [
  {
    id: 'level-1',
    name: 'Year 1: Foundation',
    order: 2,
  },
  {
    id: 'level-2',
    name: 'Year 2: Core Concepts',
    order: 1,
  },
];

/**
 * Factory function to create mock program level
 */
export const createMockProgramLevel = (
  overrides?: Partial<ProgramLevel>
): ProgramLevel => ({
  id: `level-${Math.random().toString(36).substr(2, 9)}`,
  name: `Level ${Math.floor(Math.random() * 100)}`,
  order: Math.floor(Math.random() * 10) + 1,
  programId: 'prog-1',
  program: mockProgramRef,
  description: 'Mock level description',
  requiredCredits: 30,
  courses: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory function to create mock program level list item
 */
export const createMockProgramLevelListItem = (
  overrides?: Partial<ProgramLevelListItem>
): ProgramLevelListItem => ({
  id: `level-${Math.random().toString(36).substr(2, 9)}`,
  name: `Level ${Math.floor(Math.random() * 100)}`,
  order: Math.floor(Math.random() * 10) + 1,
  programId: 'prog-1',
  description: 'Mock level description',
  requiredCredits: 30,
  courseCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
