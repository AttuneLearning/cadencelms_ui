/**
 * Mock data for exam attempts
 * Used in testing exam attempt functionality
 */

import type {
  ExamAttempt,
  ExamAttemptListItem,
  StartExamAttemptResponse,
  SubmitAnswersResponse,
  SubmitExamResponse,
  ExamResult,
  ExamAttemptsByExamResponse,
  ExamQuestion,
} from '@/entities/exam-attempt/model/types';

/**
 * Mock exam questions
 */
export const mockExamQuestions: ExamQuestion[] = [
  {
    id: 'q-1',
    questionText: 'What does CBT stand for?',
    questionType: 'multiple_choice',
    order: 1,
    points: 10,
    options: [
      'Computer-Based Training',
      'Cognitive Behavioral Therapy',
      'Core Business Technology',
      'Certified Business Trainer',
    ],
    hasAnswer: false,
  },
  {
    id: 'q-2',
    questionText: 'Learning Management Systems are used for online education.',
    questionType: 'true_false',
    order: 2,
    points: 5,
    options: ['true', 'false'],
    hasAnswer: false,
  },
  {
    id: 'q-3',
    questionText: 'Explain the benefits of adaptive learning.',
    questionType: 'short_answer',
    order: 3,
    points: 15,
    hasAnswer: false,
  },
];

/**
 * Mock exam questions with answers
 */
export const mockExamQuestionsWithAnswers: ExamQuestion[] = [
  {
    id: 'q-1',
    questionText: 'What does CBT stand for?',
    questionType: 'multiple_choice',
    order: 1,
    points: 10,
    options: [
      'Computer-Based Training',
      'Cognitive Behavioral Therapy',
      'Core Business Technology',
      'Certified Business Trainer',
    ],
    userAnswer: 'Computer-Based Training',
    correctAnswer: 'Computer-Based Training',
    isCorrect: true,
    scoreEarned: 10,
    feedback: null,
    explanation: 'CBT stands for Computer-Based Training in the context of educational technology.',
    hasAnswer: true,
  },
  {
    id: 'q-2',
    questionText: 'Learning Management Systems are used for online education.',
    questionType: 'true_false',
    order: 2,
    points: 5,
    options: ['true', 'false'],
    userAnswer: 'true',
    correctAnswer: 'true',
    isCorrect: true,
    scoreEarned: 5,
    feedback: null,
    explanation: 'LMS platforms are designed specifically for online education delivery.',
    hasAnswer: true,
  },
  {
    id: 'q-3',
    questionText: 'Explain the benefits of adaptive learning.',
    questionType: 'short_answer',
    order: 3,
    points: 15,
    userAnswer: 'Adaptive learning personalizes education based on individual needs.',
    correctAnswer: null,
    isCorrect: null,
    scoreEarned: 12,
    feedback: 'Good answer, but could include more specific examples.',
    explanation: '',
    hasAnswer: true,
  },
];

/**
 * Mock started exam attempt
 */
export const mockStartedAttempt: ExamAttempt = {
  id: 'attempt-1',
  examId: 'exam-1',
  examTitle: 'Introduction to CBT - Module 1 Quiz',
  examType: 'quiz',
  learnerId: 'learner-1',
  learnerName: 'Jane Smith',
  attemptNumber: 1,
  status: 'started',
  score: 0,
  maxScore: 100,
  percentage: 0,
  passed: false,
  gradeLetter: null,
  timeLimit: 1800,
  remainingTime: 1800,
  timeSpent: 0,
  questions: mockExamQuestions,
  instructions: 'Read each question carefully. You have 30 minutes to complete this quiz.',
  allowReview: true,
  showFeedback: true,
  startedAt: '2026-01-09T09:00:00.000Z',
  submittedAt: null,
  gradedAt: null,
  gradedBy: null,
  feedback: null,
  createdAt: '2026-01-09T09:00:00.000Z',
  updatedAt: '2026-01-09T09:00:00.000Z',
};

/**
 * Mock in-progress exam attempt
 */
export const mockInProgressAttempt: ExamAttempt = {
  ...mockStartedAttempt,
  id: 'attempt-2',
  status: 'in_progress',
  remainingTime: 1200,
  timeSpent: 600,
  questions: [
    { ...mockExamQuestions[0], userAnswer: 'Computer-Based Training', hasAnswer: true },
    { ...mockExamQuestions[1], hasAnswer: false },
    { ...mockExamQuestions[2], hasAnswer: false },
  ],
  updatedAt: '2026-01-09T09:10:00.000Z',
};

/**
 * Mock graded exam attempt
 */
export const mockGradedAttempt: ExamAttempt = {
  ...mockStartedAttempt,
  id: 'attempt-3',
  attemptNumber: 2,
  status: 'graded',
  score: 85,
  maxScore: 100,
  percentage: 85,
  passed: true,
  gradeLetter: 'B',
  remainingTime: null,
  timeSpent: 1500,
  questions: mockExamQuestionsWithAnswers,
  submittedAt: '2026-01-09T09:25:00.000Z',
  gradedAt: '2026-01-09T09:30:00.000Z',
  gradedBy: {
    id: 'instructor-1',
    firstName: 'John',
    lastName: 'Doe',
  },
  feedback: 'Great job! You demonstrated a solid understanding of the material.',
  updatedAt: '2026-01-09T09:30:00.000Z',
};

/**
 * Mock submitted exam attempt (pending grading)
 */
export const mockSubmittedAttempt: ExamAttempt = {
  ...mockStartedAttempt,
  id: 'attempt-4',
  status: 'submitted',
  remainingTime: null,
  timeSpent: 1400,
  submittedAt: '2026-01-09T09:23:00.000Z',
  updatedAt: '2026-01-09T09:23:00.000Z',
};

/**
 * Mock exam attempt list items
 */
export const mockExamAttemptListItems: ExamAttemptListItem[] = [
  {
    id: 'attempt-3',
    examId: 'exam-1',
    examTitle: 'Introduction to CBT - Module 1 Quiz',
    learnerId: 'learner-1',
    learnerName: 'Jane Smith',
    attemptNumber: 2,
    status: 'graded',
    score: 85,
    maxScore: 100,
    percentage: 85,
    passed: true,
    gradeLetter: 'B',
    startedAt: '2026-01-09T09:00:00.000Z',
    submittedAt: '2026-01-09T09:25:00.000Z',
    gradedAt: '2026-01-09T09:30:00.000Z',
    timeSpent: 1500,
    remainingTime: null,
    createdAt: '2026-01-09T09:00:00.000Z',
    updatedAt: '2026-01-09T09:30:00.000Z',
  },
  {
    id: 'attempt-1',
    examId: 'exam-1',
    examTitle: 'Introduction to CBT - Module 1 Quiz',
    learnerId: 'learner-1',
    learnerName: 'Jane Smith',
    attemptNumber: 1,
    status: 'graded',
    score: 70,
    maxScore: 100,
    percentage: 70,
    passed: true,
    gradeLetter: 'C',
    startedAt: '2026-01-08T09:00:00.000Z',
    submittedAt: '2026-01-08T09:25:00.000Z',
    gradedAt: '2026-01-08T09:30:00.000Z',
    timeSpent: 1500,
    remainingTime: null,
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-01-08T09:30:00.000Z',
  },
];

/**
 * Mock start exam attempt response
 */
export const mockStartExamAttemptResponse: StartExamAttemptResponse = {
  id: 'attempt-1',
  examId: 'exam-1',
  examTitle: 'Introduction to CBT - Module 1 Quiz',
  learnerId: 'learner-1',
  attemptNumber: 1,
  status: 'started',
  score: 0,
  maxScore: 100,
  timeLimit: 1800,
  remainingTime: 1800,
  shuffleQuestions: true,
  questions: mockExamQuestions,
  instructions: 'Read each question carefully. You have 30 minutes to complete this quiz.',
  allowReview: true,
  startedAt: '2026-01-09T09:00:00.000Z',
  createdAt: '2026-01-09T09:00:00.000Z',
};

/**
 * Mock submit answers response
 */
export const mockSubmitAnswersResponse: SubmitAnswersResponse = {
  attemptId: 'attempt-1',
  status: 'in_progress',
  answeredCount: 2,
  totalQuestions: 10,
  remainingTime: 1200,
  updatedAnswers: [
    {
      questionId: 'q-1',
      answer: 'Computer-Based Training',
      savedAt: '2026-01-09T09:15:00.000Z',
    },
    {
      questionId: 'q-2',
      answer: 'true',
      savedAt: '2026-01-09T09:15:00.000Z',
    },
  ],
};

/**
 * Mock submit exam response
 */
export const mockSubmitExamResponse: SubmitExamResponse = {
  attemptId: 'attempt-1',
  status: 'graded',
  score: 85,
  maxScore: 100,
  percentage: 85,
  passed: true,
  gradeLetter: 'B',
  autoGraded: true,
  requiresManualGrading: false,
  submittedAt: '2026-01-09T09:25:00.000Z',
  gradedAt: '2026-01-09T09:25:00.000Z',
  timeSpent: 1500,
  answeredCount: 10,
  totalQuestions: 10,
  correctCount: 9,
  incorrectCount: 1,
  unansweredCount: 0,
};

/**
 * Mock exam result
 */
export const mockExamResult: ExamResult = {
  attemptId: 'attempt-3',
  examTitle: 'Introduction to CBT - Module 1 Quiz',
  learnerName: 'Jane Smith',
  attemptNumber: 2,
  status: 'graded',
  score: 85,
  maxScore: 100,
  percentage: 85,
  passed: true,
  gradeLetter: 'B',
  passingScore: 70,
  submittedAt: '2026-01-09T09:25:00.000Z',
  gradedAt: '2026-01-09T09:30:00.000Z',
  timeSpent: 1500,
  timeLimit: 1800,
  summary: {
    totalQuestions: 10,
    answeredCount: 10,
    unansweredCount: 0,
    correctCount: 9,
    incorrectCount: 1,
    partialCreditCount: 0,
  },
  questionResults: mockExamQuestionsWithAnswers,
  overallFeedback: 'Great job! You demonstrated a solid understanding of the material.',
  gradedBy: {
    id: 'instructor-1',
    firstName: 'John',
    lastName: 'Doe',
  },
  allowReview: true,
  showCorrectAnswers: true,
};

/**
 * Mock exam attempts by exam response
 */
export const mockExamAttemptsByExamResponse: ExamAttemptsByExamResponse = {
  examId: 'exam-1',
  examTitle: 'Introduction to CBT - Module 1 Quiz',
  statistics: {
    totalAttempts: 125,
    completedAttempts: 120,
    inProgressAttempts: 5,
    averageScore: 82.5,
    averagePercentage: 82.5,
    passRate: 0.89,
    averageTimeSpent: 1450,
  },
  attempts: [
    {
      ...mockExamAttemptListItems[0],
      learnerEmail: 'jane.smith@example.com',
      requiresGrading: false,
    },
    {
      ...mockExamAttemptListItems[1],
      learnerEmail: 'jane.smith@example.com',
      requiresGrading: false,
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

/**
 * Helper to create a mock exam attempt
 */
export function createMockExamAttempt(overrides?: Partial<ExamAttempt>): ExamAttempt {
  return {
    ...mockStartedAttempt,
    ...overrides,
  };
}

/**
 * Helper to create a mock exam question
 */
export function createMockExamQuestion(overrides?: Partial<ExamQuestion>): ExamQuestion {
  return {
    ...mockExamQuestions[0],
    ...overrides,
  };
}
