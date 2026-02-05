/**
 * UAT Test Fixtures - User States
 * 
 * Provides consistent user data for UAT scenarios.
 * These represent different user personas and their expected states.
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
 * Test users for different UAT scenarios
 */
export const uatUsers: Record<string, UATUser> = {
  learner: {
    id: 'uat-learner-001',
    email: 'uat.learner@test.cadencelms.com',
    password: 'UatTest123!',
    displayName: 'UAT Learner',
    role: 'learner',
    expectedDashboard: '/learner/dashboard',
  },
  
  staff: {
    id: 'uat-staff-001',
    email: 'uat.staff@test.cadencelms.com',
    password: 'UatTest123!',
    displayName: 'UAT Staff Member',
    role: 'staff',
    expectedDashboard: '/staff/dashboard',
  },
  
  admin: {
    id: 'uat-admin-001',
    email: 'uat.admin@test.cadencelms.com',
    password: 'UatTest123!',
    displayName: 'UAT Administrator',
    role: 'admin',
    expectedDashboard: '/admin/dashboard',
  },
};

/**
 * User enrollment states
 */
export const enrollmentStates = {
  noEnrollments: {
    userId: 'uat-learner-001',
    courses: [],
  },
  
  singleEnrollment: {
    userId: 'uat-learner-001',
    courses: [
      { courseId: 'course-101', status: 'enrolled', progress: 0 },
    ],
  },
  
  inProgress: {
    userId: 'uat-learner-001',
    courses: [
      { courseId: 'course-101', status: 'in-progress', progress: 45 },
    ],
  },
  
  completed: {
    userId: 'uat-learner-001',
    courses: [
      { courseId: 'course-101', status: 'completed', progress: 100 },
    ],
  },
};
