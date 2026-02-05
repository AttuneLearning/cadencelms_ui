/**
 * UAT Test Fixtures - Instructor Workflow Data
 * 
 * Test data for instructor course creation workflow
 */

export interface UATCourseCreation {
  title: string;
  code: string;
  description: string;
  department: string;
  credits?: number;
  passingScore: number;
}

export interface UATModule {
  title: string;
  description: string;
  order: number;
}

export interface UATQuestion {
  questionText: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'multiple-select';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface UATQuiz {
  title: string;
  description: string;
  type: 'quiz';
  timeLimit: number; // minutes, 0 = unlimited
  passingScore: number;
  shuffleQuestions: boolean;
  showFeedback: boolean;
}

/**
 * Instructor workflow test data
 */
export const instructorWorkflow = {
  course: {
    title: 'UAT Test Course - Instructor Workflow',
    code: 'UATCOURSE101',
    description: 'A test course created during UAT to validate the instructor workflow for creating courses, modules, questions, and quizzes.',
    department: '', // Will be selected from available departments
    credits: 3,
    passingScore: 70,
  } satisfies UATCourseCreation,

  modules: [
    {
      title: 'Module 1: Introduction',
      description: 'This module covers the foundational concepts and introduces key terminology.',
      order: 1,
    },
    {
      title: 'Module 2: Core Concepts',
      description: 'Deep dive into the core concepts with practical examples and exercises.',
      order: 2,
    },
  ] satisfies UATModule[],

  questions: [
    {
      questionText: 'What is the primary purpose of user acceptance testing?',
      type: 'multiple-choice',
      options: [
        'To test code performance',
        'To validate the system meets business requirements',
        'To find security vulnerabilities',
        'To test database connections',
      ],
      correctAnswer: 'To validate the system meets business requirements',
      points: 10,
      difficulty: 'easy',
      tags: ['UAT', 'testing', 'fundamentals'],
    },
    {
      questionText: 'UAT should be performed by end users or their representatives.',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'True',
      points: 5,
      difficulty: 'easy',
      tags: ['UAT', 'best-practices'],
    },
    {
      questionText: 'Which of the following are valid UAT testing approaches? Select all that apply.',
      type: 'multiple-select',
      options: [
        'Alpha testing',
        'Beta testing',
        'Contract acceptance testing',
        'Unit testing',
      ],
      correctAnswer: ['Alpha testing', 'Beta testing', 'Contract acceptance testing'],
      points: 15,
      difficulty: 'medium',
      tags: ['UAT', 'testing-types'],
    },
  ] satisfies UATQuestion[],

  quizzes: [
    {
      title: 'Module 1 Quiz: Introduction Assessment',
      description: 'Test your understanding of the introductory concepts.',
      type: 'quiz',
      timeLimit: 15, // 15 minutes
      passingScore: 70,
      shuffleQuestions: true,
      showFeedback: true,
    },
    {
      title: 'Module 2 Quiz: Core Concepts Assessment',
      description: 'Evaluate your knowledge of core concepts covered in Module 2.',
      type: 'quiz',
      timeLimit: 20, // 20 minutes
      passingScore: 75,
      shuffleQuestions: false,
      showFeedback: true,
    },
  ] satisfies UATQuiz[],
};

/**
 * Instructor user for the workflow
 */
export const instructorUser = {
  id: 'uat-instructor-001',
  email: 'riley.instructor@lms.edu',
  password: 'Password123!',
  displayName: 'Riley Instructor',
  role: 'staff' as const,
  expectedDashboard: '/staff/dashboard',
};
