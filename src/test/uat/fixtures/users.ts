/**
 * UAT Test Fixtures - User States
 *
 * Provides consistent user data for UAT scenarios.
 * These map to seeded users from the API's seed-mock-data script.
 * All passwords default to Password123! except admin which uses Admin123!
 */

export interface UATUser {
  id: string;
  email: string;
  password: string;
  escalationPassword?: string;
  displayName: string;
  role: 'learner' | 'staff' | 'admin';
  expectedDashboard: string;
}

/**
 * Test users for different UAT scenarios — mapped to API seed data
 */
export const uatUsers: Record<string, UATUser> = {
  learner: {
    id: 'casey-learner',
    email: 'casey.learner@lms.edu',
    password: 'Password123!',
    displayName: 'Casey Learner',
    role: 'learner',
    expectedDashboard: '/learner/dashboard',
  },

  staff: {
    id: 'john-instructor',
    email: 'john.instructor@lms.edu',
    password: 'Password123!',
    displayName: 'John Instructor',
    role: 'staff',
    expectedDashboard: '/staff/dashboard',
  },

  admin: {
    id: 'admin',
    email: 'admin@lms.edu',
    password: 'Admin123!',
    escalationPassword: 'Escalate123!',
    displayName: 'Admin',
    role: 'admin',
    expectedDashboard: '/admin/dashboard',
  },

  /**
   * Riley Instructor - Staff member with multiple department memberships
   * Used for testing department switching functionality
   * Departments: Cognitive Therapy (primary), CBT Fundamentals
   * Roles: instructor, content-admin, department-admin
   */
  rileyInstructor: {
    id: 'riley-instructor',
    email: 'riley.instructor@lms.edu',
    password: 'Password123!',
    displayName: 'Riley Instructor',
    role: 'staff',
    expectedDashboard: '/staff/dashboard',
  },
};

/**
 * User enrollment states
 */
export const enrollmentStates = {
  noEnrollments: {
    userId: 'alex-learner',
    courses: [],
  },

  singleEnrollment: {
    userId: 'casey-learner',
    courses: [
      { courseId: 'course-101', status: 'enrolled', progress: 0 },
    ],
  },

  inProgress: {
    userId: 'casey-learner',
    courses: [
      { courseId: 'course-101', status: 'in-progress', progress: 45 },
    ],
  },

  completed: {
    userId: 'casey-learner',
    courses: [
      { courseId: 'course-101', status: 'completed', progress: 100 },
    ],
  },
};
