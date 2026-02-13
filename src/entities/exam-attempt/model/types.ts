/**
 * Exam Attempt Entity Types
 * Represents exam/quiz/assessment attempts built with Exercise Builder
 */

/**
 * Status of exam attempt
 */
export type AttemptStatus = 'started' | 'in_progress' | 'submitted' | 'grading' | 'graded';

/**
 * Type of exam/assessment
 */
export type ExamType = 'quiz' | 'exam' | 'practice' | 'assessment';

/**
 * Question type
 */
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';

/**
 * Answer for a single question
 */
export interface Answer {
  questionId: string;
  answer: string | string[];
  savedAt?: string;
}

/**
 * Question in an exam attempt
 */
export interface ExamQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  order: number;
  points: number;
  options?: string[];
  userAnswer?: string | string[] | null;
  correctAnswer?: string | string[] | null;
  isCorrect?: boolean | null;
  scoreEarned?: number;
  feedback?: string | null;
  explanation?: string;
  hasAnswer?: boolean;
  projectedScore?: number;
  projectedCorrect?: boolean;
  projectedConfidence?: number;
  projectedMethod?: string;
  projectedReason?: string;
  requiresInstructorReview?: boolean;
  projectedAt?: string;
  reviewedAt?: string;
}

/**
 * Grading information
 */
export interface GradingInfo {
  gradedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  gradedAt?: string | null;
  overallFeedback?: string | null;
}

/**
 * Summary statistics for exam attempt
 */
export interface ExamAttemptSummary {
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  correctCount: number;
  incorrectCount: number;
  partialCreditCount?: number;
}

/**
 * Main exam attempt interface
 */
export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  courseVersionId?: string;
  courseContexts?: Array<{
    courseId: string;
    courseCode?: string;
    courseName?: string;
    courseVersionId?: string;
  }>;
  examType?: ExamType;
  learnerId: string;
  learnerName?: string;
  attemptNumber: number;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  gradeLetter?: string | null;
  timeLimit: number;
  remainingTime: number | null;
  timeSpent: number;
  questions: ExamQuestion[];
  instructions?: string;
  allowReview: boolean;
  showFeedback?: boolean;
  startedAt: string;
  submittedAt?: string | null;
  gradedAt?: string | null;
  gradedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  feedback?: string | null;
  projectedPendingReviewCount?: number;
  hasProjectedPendingReview?: boolean;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    proctoring?: {
      sessionId: string;
      violations: unknown[];
    };
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Exam attempt list item (for listing view)
 */
export interface ExamAttemptListItem {
  id: string;
  examId: string;
  examTitle: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  courseVersionId?: string;
  courseContexts?: Array<{
    courseId: string;
    courseCode?: string;
    courseName?: string;
    courseVersionId?: string;
  }>;
  learnerId: string;
  learnerName: string;
  attemptNumber: number;
  status: AttemptStatus;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  gradeLetter?: string;
  startedAt: string;
  submittedAt: string | null;
  gradedAt: string | null;
  timeSpent: number;
  remainingTime: number | null;
  projectedPendingReviewCount?: number;
  hasProjectedPendingReview?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Exam result with detailed feedback
 */
export interface ExamResult {
  attemptId: string;
  examTitle: string;
  learnerName: string;
  attemptNumber: number;
  status: 'submitted' | 'graded';
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  gradeLetter: string;
  passingScore: number;
  submittedAt: string;
  gradedAt: string;
  timeSpent: number;
  timeLimit: number;
  maxAttempts: number | null;
  attemptsUsed: number;
  summary: ExamAttemptSummary;
  questionResults: ExamQuestion[];
  overallFeedback: string | null;
  gradedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  gradingComplete: boolean;
  feedbackReleased: boolean;
  pendingInstructorReviewCount?: number;
  allowReview: boolean;
  showCorrectAnswers: boolean;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * List exam attempts response
 */
export interface ExamAttemptsListResponse {
  attempts: ExamAttemptListItem[];
  pagination: Pagination;
}

/**
 * Start exam attempt request
 */
export interface StartExamAttemptRequest {
  examId: string;
}

/**
 * Start exam attempt response
 */
export interface StartExamAttemptResponse {
  id: string;
  examId: string;
  examTitle: string;
  learnerId: string;
  attemptNumber: number;
  status: 'started';
  score: number;
  maxScore: number;
  maxAttempts: number | null;
  timeLimit: number;
  remainingTime: number;
  shuffleQuestions: boolean;
  questions: ExamQuestion[];
  instructions: string;
  allowReview: boolean;
  startedAt: string;
  createdAt: string;
}

/**
 * Submit answers request
 */
export interface SubmitAnswersRequest {
  answers: Answer[];
}

/**
 * Submit answers response
 */
export interface SubmitAnswersResponse {
  attemptId: string;
  status: 'in_progress';
  answeredCount: number;
  totalQuestions: number;
  remainingTime: number | null;
  updatedAnswers: Array<{
    questionId: string;
    answer: string | string[];
    savedAt: string;
  }>;
}

/**
 * Submit exam for grading request
 */
export interface SubmitExamRequest {
  confirmSubmit?: boolean;
}

/**
 * Submit exam response
 */
export interface SubmitExamResponse {
  attemptId: string;
  status: 'submitted' | 'graded';
  score: number;
  maxScore: number;
  maxAttempts: number | null;
  percentage: number;
  passed: boolean;
  gradeLetter: string | null;
  autoGraded: boolean;
  requiresManualGrading: boolean;
  submittedAt: string;
  gradedAt: string | null;
  timeSpent: number;
  answeredCount: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

/**
 * Manual grading request (instructor)
 */
export interface GradeExamRequest {
  questionGrades: Array<{
    questionIndex: number;
    questionId?: string;
    scoreEarned: number;
    feedback?: string;
  }>;
  overallFeedback?: string;
  notifyLearner?: boolean;
}

/**
 * Manual grading response
 */
export interface GradeExamResponse {
  attemptId: string;
  status: 'submitted' | 'graded';
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  gradeLetter: string;
  gradedAt: string;
  gradedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  questionGrades: Array<{
    questionId?: string;
    questionIndex: number;
    learningUnitQuestionId?: string;
    scoreEarned: number;
    pointsPossible: number;
    maxPoints?: number;
    feedback: string | null;
    gradedAt?: string;
    gradedBy?: string;
  }>;
  notification?: {
    requested: boolean;
    deferred: boolean;
    notifiedAt?: string;
  };
}

/**
 * Exam attempts statistics
 */
export interface ExamAttemptsStatistics {
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  averageTimeSpent: number;
}

/**
 * List attempts by exam response
 */
export interface ExamAttemptsByExamResponse {
  examId: string;
  examTitle: string;
  statistics: ExamAttemptsStatistics;
  attempts: Array<ExamAttemptListItem & {
    learnerEmail: string;
    requiresGrading: boolean;
  }>;
  pagination: Pagination;
}

/**
 * Query parameters for listing exam attempts
 */
export interface ListExamAttemptsParams {
  page?: number;
  limit?: number;
  learnerId?: string;
  examId?: string;
  assessmentId?: string;
  enrollmentId?: string;
  courseId?: string;
  search?: string;
  status?: AttemptStatus;
  sort?: string;
}

/**
 * Query parameters for listing attempts by exam
 */
export interface ListAttemptsByExamParams {
  page?: number;
  limit?: number;
  status?: AttemptStatus;
  passed?: boolean;
  sort?: string;
}
