/**
 * UAT Test Fixtures - Course Data
 * 
 * Provides consistent course data for UAT scenarios.
 */

export interface UATCourse {
  id: string;
  title: string;
  description: string;
  status: 'published' | 'draft' | 'archived';
  enrollmentType: 'open' | 'approval' | 'invite-only';
  estimatedDuration: number; // in minutes
}

/**
 * Test courses for UAT scenarios
 */
export const uatCourses: Record<string, UATCourse> = {
  basicCourse: {
    id: 'course-101',
    title: 'Introduction to Testing',
    description: 'A foundational course on testing principles',
    status: 'published',
    enrollmentType: 'open',
    estimatedDuration: 60,
  },
  
  advancedCourse: {
    id: 'course-201',
    title: 'Advanced Testing Strategies',
    description: 'Deep dive into testing methodologies',
    status: 'published',
    enrollmentType: 'approval',
    estimatedDuration: 120,
  },
  
  draftCourse: {
    id: 'course-draft-001',
    title: 'Upcoming Course (Draft)',
    description: 'Course still in development',
    status: 'draft',
    enrollmentType: 'invite-only',
    estimatedDuration: 90,
  },
};

/**
 * Course catalog states for testing different views
 */
export const catalogStates = {
  empty: {
    courses: [],
    totalCount: 0,
  },
  
  singleCourse: {
    courses: [uatCourses.basicCourse],
    totalCount: 1,
  },
  
  multipleCourses: {
    courses: [uatCourses.basicCourse, uatCourses.advancedCourse],
    totalCount: 2,
  },
  
  withDrafts: {
    courses: [uatCourses.basicCourse, uatCourses.advancedCourse, uatCourses.draftCourse],
    totalCount: 3,
  },
};
