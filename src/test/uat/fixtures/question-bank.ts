/**
 * UAT Test Fixtures - Question Bank Management
 *
 * Test data for question bank workflows including:
 * - Question bank CRUD operations
 * - Various question types
 * - Static and dynamic quiz creation
 * - Flashcard creation
 */

// ============================================
// QUESTION BANK FIXTURES
// ============================================

export interface UATQuestionBank {
  name: string;
  description: string;
  tags: string[];
}

export interface UATQuestionData {
  questionText: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'long_answer' | 'matching' | 'flashcard' | 'fill_in_blank';
  options?: string[];
  correctAnswer?: string | string[];
  acceptedAnswers?: string[];
  matchThreshold?: number;
  pairs?: { left: string; right: string }[];
  cards?: { front: string; back: string; hint?: string }[];
  blanks?: { position: number; acceptedAnswers: string[] }[];
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  explanation?: string;
}

export interface UATStaticQuiz {
  title: string;
  description: string;
  questionIds: string[]; // Specific questions selected
  timeLimit: number; // minutes, 0 = unlimited
  passingScore: number;
  shuffleQuestions: boolean;
  showFeedback: boolean;
  attemptsAllowed: number; // 0 = unlimited
}

export interface UATDynamicQuiz {
  title: string;
  description: string;
  questionBankId: string;
  questionCount: number; // Number of questions to randomly select
  selectionCriteria?: {
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    tags?: string[];
  };
  timeLimit: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showFeedback: boolean;
  attemptsAllowed: number;
}

export interface UATStaticFlashcardSet {
  title: string;
  description: string;
  cards: { front: string; back: string; hint?: string }[];
  shuffleCards: boolean;
  masteryThreshold: number; // Number of correct answers to mark as mastered
}

export interface UATDynamicFlashcardSet {
  title: string;
  description: string;
  questionBankId: string;
  cardCount: number; // Number of cards to randomly select
  selectionCriteria?: {
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    tags?: string[];
  };
  shuffleCards: boolean;
  masteryThreshold: number;
}

// ============================================
// TEST DATA
// ============================================

/**
 * Question banks for testing
 */
export const testQuestionBanks: UATQuestionBank[] = [
  {
    name: 'UAT Fundamentals Bank',
    description: 'Questions about user acceptance testing fundamentals and best practices',
    tags: ['uat', 'testing', 'fundamentals'],
  },
  {
    name: 'Software Engineering Concepts',
    description: 'General software engineering concepts and terminology',
    tags: ['software', 'engineering', 'concepts'],
  },
  {
    name: 'Flashcard Study Bank',
    description: 'Flashcard-style questions for memorization practice',
    tags: ['flashcards', 'study', 'memorization'],
  },
];

/**
 * Questions for populating question banks
 */
export const testQuestions: UATQuestionData[] = [
  // Multiple Choice Questions
  {
    questionText: 'What is the primary goal of User Acceptance Testing (UAT)?',
    type: 'multiple_choice',
    options: [
      'To find bugs in the code',
      'To validate the system meets business requirements',
      'To test system performance',
      'To verify database integrity',
    ],
    correctAnswer: 'To validate the system meets business requirements',
    points: 10,
    difficulty: 'easy',
    tags: ['uat', 'fundamentals'],
    explanation: 'UAT focuses on validating that the system meets business requirements and is ready for deployment.',
  },
  {
    questionText: 'Which testing phase typically follows UAT?',
    type: 'multiple_choice',
    options: [
      'Unit testing',
      'Integration testing',
      'Production deployment',
      'System testing',
    ],
    correctAnswer: 'Production deployment',
    points: 10,
    difficulty: 'medium',
    tags: ['uat', 'testing-phases'],
  },
  {
    questionText: 'Who should perform User Acceptance Testing?',
    type: 'multiple_choice',
    options: [
      'Developers only',
      'QA engineers only',
      'End users or their representatives',
      'Project managers only',
    ],
    correctAnswer: 'End users or their representatives',
    points: 10,
    difficulty: 'easy',
    tags: ['uat', 'roles'],
  },

  // Multiple Select Questions
  {
    questionText: 'Select all valid types of acceptance testing:',
    type: 'multiple_select',
    options: [
      'Alpha testing',
      'Beta testing',
      'Contract acceptance testing',
      'Compilation testing',
      'Regulation acceptance testing',
    ],
    correctAnswer: ['Alpha testing', 'Beta testing', 'Contract acceptance testing', 'Regulation acceptance testing'],
    points: 15,
    difficulty: 'medium',
    tags: ['uat', 'testing-types'],
  },
  {
    questionText: 'Which artifacts are typically produced during UAT? Select all that apply.',
    type: 'multiple_select',
    options: [
      'Test cases',
      'Source code',
      'Defect reports',
      'Sign-off documents',
      'Database schemas',
    ],
    correctAnswer: ['Test cases', 'Defect reports', 'Sign-off documents'],
    points: 15,
    difficulty: 'medium',
    tags: ['uat', 'artifacts'],
  },

  // True/False Questions
  {
    questionText: 'UAT should be performed in the production environment.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'False',
    points: 5,
    difficulty: 'easy',
    tags: ['uat', 'environments'],
    explanation: 'UAT is typically performed in a staging environment that mirrors production, not in production itself.',
  },
  {
    questionText: 'Business stakeholders should be involved in defining UAT test cases.',
    type: 'true_false',
    options: ['True', 'False'],
    correctAnswer: 'True',
    points: 5,
    difficulty: 'easy',
    tags: ['uat', 'stakeholders'],
  },

  // Short Answer Questions
  {
    questionText: 'What does the acronym UAT stand for?',
    type: 'short_answer',
    acceptedAnswers: ['User Acceptance Testing', 'user acceptance testing', 'User acceptance testing'],
    matchThreshold: 90,
    points: 5,
    difficulty: 'easy',
    tags: ['uat', 'terminology'],
  },
  {
    questionText: 'Name the testing phase that comes immediately before UAT.',
    type: 'short_answer',
    acceptedAnswers: ['System Testing', 'system testing', 'System testing', 'Integration Testing', 'integration testing'],
    matchThreshold: 80,
    points: 10,
    difficulty: 'medium',
    tags: ['uat', 'testing-phases'],
  },

  // Matching Questions
  {
    questionText: 'Match each testing type with its primary focus:',
    type: 'matching',
    pairs: [
      { left: 'Unit Testing', right: 'Individual components' },
      { left: 'Integration Testing', right: 'Component interactions' },
      { left: 'System Testing', right: 'Complete system behavior' },
      { left: 'UAT', right: 'Business requirements validation' },
    ],
    points: 20,
    difficulty: 'medium',
    tags: ['testing', 'comparison'],
  },

  // Flashcard Questions
  {
    questionText: 'What is regression testing?',
    type: 'flashcard',
    cards: [
      {
        front: 'Regression Testing',
        back: 'Testing to verify that previously working functionality still works after code changes.',
        hint: 'Think about what happens after making changes to code...',
      },
    ],
    points: 5,
    difficulty: 'easy',
    tags: ['testing', 'flashcard'],
  },
  {
    questionText: 'Define smoke testing',
    type: 'flashcard',
    cards: [
      {
        front: 'Smoke Testing',
        back: 'A quick, preliminary test to check if the basic functionality works before deeper testing.',
        hint: 'Also called "build verification testing"...',
      },
    ],
    points: 5,
    difficulty: 'easy',
    tags: ['testing', 'flashcard'],
  },

  // Fill in the Blank Questions
  {
    questionText: 'UAT is performed to ensure the system meets _____ requirements.',
    type: 'fill_in_blank',
    blanks: [
      { position: 0, acceptedAnswers: ['business', 'Business', 'user', 'User'] },
    ],
    points: 5,
    difficulty: 'easy',
    tags: ['uat', 'fill-blank'],
  },
];

/**
 * Flashcard sets for study mode
 */
export const testFlashcards = [
  { front: 'UAT', back: 'User Acceptance Testing - validates business requirements', hint: 'Final testing phase before deployment' },
  { front: 'Alpha Testing', back: 'Internal acceptance testing by the development team', hint: 'Done before Beta testing' },
  { front: 'Beta Testing', back: 'External acceptance testing by real users', hint: 'Done after Alpha testing' },
  { front: 'Regression Testing', back: 'Testing to ensure new changes do not break existing functionality' },
  { front: 'Smoke Testing', back: 'Quick tests to verify basic functionality works' },
  { front: 'Sanity Testing', back: 'Focused testing on specific functionality after changes' },
  { front: 'Test Case', back: 'A set of conditions under which a tester determines if a feature works correctly' },
  { front: 'Test Scenario', back: 'A high-level description of what to test' },
  { front: 'Defect', back: 'A flaw in the software that causes incorrect or unexpected behavior' },
  { front: 'Sign-off', back: 'Formal approval that testing is complete and requirements are met' },
];

/**
 * Static quiz configuration
 */
export const staticQuizConfig: Omit<UATStaticQuiz, 'questionIds'> = {
  title: 'UAT Fundamentals Quiz (Static)',
  description: 'Test your knowledge of UAT fundamentals with this fixed-question quiz.',
  timeLimit: 15,
  passingScore: 70,
  shuffleQuestions: true,
  showFeedback: true,
  attemptsAllowed: 3,
};

/**
 * Dynamic quiz configuration
 */
export const dynamicQuizConfig: Omit<UATDynamicQuiz, 'questionBankId'> = {
  title: 'UAT Random Assessment (Dynamic)',
  description: 'A quiz that randomly selects questions from the question bank.',
  questionCount: 5,
  selectionCriteria: {
    difficulty: 'mixed',
    tags: ['uat'],
  },
  timeLimit: 20,
  passingScore: 75,
  shuffleQuestions: true,
  showFeedback: true,
  attemptsAllowed: 0, // unlimited
};

/**
 * Static flashcard set configuration
 */
export const staticFlashcardConfig: Omit<UATStaticFlashcardSet, 'cards'> = {
  title: 'Testing Terminology Flashcards (Static)',
  description: 'Study these fixed flashcards to learn testing terminology.',
  shuffleCards: true,
  masteryThreshold: 3,
};

/**
 * Dynamic flashcard set configuration
 */
export const dynamicFlashcardConfig: Omit<UATDynamicFlashcardSet, 'questionBankId'> = {
  title: 'Random Study Session (Dynamic)',
  description: 'Practice with randomly selected flashcards from the bank.',
  cardCount: 5,
  selectionCriteria: {
    tags: ['flashcard'],
  },
  shuffleCards: true,
  masteryThreshold: 2,
};

/**
 * Module configuration for assembling content
 */
export const testModuleConfig = {
  title: 'UAT Learning Module',
  description: 'Complete module with quizzes and flashcards for learning UAT concepts.',
  learningActivities: [
    { type: 'lesson', title: 'Introduction to UAT', order: 1 },
    { type: 'flashcard', title: 'Testing Terminology Flashcards (Static)', order: 2 },
    { type: 'quiz', title: 'UAT Fundamentals Quiz (Static)', order: 3 },
    { type: 'lesson', title: 'Advanced UAT Concepts', order: 4 },
    { type: 'flashcard', title: 'Random Study Session (Dynamic)', order: 5 },
    { type: 'quiz', title: 'UAT Random Assessment (Dynamic)', order: 6 },
  ],
};

/**
 * Course configuration for final assembly
 */
export const testCourseConfig = {
  title: 'Complete UAT Training Course',
  code: 'UATCOMPLETE',
  description: 'A comprehensive course covering all aspects of User Acceptance Testing with quizzes and flashcards.',
  passingScore: 70,
};
