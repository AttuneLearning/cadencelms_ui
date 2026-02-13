/**
 * Assessment Attempt API Client
 * Canonical assessment-attempt lifecycle keyed by assessmentId.
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse } from '@/shared/api/types';
import type {
  Answer,
  ExamAttempt,
  ExamAttemptListItem,
  ExamAttemptsListResponse,
  ExamQuestion,
  ExamResult,
  GradeExamRequest,
  GradeExamResponse,
  ListExamAttemptsParams,
  StartExamAttemptResponse,
  SubmitExamRequest,
  SubmitExamResponse,
  SubmitAnswersResponse,
} from '@/entities/exam-attempt/model/types';

export interface StartAssessmentAttemptRequest {
  enrollmentId: string;
  learningUnitId?: string;
}

export interface SaveAssessmentResponsesRequest {
  responses: Array<{
    questionId: string;
    response: Answer['answer'];
  }>;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function readId(value: unknown): string | null {
  const direct = asString(value);
  if (direct) return direct;
  const record = asRecord(value);
  if (!record) return null;
  return asString(record.id) ?? asString(record._id);
}

function mapRendererQuestionType(value: unknown): string {
  const raw = (asString(value) || '').toLowerCase();
  switch (raw) {
    case 'multiple-choice':
      return 'multiple_choice';
    case 'true-false':
      return 'true_false';
    case 'short-answer':
      return 'short_answer';
    case 'long_answer':
    case 'long-answer':
      return 'essay';
    case 'fill-blank':
      return 'fill_in_blank';
    default:
      return raw || 'multiple_choice';
  }
}

function mapQuestionType(value: unknown): ExamQuestion['questionType'] {
  const normalized = mapRendererQuestionType(value);
  switch (normalized) {
    case 'multiple_choice':
    case 'true_false':
    case 'short_answer':
    case 'essay':
    case 'matching':
      return normalized;
    default:
      return 'multiple_choice';
  }
}

function normalizeAnswerValue(
  value: unknown,
  questionType: string
): string | string[] | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === 'boolean') {
    if (questionType === 'true_false') {
      return value ? 'True' : 'False';
    }
    return String(value);
  }

  if (typeof value === 'object') {
    if (questionType === 'matching') {
      const entries = Object.values(value as Record<string, unknown>).map((item) => String(item));
      return entries.length > 0 ? entries : undefined;
    }
    return String(value);
  }

  const normalized = String(value);
  if (questionType === 'true_false') {
    if (normalized.toLowerCase() === 'true') return 'True';
    if (normalized.toLowerCase() === 'false') return 'False';
  }
  return normalized;
}

function normalizeOptions(optionsValue: unknown, matchingPairsValue: unknown): string[] | undefined {
  const options = asArray(optionsValue)
    .map((option) => {
      if (typeof option === 'string') return option;
      const record = asRecord(option);
      return (
        asString(record?.text) ??
        asString(record?.label) ??
        asString(record?.value) ??
        null
      );
    })
    .filter((option): option is string => !!option);

  if (options.length > 0) return options;

  const matchingPairs = asRecord(matchingPairsValue);
  if (!matchingPairs) return undefined;

  const generated = Object.entries(matchingPairs).map(
    ([prompt, match]) => `${prompt}::${String(match)}`
  );
  return generated.length > 0 ? generated : undefined;
}

function normalizeStatus(value: unknown): ExamAttempt['status'] {
  const raw = (asString(value) || '').toLowerCase();
  if (raw === 'started') return 'started';
  if (raw === 'in_progress') return 'in_progress';
  if (raw === 'submitted') return 'submitted';
  if (raw === 'grading') return 'grading';
  if (raw === 'graded') return 'graded';
  // UI does not support "abandoned" directly in type model.
  return raw === 'abandoned' ? 'submitted' : 'in_progress';
}

function deriveGradeLetter(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

function normalizeCourseContext(raw: unknown):
  | {
      courseId: string;
      courseCode?: string;
      courseName?: string;
      courseVersionId?: string;
    }
  | null {
  const record = asRecord(raw);
  if (!record) return null;

  const courseId =
    readId(record.courseId) ??
    readId(record.id) ??
    readId(record._id);
  if (!courseId) return null;

  return {
    courseId,
    courseCode: asString(record.courseCode) ?? asString(record.code) ?? undefined,
    courseName:
      asString(record.courseName) ??
      asString(record.courseTitle) ??
      asString(record.title) ??
      asString(record.name) ??
      undefined,
    courseVersionId:
      readId(record.courseVersionId) ??
      readId(record.versionId) ??
      undefined,
  };
}

function normalizeCourseContexts(value: unknown) {
  return asArray(value)
    .map((context) => normalizeCourseContext(context))
    .filter(
      (
        context
      ): context is {
        courseId: string;
        courseCode?: string;
        courseName?: string;
        courseVersionId?: string;
      } => !!context
    );
}

function normalizeQuestion(rawQuestion: unknown, index: number): ExamQuestion {
  const question = asRecord(rawQuestion) || {};
  const snapshot = asRecord(question.questionSnapshot) || {};
  const rendererType = mapRendererQuestionType(
    asString(question.questionType) ??
      asString(snapshot.questionType) ??
      asArray(question.questionTypes)[0]
  );
  const mappedType = mapQuestionType(rendererType);

  const userAnswer = normalizeAnswerValue(question.userAnswer ?? question.response, rendererType);
  const normalizedCorrectAnswer = normalizeAnswerValue(
    question.correctAnswer ?? snapshot.correctAnswer ?? snapshot.correctAnswers,
    rendererType
  );

  const points =
    asNumber(question.points) ??
    asNumber(question.pointsPossible) ??
    0;

  const normalizedQuestion: ExamQuestion & { questionTypes?: string[] } = {
    id: readId(question.id) ?? readId(question.questionId) ?? `q-${index + 1}`,
    questionText: asString(question.questionText) ?? asString(snapshot.questionText) ?? `Question ${index + 1}`,
    questionType: mappedType,
    order: asNumber(question.order) ?? index + 1,
    points,
    options: normalizeOptions(question.options ?? snapshot.options, snapshot.matchingPairs),
    userAnswer,
    correctAnswer: normalizedCorrectAnswer,
    isCorrect: asBoolean(question.isCorrect),
    scoreEarned: asNumber(question.scoreEarned) ?? asNumber(question.pointsEarned) ?? undefined,
    feedback: asString(question.feedback),
    explanation: asString(question.explanation) ?? asString(snapshot.explanation) ?? undefined,
    hasAnswer:
      asBoolean(question.hasAnswer) ??
      (userAnswer !== undefined && userAnswer !== null && userAnswer !== ''),
  };
  normalizedQuestion.questionTypes = [rendererType];
  return normalizedQuestion;
}

function normalizeAttempt(rawAttempt: unknown, assessmentIdHint?: string): ExamAttempt {
  const attempt = asRecord(rawAttempt) || {};
  const scoring = asRecord(attempt.scoring) || {};
  const timing = asRecord(attempt.timing) || {};

  const questions = asArray(attempt.questions).map((question, index) =>
    normalizeQuestion(question, index)
  );

  const maxScore =
    asNumber(attempt.maxScore) ??
    questions.reduce((sum, question) => sum + question.points, 0);

  const score =
    asNumber(attempt.score) ??
    asNumber(scoring.rawScore) ??
    questions.reduce((sum, question) => sum + (question.scoreEarned ?? 0), 0);

  const percentage =
    asNumber(attempt.percentage) ??
    asNumber(scoring.percentageScore) ??
    (maxScore > 0 ? (score / maxScore) * 100 : 0);

  const timeSpent =
    asNumber(attempt.timeSpent) ??
    asNumber(timing.timeSpentSeconds) ??
    0;

  const timeLimit =
    asNumber(attempt.timeLimit) ??
    asNumber(timing.timeLimitSeconds) ??
    0;

  const remainingTime = (() => {
    const explicit = asNumber(attempt.remainingTime);
    if (explicit !== null) return explicit;
    if (timeLimit <= 0) return null;
    return Math.max(0, timeLimit - timeSpent);
  })();

  const feedbackSettings = asRecord(attempt.feedbackSettings) || {};
  const passed = asBoolean(attempt.passed) ?? asBoolean(scoring.passed) ?? false;
  const primaryCourse =
    normalizeCourseContext({
      courseId: attempt.courseId,
      courseCode: attempt.courseCode,
      courseName: attempt.courseName ?? attempt.courseTitle,
      courseVersionId: attempt.courseVersionId,
    }) ??
    normalizeCourseContext(attempt.course) ??
    null;
  const courseContexts = normalizeCourseContexts(attempt.courseContexts);

  return {
    id: readId(attempt.id) ?? readId(attempt._id) ?? '',
    examId:
      readId(attempt.examId) ??
      readId(attempt.assessmentId) ??
      assessmentIdHint ??
      '',
    examTitle:
      asString(attempt.examTitle) ??
      asString(attempt.assessmentTitle) ??
      'Assessment',
    ...(primaryCourse
      ? {
          courseId: primaryCourse.courseId,
          courseCode: primaryCourse.courseCode,
          courseName: primaryCourse.courseName,
          courseVersionId: primaryCourse.courseVersionId,
        }
      : {}),
    ...(courseContexts.length > 0 ? { courseContexts } : {}),
    examType: 'assessment',
    learnerId: readId(attempt.learnerId) ?? '',
    learnerName:
      asString(attempt.learnerName) ??
      asString(asRecord(attempt.learner)?.name) ??
      undefined,
    attemptNumber: asNumber(attempt.attemptNumber) ?? 1,
    status: normalizeStatus(attempt.status),
    score,
    maxScore,
    percentage,
    passed,
    gradeLetter: asString(attempt.gradeLetter) ?? deriveGradeLetter(percentage),
    timeLimit,
    remainingTime,
    timeSpent,
    questions,
    instructions: asString(attempt.instructions) ?? '',
    allowReview:
      asBoolean(attempt.allowReview) ??
      asBoolean(feedbackSettings.allowReview) ??
      true,
    showFeedback:
      asBoolean(attempt.showFeedback) ??
      asBoolean(feedbackSettings.showFeedback) ??
      false,
    startedAt:
      asString(attempt.startedAt) ??
      asString(timing.startedAt) ??
      asString(attempt.createdAt) ??
      '',
    submittedAt:
      asString(attempt.submittedAt) ??
      asString(timing.submittedAt) ??
      null,
    gradedAt: asString(attempt.gradedAt) ?? null,
    gradedBy: asRecord(attempt.gradedBy) as ExamAttempt['gradedBy'],
    feedback:
      asString(attempt.feedback) ??
      asString(asRecord(attempt.feedback)?.overallFeedback) ??
      null,
    createdAt: asString(attempt.createdAt) ?? '',
    updatedAt: asString(attempt.updatedAt) ?? '',
  };
}

function normalizeStartResponse(rawAttempt: unknown, assessmentIdHint: string): StartExamAttemptResponse {
  const attempt = normalizeAttempt(rawAttempt, assessmentIdHint);
  const raw = asRecord(rawAttempt) || {};

  return {
    id: attempt.id,
    examId: attempt.examId,
    examTitle: attempt.examTitle,
    learnerId: attempt.learnerId,
    attemptNumber: attempt.attemptNumber,
    status: 'started',
    score: attempt.score,
    maxScore: attempt.maxScore,
    maxAttempts: asNumber(raw.maxAttempts),
    timeLimit: attempt.timeLimit,
    remainingTime: attempt.remainingTime ?? attempt.timeLimit,
    shuffleQuestions: asBoolean(raw.shuffleQuestions) ?? false,
    questions: attempt.questions,
    instructions: attempt.instructions || '',
    allowReview: attempt.allowReview,
    startedAt: attempt.startedAt,
    createdAt: attempt.createdAt,
  };
}

function normalizeSaveResponse(rawResponse: unknown): SubmitAnswersResponse {
  const response = asRecord(rawResponse) || {};
  return {
    attemptId: readId(response.attemptId) ?? readId(response._id) ?? '',
    status: 'in_progress',
    answeredCount:
      asNumber(response.answeredCount) ??
      asNumber(response.savedResponses) ??
      0,
    totalQuestions: asNumber(response.totalQuestions) ?? 0,
    remainingTime:
      asNumber(response.remainingTime) ??
      asNumber(response.timeRemainingSeconds) ??
      null,
    updatedAnswers: asArray(response.updatedAnswers).map((answer) => {
      const item = asRecord(answer) || {};
      return {
        questionId: readId(item.questionId) ?? '',
        answer: (item.answer as string | string[]) ?? '',
        savedAt: asString(item.savedAt) ?? new Date().toISOString(),
      };
    }),
  };
}

function normalizeSubmitResponse(rawResponse: unknown): SubmitExamResponse {
  const response = asRecord(rawResponse) || {};
  const scoring = asRecord(response.scoring) || {};
  const timing = asRecord(response.timing) || {};

  const status = normalizeStatus(response.status);
  const normalizedStatus: SubmitExamResponse['status'] =
    status === 'graded' ? 'graded' : 'submitted';

  const score = asNumber(response.score) ?? asNumber(scoring.rawScore) ?? 0;
  const maxScore = asNumber(response.maxScore) ?? 0;
  const percentage =
    asNumber(response.percentage) ??
    asNumber(scoring.percentageScore) ??
    (maxScore > 0 ? (score / maxScore) * 100 : 0);
  const passed = asBoolean(response.passed) ?? asBoolean(scoring.passed) ?? false;
  const requiresManualGrading =
    asBoolean(response.requiresManualGrading) ??
    asBoolean(scoring.requiresManualGrading) ??
    false;

  const answeredCount = asNumber(response.answeredCount) ?? 0;
  const totalQuestions = asNumber(response.totalQuestions) ?? 0;
  const correctCount = asNumber(response.correctCount) ?? 0;
  const incorrectCount = asNumber(response.incorrectCount) ?? 0;
  const unansweredCount =
    asNumber(response.unansweredCount) ??
    Math.max(0, totalQuestions - answeredCount);

  return {
    attemptId: readId(response.attemptId) ?? readId(response._id) ?? '',
    status: normalizedStatus,
    score,
    maxScore,
    maxAttempts: asNumber(response.maxAttempts),
    percentage,
    passed,
    gradeLetter: asString(response.gradeLetter) ?? deriveGradeLetter(percentage),
    autoGraded:
      asBoolean(response.autoGraded) ??
      !requiresManualGrading,
    requiresManualGrading,
    submittedAt:
      asString(response.submittedAt) ??
      asString(timing.submittedAt) ??
      '',
    gradedAt: asString(response.gradedAt),
    timeSpent:
      asNumber(response.timeSpent) ??
      asNumber(timing.timeSpentSeconds) ??
      0,
    answeredCount,
    totalQuestions,
    correctCount,
    incorrectCount,
    unansweredCount,
  };
}

function normalizeResult(rawResult: unknown, assessmentIdHint: string): ExamResult {
  const result = asRecord(rawResult) || {};

  // If already legacy exam-result shape, preserve it.
  if (asString(result.attemptId) && Array.isArray(result.questionResults)) {
    return rawResult as ExamResult;
  }

  const attempt = normalizeAttempt(rawResult, assessmentIdHint);
  const feedbackSettings = asRecord(result.feedbackSettings) || {};

  const totalQuestions = attempt.questions.length;
  const answeredCount = attempt.questions.filter((question) => question.hasAnswer).length;
  const correctCount = attempt.questions.filter((question) => question.isCorrect === true).length;
  const incorrectCount = attempt.questions.filter((question) => question.isCorrect === false).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  const gradeLetter = attempt.gradeLetter ?? deriveGradeLetter(attempt.percentage);
  const showCorrectAnswers =
    asBoolean(result.showCorrectAnswers) ??
    asBoolean(feedbackSettings.showCorrectAnswers) ??
    true;
  const allowReview =
    asBoolean(result.allowReview) ??
    asBoolean(feedbackSettings.allowReview) ??
    true;

  return {
    attemptId: attempt.id,
    examTitle: attempt.examTitle,
    learnerName: attempt.learnerName || 'Learner',
    attemptNumber: attempt.attemptNumber,
    status: 'graded',
    score: attempt.score,
    maxScore: attempt.maxScore,
    percentage: attempt.percentage,
    passed: attempt.passed,
    gradeLetter,
    passingScore: asNumber(result.passingScore) ?? 70,
    submittedAt: attempt.submittedAt || '',
    gradedAt: attempt.gradedAt || '',
    timeSpent: attempt.timeSpent,
    timeLimit: attempt.timeLimit,
    maxAttempts: asNumber(result.maxAttempts),
    attemptsUsed: asNumber(result.attemptsUsed) ?? attempt.attemptNumber,
    summary: {
      totalQuestions,
      answeredCount,
      unansweredCount,
      correctCount,
      incorrectCount,
      partialCreditCount: 0,
    },
    questionResults: attempt.questions,
    overallFeedback:
      asString(result.overallFeedback) ??
      asString(attempt.feedback) ??
      null,
    gradedBy: attempt.gradedBy ?? null,
    allowReview,
    showCorrectAnswers,
  };
}

function normalizeAttemptListItem(rawAttempt: unknown, assessmentIdHint: string): ExamAttemptListItem {
  const attempt = normalizeAttempt(rawAttempt, assessmentIdHint);
  return {
    id: attempt.id,
    examId: attempt.examId,
    examTitle: attempt.examTitle,
    learnerId: attempt.learnerId,
    learnerName: attempt.learnerName || 'Learner',
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    score: attempt.score,
    maxScore: attempt.maxScore,
    percentage: attempt.percentage,
    passed: attempt.passed,
    gradeLetter: attempt.gradeLetter ?? undefined,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt ?? null,
    gradedAt: attempt.gradedAt ?? null,
    timeSpent: attempt.timeSpent,
    remainingTime: attempt.remainingTime,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  };
}

function normalizeGradedBy(value: unknown): GradeExamResponse['gradedBy'] {
  const record = asRecord(value);
  if (!record) return null;

  const id = readId(record.id) ?? readId(record._id) ?? readId(value);
  if (!id) return null;

  const firstName =
    asString(record.firstName) ??
    asString(record.givenName) ??
    asString(record.name)?.split(' ')[0] ??
    'Staff';
  const lastName =
    asString(record.lastName) ??
    asString(record.familyName) ??
    asString(record.name)?.split(' ').slice(1).join(' ') ??
    '';

  return {
    id,
    firstName,
    lastName,
  };
}

function normalizeAggregateGradeResponse(rawResponse: unknown): GradeExamResponse {
  const response = asRecord(rawResponse) || {};
  const scoring = asRecord(response.scoring) || {};
  const questionGradesRaw = asArray(response.questionGrades);
  const firstQuestionGrade = asRecord(questionGradesRaw[0]) || {};
  const score = asNumber(response.score) ?? asNumber(scoring.rawScore) ?? 0;
  const maxScore = asNumber(response.maxScore) ?? asNumber(scoring.maxScore) ?? 0;
  const percentage =
    asNumber(response.percentage) ??
    asNumber(scoring.percentageScore) ??
    (maxScore > 0 ? (score / maxScore) * 100 : 0);
  const passed = asBoolean(response.passed) ?? asBoolean(scoring.passed) ?? false;

  const status = normalizeStatus(response.status) === 'graded' ? 'graded' : 'submitted';

  return {
    attemptId: readId(response.attemptId) ?? readId(response.id) ?? '',
    status,
    score,
    maxScore,
    percentage,
    passed,
    gradeLetter: asString(response.gradeLetter) ?? deriveGradeLetter(percentage),
    gradedAt:
      asString(response.gradedAt) ??
      asString(firstQuestionGrade.gradedAt) ??
      new Date().toISOString(),
    gradedBy:
      normalizeGradedBy(response.gradedBy) ??
      normalizeGradedBy(firstQuestionGrade.gradedBy),
    questionGrades: questionGradesRaw.map((grade, index) => {
      const item = asRecord(grade) || {};
      const pointsPossible =
        asNumber(item.pointsPossible) ??
        asNumber(item.maxPoints) ??
        0;

      return {
        questionId: readId(item.questionId) ?? undefined,
        questionIndex: asNumber(item.questionIndex) ?? index,
        learningUnitQuestionId: readId(item.learningUnitQuestionId) ?? undefined,
        scoreEarned: asNumber(item.scoreEarned) ?? 0,
        pointsPossible,
        maxPoints: pointsPossible,
        feedback: asString(item.feedback),
        gradedAt: asString(item.gradedAt) ?? undefined,
        gradedBy: readId(item.gradedBy) ?? undefined,
      };
    }),
    notification: {
      requested: asBoolean(asRecord(response.notification)?.requested) ?? false,
      deferred: asBoolean(asRecord(response.notification)?.deferred) ?? false,
      notifiedAt: asString(asRecord(response.notification)?.notifiedAt) ?? undefined,
    },
  };
}

/**
 * POST /assessments/:assessmentId/attempts/start
 */
export async function startAssessmentAttempt(
  assessmentId: string,
  data: StartAssessmentAttemptRequest
): Promise<StartExamAttemptResponse> {
  const response = await client.post<ApiResponse<StartExamAttemptResponse>>(
    endpoints.assessmentAttempts.start(assessmentId),
    data
  );
  return normalizeStartResponse(response.data.data, assessmentId);
}

/**
 * GET /assessments/:assessmentId/attempts/:attemptId
 */
export async function getAssessmentAttempt(
  assessmentId: string,
  attemptId: string
): Promise<ExamAttempt> {
  const response = await client.get<ApiResponse<ExamAttempt>>(
    endpoints.assessmentAttempts.byId(assessmentId, attemptId)
  );
  return normalizeAttempt(response.data.data, assessmentId);
}

/**
 * PUT /assessments/:assessmentId/attempts/:attemptId/save
 */
export async function saveAssessmentResponses(
  assessmentId: string,
  attemptId: string,
  data: SaveAssessmentResponsesRequest
): Promise<SubmitAnswersResponse> {
  const response = await client.put<ApiResponse<SubmitAnswersResponse>>(
    endpoints.assessmentAttempts.save(assessmentId, attemptId),
    data
  );
  return normalizeSaveResponse(response.data.data);
}

/**
 * POST /assessments/:assessmentId/attempts/:attemptId/submit
 */
export async function submitAssessmentAttempt(
  assessmentId: string,
  attemptId: string,
  data?: SubmitExamRequest
): Promise<SubmitExamResponse> {
  const response = await client.post<ApiResponse<SubmitExamResponse>>(
    endpoints.assessmentAttempts.submit(assessmentId, attemptId),
    data || { confirmSubmit: true }
  );
  return normalizeSubmitResponse(response.data.data);
}

/**
 * GET /assessments/:assessmentId/attempts/:attemptId
 * Contract uses the same resource for detail/results.
 */
export async function getAssessmentAttemptResult(
  assessmentId: string,
  attemptId: string
): Promise<ExamResult> {
  const response = await client.get<ApiResponse<ExamResult>>(
    endpoints.assessmentAttempts.byId(assessmentId, attemptId)
  );
  return normalizeResult(response.data.data, assessmentId);
}

/**
 * GET /assessments/:assessmentId/attempts/my
 */
export async function listMyAssessmentAttempts(
  assessmentId: string
): Promise<ExamAttemptsListResponse> {
  const response = await client.get<ApiResponse<ExamAttemptsListResponse | UnknownRecord>>(
    endpoints.assessmentAttempts.my(assessmentId)
  );
  const data = asRecord(response.data.data) || {};
  const rawAttempts = asArray(data.attempts);
  const attempts = rawAttempts.map((attempt) =>
    normalizeAttemptListItem(attempt, assessmentId)
  );
  const paginationRecord = asRecord(data.pagination) || {};
  return {
    attempts,
    pagination: {
      page: asNumber(paginationRecord.page) ?? 1,
      limit: asNumber(paginationRecord.limit) ?? attempts.length,
      total: asNumber(paginationRecord.total) ?? attempts.length,
      totalPages: asNumber(paginationRecord.totalPages) ?? 1,
      hasNext: asBoolean(paginationRecord.hasNext) ?? false,
      hasPrev: asBoolean(paginationRecord.hasPrev) ?? false,
    },
  };
}

/**
 * GET /assessment-attempts
 * Staff aggregate listing across assessments.
 */
export async function listAssessmentAttempts(
  params?: ListExamAttemptsParams
): Promise<ExamAttemptsListResponse> {
  const requestParams: Record<string, unknown> = { ...(params || {}) };
  if (typeof requestParams.examId === 'string' && !requestParams.assessmentId) {
    requestParams.assessmentId = requestParams.examId;
  }
  delete requestParams.examId;
  if (requestParams.status === 'started') {
    requestParams.status = 'in_progress';
  }
  if (requestParams.status === 'grading') {
    requestParams.status = 'submitted';
  }

  const response = await client.get<ApiResponse<ExamAttemptsListResponse | UnknownRecord>>(
    endpoints.assessmentAttempts.listAll,
    { params: requestParams }
  );

  const data = asRecord(response.data.data) || {};
  const attempts = asArray(data.attempts).map((attempt) => {
    const attemptRecord = asRecord(attempt) || {};
    const assessmentId =
      readId(attemptRecord.assessmentId) ??
      readId(attemptRecord.examId) ??
      '';
    return normalizeAttemptListItem(attemptRecord, assessmentId);
  });
  const paginationRecord = asRecord(data.pagination) || {};

  return {
    attempts,
    pagination: {
      page: asNumber(paginationRecord.page) ?? 1,
      limit: asNumber(paginationRecord.limit) ?? attempts.length,
      total: asNumber(paginationRecord.total) ?? attempts.length,
      totalPages: asNumber(paginationRecord.totalPages) ?? 1,
      hasNext: asBoolean(paginationRecord.hasNext) ?? false,
      hasPrev: asBoolean(paginationRecord.hasPrev) ?? false,
    },
  };
}

/**
 * GET /assessment-attempts/:attemptId
 * Staff attempt detail lookup by attemptId.
 */
export async function getAssessmentAttemptByAttemptId(
  attemptId: string
): Promise<ExamAttempt> {
  const response = await client.get<ApiResponse<ExamAttempt | UnknownRecord>>(
    endpoints.assessmentAttempts.byAttemptId(attemptId)
  );

  const attempt = asRecord(response.data.data) || {};
  const assessmentId =
    readId(attempt.assessmentId) ??
    readId(attempt.examId) ??
    '';
  return normalizeAttempt(attempt, assessmentId);
}

/**
 * POST /assessment-attempts/:attemptId/grade
 * Staff atomic multi-question grading by attemptId.
 */
export async function gradeAssessmentAttemptByAttemptId(
  attemptId: string,
  data: GradeExamRequest
): Promise<GradeExamResponse> {
  const payload = {
    questionGrades: data.questionGrades.map((grade, index) => ({
      questionIndex: grade.questionIndex ?? index,
      ...(grade.questionId ? { questionId: grade.questionId } : {}),
      scoreEarned: grade.scoreEarned,
      ...(grade.feedback !== undefined ? { feedback: grade.feedback } : {}),
    })),
    ...(data.overallFeedback !== undefined
      ? { overallFeedback: data.overallFeedback }
      : {}),
    ...(data.notifyLearner !== undefined ? { notifyLearner: data.notifyLearner } : {}),
  };

  const response = await client.post<ApiResponse<GradeExamResponse | UnknownRecord>>(
    endpoints.assessmentAttempts.gradeByAttemptId(attemptId),
    payload
  );

  return normalizeAggregateGradeResponse(response.data.data);
}
