/**
 * Mock question data for testing
 */

import type {
  Question,
  QuestionListItem,
  QuestionDetails,
  QuestionFormData,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  BulkImportQuestionItem,
  BulkImportResponse,
  AnswerOption,
} from '@/entities/question/model/types';

/**
 * Sample answer options for multiple choice questions
 */
export const mockMultipleChoiceOptions: AnswerOption[] = [
  { text: 'JavaScript is a compiled language', isCorrect: false },
  { text: 'JavaScript is an interpreted language', isCorrect: true },
  { text: 'JavaScript is a machine code language', isCorrect: false },
  { text: 'JavaScript is an assembly language', isCorrect: false },
];

export const mockTrueFalseOptions: AnswerOption[] = [
  { text: 'True', isCorrect: true },
  { text: 'False', isCorrect: false },
];

/**
 * Mock questions covering all types
 */
export const mockQuestions: QuestionListItem[] = [
  {
    id: 'q1',
    departmentId: 'dept-1',
    questionBankId: 'qb-1',
    questionText: 'What is JavaScript?',
    questionTypes: ['multiple_choice'],
    options: mockMultipleChoiceOptions,
    correctAnswer: 'JavaScript is an interpreted language',
    points: 2,
    difficulty: 'easy',
    tags: ['javascript', 'basics', 'programming'],
    explanation: 'JavaScript is an interpreted language that runs in browsers and Node.js environments.',
    createdBy: 'user-1',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'q2',
    departmentId: 'dept-1',
    questionBankId: 'qb-1',
    questionText: 'Is TypeScript a superset of JavaScript?',
    questionTypes: ['true_false'],
    options: mockTrueFalseOptions,
    correctAnswer: 'True',
    points: 1,
    difficulty: 'easy',
    tags: ['typescript', 'javascript'],
    explanation: 'TypeScript adds static typing and other features on top of JavaScript.',
    createdBy: 'user-1',
    createdAt: '2025-12-05T10:00:00Z',
    updatedAt: '2025-12-05T10:00:00Z',
  },
  {
    id: 'q3',
    departmentId: 'dept-1',
    questionBankId: 'qb-1',
    questionText: 'What is the purpose of React Hooks?',
    questionTypes: ['short_answer'],
    options: [],
    correctAnswer: 'React Hooks allow functional components to use state and lifecycle features',
    points: 3,
    difficulty: 'medium',
    tags: ['react', 'hooks', 'javascript'],
    explanation: 'Hooks like useState and useEffect enable functional components to manage state and side effects.',
    createdBy: 'user-2',
    createdAt: '2025-12-10T10:00:00Z',
    updatedAt: '2025-12-10T10:00:00Z',
  },
  {
    id: 'q4',
    departmentId: 'dept-1',
    questionBankId: 'qb-1',
    questionText: 'Explain the concept of closure in JavaScript and provide a practical use case.',
    questionTypes: ['long_answer'],
    options: [],
    correctAnswer: 'A closure is a function that has access to variables in its outer scope, even after the outer function has returned. Common use cases include data privacy, function factories, and maintaining state in asynchronous operations.',
    points: 5,
    difficulty: 'hard',
    tags: ['javascript', 'closures', 'advanced'],
    explanation: 'Closures are fundamental to JavaScript and enable powerful patterns like module patterns and callbacks.',
    createdBy: 'user-2',
    createdAt: '2025-12-15T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'q5',
    departmentId: 'dept-1',
    questionBankId: 'qb-1',
    questionText: 'Complete the code: const greeting = _____ => `Hello, ${name}!`;',
    questionTypes: ['fill_in_blank'],
    options: [],
    correctAnswer: '(name)',
    points: 2,
    difficulty: 'medium',
    tags: ['javascript', 'arrow-functions', 'syntax'],
    explanation: 'Arrow functions use the => syntax. The parameter should be wrapped in parentheses.',
    createdBy: 'user-3',
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2025-12-20T10:00:00Z',
  },
  {
    id: 'q6',
    departmentId: 'dept-1',
    questionBankId: 'qb-1',
    questionText: 'Which HTTP method is used to update a resource?',
    questionTypes: ['multiple_choice'],
    options: [
      { text: 'GET', isCorrect: false },
      { text: 'POST', isCorrect: false },
      { text: 'PUT', isCorrect: true },
      { text: 'DELETE', isCorrect: false },
    ],
    correctAnswer: 'PUT',
    points: 2,
    difficulty: 'easy',
    tags: ['http', 'api', 'rest'],
    explanation: 'PUT is used for updating existing resources, while POST creates new ones.',
    createdBy: 'user-1',
    createdAt: '2025-12-25T10:00:00Z',
    updatedAt: '2025-12-25T10:00:00Z',
  },
];

/**
 * Mock question details with usage statistics
 */
export const mockQuestionDetails: QuestionDetails[] = mockQuestions.map((q, index) => ({
  ...q,
  usageCount: (index + 1) * 5,
  lastUsed: index % 2 === 0 ? '2026-01-05T10:00:00Z' : null,
}));

/**
 * Mock question form data
 */
export const mockQuestionFormData: QuestionFormData = {
  questionText: 'What is a promise in JavaScript?',
  questionType: 'multiple_choice',
  options: [
    { text: 'A synchronous operation', isCorrect: false },
    { text: 'An object representing eventual completion of an async operation', isCorrect: true },
    { text: 'A function that returns undefined', isCorrect: false },
    { text: 'A type of array', isCorrect: false },
  ],
  correctAnswer: 'An object representing eventual completion of an async operation',
  points: 3,
  difficulty: 'medium',
  tags: ['javascript', 'async', 'promises'],
  explanation: 'Promises are used to handle asynchronous operations in JavaScript.',
  department: 'Computer Science',
};

/**
 * Mock create question payload
 */
export const mockCreateQuestionPayload: CreateQuestionPayload = {
  questionBankId: 'qb-1',
  questionText: 'What does CSS stand for?',
  questionTypes: ['multiple_choice'],
  options: [
    { text: 'Cascading Style Sheets', isCorrect: true },
    { text: 'Computer Style Sheets', isCorrect: false },
    { text: 'Creative Style Sheets', isCorrect: false },
    { text: 'Colorful Style Sheets', isCorrect: false },
  ],
  correctAnswer: 'Cascading Style Sheets',
  points: 1,
  difficulty: 'easy',
  tags: ['css', 'basics'],
  explanation: 'CSS stands for Cascading Style Sheets and is used for styling web pages.',
};

/**
 * Mock update question payload
 */
export const mockUpdateQuestionPayload: UpdateQuestionPayload = {
  questionText: 'What is JavaScript? (Updated)',
  points: 3,
  difficulty: 'medium',
  tags: ['javascript', 'basics', 'programming', 'web'],
  explanation: 'Updated explanation: JavaScript is a versatile interpreted language.',
};

/**
 * Mock bulk import questions
 */
export const mockBulkImportQuestions: BulkImportQuestionItem[] = [
  {
    questionText: 'What is HTML?',
    questionType: 'multiple_choice',
    options: [
      { text: 'HyperText Markup Language', isCorrect: true },
      { text: 'HighText Machine Language', isCorrect: false },
      { text: 'HyperText Modern Language', isCorrect: false },
    ],
    correctAnswer: 'HyperText Markup Language',
    points: 1,
    difficulty: 'easy',
    tags: ['html', 'basics'],
  },
  {
    questionText: 'Is Python a dynamically typed language?',
    questionType: 'true_false',
    options: [
      { text: 'True', isCorrect: true },
      { text: 'False', isCorrect: false },
    ],
    correctAnswer: 'True',
    points: 1,
    difficulty: 'easy',
    tags: ['python', 'programming'],
  },
  {
    questionText: 'What is the capital of France?',
    questionType: 'short_answer',
    correctAnswer: 'Paris',
    points: 1,
    difficulty: 'easy',
    tags: ['geography'],
    explanation: 'Paris is the capital and largest city of France.',
  },
];

/**
 * Mock bulk import response (success)
 */
export const mockBulkImportSuccessResponse: BulkImportResponse = {
  imported: 3,
  failed: 0,
  updated: 0,
  results: [
    {
      index: 0,
      status: 'success',
      questionId: 'q-bulk-1',
      error: null,
    },
    {
      index: 1,
      status: 'success',
      questionId: 'q-bulk-2',
      error: null,
    },
    {
      index: 2,
      status: 'success',
      questionId: 'q-bulk-3',
      error: null,
    },
  ],
};

/**
 * Mock bulk import response (partial failure)
 */
export const mockBulkImportPartialResponse: BulkImportResponse = {
  imported: 2,
  failed: 1,
  updated: 0,
  results: [
    {
      index: 0,
      status: 'success',
      questionId: 'q-bulk-1',
      error: null,
    },
    {
      index: 1,
      status: 'error',
      questionId: null,
      error: 'Duplicate question text found',
    },
    {
      index: 2,
      status: 'success',
      questionId: 'q-bulk-3',
      error: null,
    },
  ],
};

/**
 * Factory function to create a mock question
 */
export const createMockQuestion = (overrides?: Partial<Question>): Question => ({
  id: `q-${Math.random().toString(36).substr(2, 9)}`,
  departmentId: 'dept-1',
  questionBankId: 'qb-1',
  questionText: 'Sample question text',
  questionTypes: ['multiple_choice'],
  options: [
    { text: 'Option 1', isCorrect: false },
    { text: 'Option 2', isCorrect: true },
    { text: 'Option 3', isCorrect: false },
  ],
  correctAnswer: 'Option 2',
  points: 2,
  difficulty: 'medium',
  tags: ['test', 'sample'],
  explanation: 'Sample explanation',
  createdBy: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory function to create a mock question list item
 */
export const createMockQuestionListItem = (
  overrides?: Partial<QuestionListItem>
): QuestionListItem => createMockQuestion(overrides);

/**
 * Factory function to create a mock question details
 */
export const createMockQuestionDetails = (
  overrides?: Partial<QuestionDetails>
): QuestionDetails => ({
  ...createMockQuestion(),
  usageCount: 5,
  lastUsed: new Date().toISOString(),
  ...overrides,
});

/**
 * Factory function to create a multiple choice question
 */
export const createMultipleChoiceQuestion = (
  overrides?: Partial<Question>
): Question => {
  return createMockQuestion({
    questionType: 'multiple_choice',
    options: [
      { text: 'Option A', isCorrect: false },
      { text: 'Option B', isCorrect: true },
      { text: 'Option C', isCorrect: false },
      { text: 'Option D', isCorrect: false },
    ],
    correctAnswer: 'Option B',
    ...overrides,
  });
};

/**
 * Factory function to create a true/false question
 */
export const createTrueFalseQuestion = (overrides?: Partial<Question>): Question => {
  return createMockQuestion({
    questionType: 'true_false',
    options: [
      { text: 'True', isCorrect: true },
      { text: 'False', isCorrect: false },
    ],
    correctAnswer: 'True',
    ...overrides,
  });
};

/**
 * Factory function to create a short answer question
 */
export const createShortAnswerQuestion = (overrides?: Partial<Question>): Question => {
  return createMockQuestion({
    questionType: 'short_answer',
    options: [],
    correctAnswer: 'Sample short answer',
    ...overrides,
  });
};

/**
 * Factory function to create an essay question
 */
export const createEssayQuestion = (overrides?: Partial<Question>): Question => {
  return createMockQuestion({
    questionType: 'essay',
    options: [],
    correctAnswer: 'Sample essay answer with detailed explanation',
    points: 5,
    difficulty: 'hard',
    ...overrides,
  });
};

/**
 * Factory function to create a fill in the blank question
 */
export const createFillBlankQuestion = (overrides?: Partial<Question>): Question => {
  return createMockQuestion({
    questionType: 'fill_blank',
    options: [],
    correctAnswer: 'correct word',
    ...overrides,
  });
};
