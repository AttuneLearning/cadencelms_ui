/**
 * Mock exercise data for testing
 */

import type {
  Exercise,
  ExerciseListItem,
  ExerciseQuestion,
  CreateExercisePayload,
  UpdateExercisePayload,
  AddQuestionPayload,
  BulkAddQuestionsPayload,
  BulkAddQuestionsResponse,
  AddQuestionResponse,
  RemoveQuestionResponse,
  ReorderQuestionsResponse,
  ExerciseQuestionsResponse,
  DepartmentRef,
  UserRef,
  ExerciseStatistics,
} from '@/entities/exercise/model/types';

// =====================
// MOCK REFERENCE DATA
// =====================

export const mockDepartment: DepartmentRef = {
  id: 'dept-1',
  name: 'Computer Science',
};

export const mockDepartment2: DepartmentRef = {
  id: 'dept-2',
  name: 'Mathematics',
};

export const mockCreator: UserRef = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Smith',
};

export const mockCreator2: UserRef = {
  id: 'user-2',
  firstName: 'Jane',
  lastName: 'Doe',
};

// =====================
// MOCK STATISTICS
// =====================

export const mockStatistics: ExerciseStatistics = {
  totalAttempts: 150,
  averageScore: 78.5,
  passRate: 85.3,
};

export const mockLowStatistics: ExerciseStatistics = {
  totalAttempts: 25,
  averageScore: 62.3,
  passRate: 48.0,
};

// =====================
// MOCK QUESTIONS
// =====================

export const mockMultipleChoiceQuestion: ExerciseQuestion = {
  id: 'q-1',
  questionText: 'What is the correct way to declare a variable in JavaScript?',
  questionTypes: ['multiple_choice'],
  order: 1,
  points: 10,
  options: ['var x = 5;', 'let x = 5;', 'const x = 5;', 'All of the above'],
  correctAnswers: ['All of the above'],
  explanation: 'JavaScript supports var, let, and const for variable declarations.',
  difficulty: 'easy',
  tags: ['javascript', 'variables'],
  createdAt: '2026-01-01T10:00:00Z',
};

export const mockTrueFalseQuestion: ExerciseQuestion = {
  id: 'q-2',
  questionText: 'JavaScript is a compiled language.',
  questionTypes: ['true_false'],
  order: 2,
  points: 5,
  correctAnswers: ['false'],
  explanation: 'JavaScript is an interpreted language, not compiled.',
  difficulty: 'easy',
  tags: ['javascript', 'fundamentals'],
  createdAt: '2026-01-01T10:05:00Z',
};

export const mockShortAnswerQuestion: ExerciseQuestion = {
  id: 'q-3',
  questionText: 'What is the keyword used to define a function in JavaScript?',
  questionTypes: ['short_answer'],
  order: 3,
  points: 5,
  correctAnswers: ['function'],
  difficulty: 'easy',
  tags: ['javascript', 'functions'],
  createdAt: '2026-01-01T10:10:00Z',
};

export const mockEssayQuestion: ExerciseQuestion = {
  id: 'q-4',
  questionText: 'Explain the concept of closures in JavaScript and provide an example.',
  questionTypes: ['essay'],
  order: 4,
  points: 20,
  correctAnswers: [],
  difficulty: 'hard',
  tags: ['javascript', 'closures', 'advanced'],
  createdAt: '2026-01-01T10:15:00Z',
};

export const mockMatchingQuestion: ExerciseQuestion = {
  id: 'q-5',
  questionText: 'Match the JavaScript array method to its purpose',
  questionTypes: ['matching'],
  order: 5,
  points: 15,
  options: ['map()', 'filter()', 'reduce()', 'forEach()'],
  correctAnswers: ['Transform elements', 'Select elements', 'Aggregate values', 'Iterate elements'],
  difficulty: 'medium',
  tags: ['javascript', 'arrays'],
  createdAt: '2026-01-01T10:20:00Z',
};

export const mockQuestions: ExerciseQuestion[] = [
  mockMultipleChoiceQuestion,
  mockTrueFalseQuestion,
  mockShortAnswerQuestion,
  mockEssayQuestion,
  mockMatchingQuestion,
];

// =====================
// MOCK EXERCISE LIST ITEMS
// =====================

export const mockQuizExercise: ExerciseListItem = {
  id: 'ex-1',
  title: 'JavaScript Fundamentals Quiz',
  description: 'Test your knowledge of basic JavaScript concepts',
  type: 'quiz',
  department: 'dept-1',
  difficulty: 'easy',
  timeLimit: 1800, // 30 minutes
  passingScore: 70,
  totalPoints: 50,
  questionCount: 5,
  shuffleQuestions: true,
  showFeedback: true,
  allowReview: true,
  status: 'published',
  createdBy: 'user-1',
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
};

export const mockExamExercise: ExerciseListItem = {
  id: 'ex-2',
  title: 'Final JavaScript Exam',
  description: 'Comprehensive final examination covering all JavaScript topics',
  type: 'exam',
  department: 'dept-1',
  difficulty: 'hard',
  timeLimit: 7200, // 2 hours
  passingScore: 80,
  totalPoints: 150,
  questionCount: 20,
  shuffleQuestions: true,
  showFeedback: false,
  allowReview: false,
  status: 'published',
  createdBy: 'user-1',
  createdAt: '2026-01-02T10:00:00Z',
  updatedAt: '2026-01-02T10:00:00Z',
};

export const mockPracticeExercise: ExerciseListItem = {
  id: 'ex-3',
  title: 'JavaScript Practice Problems',
  description: 'Practice exercises with immediate feedback',
  type: 'practice',
  department: 'dept-1',
  difficulty: 'medium',
  timeLimit: 0, // Unlimited
  passingScore: 60,
  totalPoints: 75,
  questionCount: 10,
  shuffleQuestions: false,
  showFeedback: true,
  allowReview: true,
  status: 'published',
  createdBy: 'user-2',
  createdAt: '2026-01-03T10:00:00Z',
  updatedAt: '2026-01-03T10:00:00Z',
};

export const mockAssessmentExercise: ExerciseListItem = {
  id: 'ex-4',
  title: 'Skills Assessment',
  description: 'Evaluate your overall JavaScript proficiency',
  type: 'assessment',
  department: 'dept-2',
  difficulty: 'medium',
  timeLimit: 3600, // 1 hour
  passingScore: 75,
  totalPoints: 100,
  questionCount: 15,
  shuffleQuestions: true,
  showFeedback: true,
  allowReview: true,
  status: 'published',
  createdBy: 'user-2',
  createdAt: '2026-01-04T10:00:00Z',
  updatedAt: '2026-01-04T10:00:00Z',
};

export const mockDraftExercise: ExerciseListItem = {
  id: 'ex-5',
  title: 'New Quiz - In Progress',
  description: 'Draft quiz being prepared',
  type: 'quiz',
  department: 'dept-1',
  difficulty: 'easy',
  timeLimit: 1200, // 20 minutes
  passingScore: 70,
  totalPoints: 0,
  questionCount: 0,
  shuffleQuestions: false,
  showFeedback: true,
  allowReview: true,
  status: 'draft',
  createdBy: 'user-1',
  createdAt: '2026-01-05T10:00:00Z',
  updatedAt: '2026-01-05T14:30:00Z',
};

export const mockArchivedExercise: ExerciseListItem = {
  id: 'ex-6',
  title: 'Legacy Quiz - Archived',
  description: 'Outdated quiz no longer in use',
  type: 'quiz',
  department: 'dept-1',
  difficulty: 'easy',
  timeLimit: 1800,
  passingScore: 70,
  totalPoints: 40,
  questionCount: 8,
  shuffleQuestions: true,
  showFeedback: true,
  allowReview: true,
  status: 'archived',
  createdBy: 'user-1',
  createdAt: '2025-06-01T10:00:00Z',
  updatedAt: '2025-12-01T10:00:00Z',
};

export const mockExerciseListItems: ExerciseListItem[] = [
  mockQuizExercise,
  mockExamExercise,
  mockPracticeExercise,
  mockAssessmentExercise,
  mockDraftExercise,
  mockArchivedExercise,
];

// =====================
// MOCK FULL EXERCISES
// =====================

export const mockPublishedQuiz: Exercise = {
  id: 'ex-1',
  title: 'JavaScript Fundamentals Quiz',
  description: 'Test your knowledge of basic JavaScript concepts',
  type: 'quiz',
  department: mockDepartment,
  difficulty: 'easy',
  timeLimit: 1800,
  passingScore: 70,
  totalPoints: 50,
  questionCount: 5,
  shuffleQuestions: true,
  showFeedback: true,
  allowReview: true,
  instructions: 'Read each question carefully. You have 30 minutes to complete this quiz.',
  status: 'published',
  createdBy: mockCreator,
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
  statistics: mockStatistics,
};

export const mockPublishedExam: Exercise = {
  id: 'ex-2',
  title: 'Final JavaScript Exam',
  description: 'Comprehensive final examination covering all JavaScript topics',
  type: 'exam',
  department: mockDepartment,
  difficulty: 'hard',
  timeLimit: 7200,
  passingScore: 80,
  totalPoints: 150,
  questionCount: 20,
  shuffleQuestions: true,
  showFeedback: false,
  allowReview: false,
  instructions: 'This is a proctored exam. No external resources allowed. Good luck!',
  status: 'published',
  createdBy: mockCreator,
  createdAt: '2026-01-02T10:00:00Z',
  updatedAt: '2026-01-02T10:00:00Z',
  statistics: mockLowStatistics,
};

export const mockDraftQuiz: Exercise = {
  id: 'ex-5',
  title: 'New Quiz - In Progress',
  description: 'Draft quiz being prepared',
  type: 'quiz',
  department: mockDepartment,
  difficulty: 'easy',
  timeLimit: 1200,
  passingScore: 70,
  totalPoints: 0,
  questionCount: 0,
  shuffleQuestions: false,
  showFeedback: true,
  allowReview: true,
  status: 'draft',
  createdBy: mockCreator,
  createdAt: '2026-01-05T10:00:00Z',
  updatedAt: '2026-01-05T14:30:00Z',
};

export const mockArchivedQuiz: Exercise = {
  id: 'ex-6',
  title: 'Legacy Quiz - Archived',
  description: 'Outdated quiz no longer in use',
  type: 'quiz',
  department: mockDepartment,
  difficulty: 'easy',
  timeLimit: 1800,
  passingScore: 70,
  totalPoints: 40,
  questionCount: 8,
  shuffleQuestions: true,
  showFeedback: true,
  allowReview: true,
  status: 'archived',
  createdBy: mockCreator,
  createdAt: '2025-06-01T10:00:00Z',
  updatedAt: '2025-12-01T10:00:00Z',
};

// =====================
// MOCK FORM PAYLOADS
// =====================

export const mockCreateExercisePayload: CreateExercisePayload = {
  title: 'New Test Exercise',
  description: 'A test exercise for unit testing',
  type: 'quiz',
  department: 'dept-1',
  difficulty: 'medium',
  timeLimit: 1800,
  passingScore: 70,
  shuffleQuestions: true,
  showFeedback: true,
  allowReview: true,
  instructions: 'Complete all questions to the best of your ability.',
};

export const mockUpdateExercisePayload: UpdateExercisePayload = {
  title: 'Updated Exercise Title',
  description: 'Updated description',
  difficulty: 'hard',
  timeLimit: 3600,
  passingScore: 80,
  shuffleQuestions: false,
  showFeedback: false,
  allowReview: false,
};

export const mockAddQuestionPayload: AddQuestionPayload = {
  questionText: 'What is React?',
  questionTypes: ['multiple_choice'],
  options: ['A library', 'A framework', 'A language', 'A database'],
  correctAnswers: ['A library'],
  points: 10,
  difficulty: 'easy',
  explanation: 'React is a JavaScript library for building user interfaces.',
  tags: ['react', 'fundamentals'],
};

export const mockBulkAddQuestionsPayload: BulkAddQuestionsPayload = {
  questions: [
    {
      questionText: 'Question 1',
      questionTypes: ['multiple_choice'],
      options: ['A', 'B', 'C', 'D'],
      correctAnswers: ['A'],
      points: 10,
      difficulty: 'easy',
    },
    {
      questionText: 'Question 2',
      questionTypes: ['true_false'],
      correctAnswers: ['true'],
      points: 5,
      difficulty: 'easy',
    },
    {
      questionText: 'Question 3',
      questionTypes: ['short_answer'],
      correctAnswers: ['answer'],
      points: 5,
      difficulty: 'medium',
    },
  ],
  mode: 'append',
};

// =====================
// MOCK API RESPONSES
// =====================

export const mockAddQuestionResponse: AddQuestionResponse = {
  exerciseId: 'ex-1',
  question: {
    id: 'q-new',
    questionText: 'What is React?',
    questionTypes: ['multiple_choice'],
    order: 6,
    points: 10,
    options: ['A library', 'A framework', 'A language', 'A database'],
    correctAnswers: ['A library'],
    explanation: 'React is a JavaScript library for building user interfaces.',
    difficulty: 'easy',
    tags: ['react', 'fundamentals'],
    createdAt: '2026-01-08T10:00:00Z',
  },
  updatedTotals: {
    questionCount: 6,
    totalPoints: 60,
  },
};

export const mockBulkAddQuestionsResponse: BulkAddQuestionsResponse = {
  exerciseId: 'ex-1',
  added: 3,
  failed: 0,
  errors: [],
  updatedTotals: {
    questionCount: 8,
    totalPoints: 70,
  },
};

export const mockBulkAddQuestionsWithErrorsResponse: BulkAddQuestionsResponse = {
  exerciseId: 'ex-1',
  added: 2,
  failed: 1,
  errors: [
    {
      index: 1,
      error: 'Invalid question type',
    },
  ],
  updatedTotals: {
    questionCount: 7,
    totalPoints: 65,
  },
};

export const mockRemoveQuestionResponse: RemoveQuestionResponse = {
  exerciseId: 'ex-1',
  removedQuestionId: 'q-3',
  updatedTotals: {
    questionCount: 4,
    totalPoints: 45,
  },
};

export const mockReorderQuestionsResponse: ReorderQuestionsResponse = {
  exerciseId: 'ex-1',
  questionCount: 5,
  updatedOrder: [
    { questionId: 'q-2', order: 1 },
    { questionId: 'q-1', order: 2 },
    { questionId: 'q-4', order: 3 },
    { questionId: 'q-3', order: 4 },
    { questionId: 'q-5', order: 5 },
  ],
};

export const mockExerciseQuestionsResponse: ExerciseQuestionsResponse = {
  exerciseId: 'ex-1',
  exerciseTitle: 'JavaScript Fundamentals Quiz',
  questionCount: 5,
  totalPoints: 50,
  questions: mockQuestions,
};

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockExercise = (overrides?: Partial<Exercise>): Exercise => ({
  id: `ex-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Exercise',
  description: 'A test exercise for unit testing',
  type: 'quiz',
  department: mockDepartment,
  difficulty: 'medium',
  timeLimit: 1800,
  passingScore: 70,
  totalPoints: 0,
  questionCount: 0,
  shuffleQuestions: false,
  showFeedback: true,
  allowReview: true,
  status: 'draft',
  createdBy: mockCreator,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockExerciseListItem = (
  overrides?: Partial<ExerciseListItem>
): ExerciseListItem => ({
  id: `ex-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Exercise',
  description: 'A test exercise for unit testing',
  type: 'quiz',
  department: 'dept-1',
  difficulty: 'medium',
  timeLimit: 1800,
  passingScore: 70,
  totalPoints: 0,
  questionCount: 0,
  shuffleQuestions: false,
  showFeedback: true,
  allowReview: true,
  status: 'draft',
  createdBy: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockQuestion = (overrides?: Partial<ExerciseQuestion>): ExerciseQuestion => ({
  id: `q-${Math.random().toString(36).substr(2, 9)}`,
  questionText: 'Test question',
  questionTypes: ['multiple_choice'],
  order: 1,
  points: 10,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctAnswers: ['Option A'],
  difficulty: 'medium',
  createdAt: new Date().toISOString(),
  ...overrides,
});
