/**
 * MSW Request Handlers
 * Centralized mock API handlers for all entity endpoints
 *
 * These handlers provide default responses for API endpoints during testing.
 * Individual tests can override these using server.use() for specific scenarios.
 */

import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';

// Import mock data
import {
  mockClasses,
  mockFullClass,
  mockClassRoster,
  mockClassProgress,
  mockClassEnrollmentsResponse,
  mockEnrollmentResult,
  mockDeleteClassResponse,
  mockDropEnrollmentResponse,
  createMockClass,
} from './data/classes';

import {
  mockContentListResponse,
  mockContents,
  mockScormPackagesListResponse,
  mockScormPackages,
  mockMediaFilesListResponse,
  mockMediaFiles,
  mockUploadScormPackageResponse,
  mockUploadMediaFileResponse,
  mockScormLaunchResponse,
  mockPublishScormPackageResponse,
  mockUnpublishScormPackageResponse,
} from './data/content';

import {
  mockCourseModulesList,
  mockFullCourseModule,
  createMockCourseModule,
} from './data/courseModules';

import {
  mockPersonResponse,
  mockPersonExtendedLearnerResponse,
  mockDemographicsResponse,
} from '../fixtures/person.fixtures';
import {
  mockStartedAttempt,
  mockExamResult,
  mockExamAttemptListItems,
  mockSubmitAnswersResponse,
  mockSubmitExamResponse,
  mockStartExamAttemptResponse,
} from './data/examAttempts';

const baseUrl = env.apiFullUrl;
const assessmentAttemptStore = new Map<string, Record<string, unknown>>();

function buildAssessmentAttempt(
  assessmentId: string,
  attemptId: string
): Record<string, unknown> {
  return {
    ...mockStartedAttempt,
    id: attemptId,
    examId: assessmentId,
    examTitle: mockStartedAttempt.examTitle || 'Assessment',
    status: 'in_progress',
    maxAttempts: mockStartExamAttemptResponse.maxAttempts ?? 3,
    attemptsUsed: 1,
    summary: mockExamResult.summary,
    questionResults: mockExamResult.questionResults,
    overallFeedback: mockExamResult.overallFeedback,
    showCorrectAnswers: mockExamResult.showCorrectAnswers,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
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

function mapAttemptSummaryToAggregate(rawAttempt: unknown): Record<string, unknown> {
  const attempt = asRecord(rawAttempt) || {};
  const id = asString(attempt.id) || 'attempt-unknown';
  const assessmentId = asString(attempt.examId) || asString(attempt.assessmentId) || 'assessment-1';
  const status = asString(attempt.status) || 'submitted';
  const score = asNumber(attempt.score) || 0;
  const maxScore = asNumber(attempt.maxScore) || 100;
  const percentage = asNumber(attempt.percentage) || 0;
  const passed = typeof attempt.passed === 'boolean' ? attempt.passed : percentage >= 60;

  return {
    id,
    assessmentId,
    assessmentTitle: asString(attempt.examTitle) || 'Assessment',
    courseId: asString(attempt.courseId) || 'course-1',
    courseCode: asString(attempt.courseCode) || 'CBT101',
    courseName: asString(attempt.courseName) || 'CBT Fundamentals',
    courseVersionId: asString(attempt.courseVersionId) || 'course-version-1',
    courseContexts: [
      {
        courseId: asString(attempt.courseId) || 'course-1',
        courseCode: asString(attempt.courseCode) || 'CBT101',
        courseName: asString(attempt.courseName) || 'CBT Fundamentals',
        courseVersionId: asString(attempt.courseVersionId) || 'course-version-1',
      },
    ],
    learnerId: asString(attempt.learnerId) || 'learner-1',
    learnerName: asString(attempt.learnerName) || 'Learner',
    learnerEmail: asString(attempt.learnerEmail) || 'learner@example.com',
    enrollmentId: asString(attempt.enrollmentId) || 'enrollment-1',
    attemptNumber: asNumber(attempt.attemptNumber) || 1,
    status,
    scoring: {
      rawScore: score,
      maxScore,
      percentageScore: percentage,
      passed,
      gradingComplete: status === 'graded',
      requiresManualGrading: status !== 'graded',
    },
    timing: {
      startedAt: asString(attempt.startedAt) || new Date().toISOString(),
      submittedAt: asString(attempt.submittedAt),
      timeSpentSeconds: asNumber(attempt.timeSpent) || 0,
      timeLimitSeconds: asNumber(attempt.timeLimit) || 1800,
    },
    questions: asArray(attempt.questions),
    createdAt: asString(attempt.createdAt) || new Date().toISOString(),
    updatedAt: asString(attempt.updatedAt) || new Date().toISOString(),
  };
}

function buildAggregateDetail(attemptId: string): Record<string, unknown> {
  const fromStore = assessmentAttemptStore.get(attemptId);
  if (fromStore) {
    return {
      ...mapAttemptSummaryToAggregate(fromStore),
      ...fromStore,
      id: attemptId,
      assessmentId: asString(fromStore.examId) || asString(fromStore.assessmentId) || 'assessment-1',
      assessmentTitle: asString(fromStore.examTitle) || 'Assessment',
      courseId: asString(fromStore.courseId) || 'course-1',
      courseCode: asString(fromStore.courseCode) || 'CBT101',
      courseName: asString(fromStore.courseName) || 'CBT Fundamentals',
      courseVersionId: asString(fromStore.courseVersionId) || 'course-version-1',
      courseContexts:
        asArray(fromStore.courseContexts).length > 0
          ? fromStore.courseContexts
          : [
              {
                courseId: asString(fromStore.courseId) || 'course-1',
                courseCode: asString(fromStore.courseCode) || 'CBT101',
                courseName: asString(fromStore.courseName) || 'CBT Fundamentals',
                courseVersionId: asString(fromStore.courseVersionId) || 'course-version-1',
              },
            ],
    };
  }

  const fallback = mockExamAttemptListItems.find((attempt) => attempt.id === attemptId) || mockExamAttemptListItems[0];
  const detail = buildAssessmentAttempt((fallback?.examId as string) || 'assessment-1', attemptId);

  return {
    ...mapAttemptSummaryToAggregate(fallback || {}),
    ...detail,
    id: attemptId,
    assessmentId: (fallback?.examId as string) || 'assessment-1',
    assessmentTitle: fallback?.examTitle || 'Assessment',
    learnerName: fallback?.learnerName || 'Learner',
    status: fallback?.status || 'submitted',
    score: fallback?.score ?? 0,
    maxScore: fallback?.maxScore ?? 100,
    percentage: fallback?.percentage ?? 0,
    passed: fallback?.passed ?? false,
    submittedAt: fallback?.submittedAt,
    gradedAt: fallback?.gradedAt,
    timeSpent: fallback?.timeSpent ?? 0,
    questions: mockExamResult.questionResults,
  };
}

/**
 * MSW Request Handlers
 */
export const handlers = [
  // ==================== CANONICAL ASSESSMENT ATTEMPT HANDLERS ====================

  // POST /assessments/:assessmentId/attempts/start - Start assessment attempt
  http.post(`${baseUrl}/assessments/:assessmentId/attempts/start`, async ({ params, request }) => {
    const { assessmentId } = params;
    const body = (await request.json()) as { enrollmentId?: string; learningUnitId?: string };

    if (!body.enrollmentId) {
      return HttpResponse.json(
        {
          message: 'Enrollment ID is required',
          code: 'VALIDATION_ERROR',
          errors: {
            enrollmentId: ['Enrollment ID is required'],
          },
        },
        { status: 422 }
      );
    }

    if (body.learningUnitId === 'lu-mismatch') {
      return HttpResponse.json(
        {
          message: 'Learning unit does not match assessment',
          code: 'LEARNING_UNIT_ASSESSMENT_MISMATCH',
        },
        { status: 400 }
      );
    }

    if (body.learningUnitId === 'lu-not-found') {
      return HttpResponse.json(
        {
          message: 'Learning unit not found',
          code: 'LEARNING_UNIT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const attemptId = `attempt-${assessmentAttemptStore.size + 1}`;
    const attempt = buildAssessmentAttempt(assessmentId as string, attemptId);
    assessmentAttemptStore.set(attemptId, attempt);

    return HttpResponse.json(
      {
        data: {
          ...mockStartExamAttemptResponse,
          id: attemptId,
          examId: assessmentId as string,
          learnerId: (attempt.learnerId as string) || mockStartExamAttemptResponse.learnerId,
          status: 'in_progress',
          questions: attempt.questions || mockStartExamAttemptResponse.questions,
        },
      },
      { status: 201 }
    );
  }),

  // PUT /assessments/:assessmentId/attempts/:attemptId/save - Save responses
  http.put(
    `${baseUrl}/assessments/:assessmentId/attempts/:attemptId/save`,
    async ({ params, request }) => {
      const { attemptId } = params;
      const body = (await request.json()) as {
        responses?: Array<{ questionId: string; response: unknown }>;
      };

      if (!Array.isArray(body.responses)) {
        return HttpResponse.json(
          {
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR',
          },
          { status: 422 }
        );
      }

      return HttpResponse.json({
        data: {
          ...mockSubmitAnswersResponse,
          attemptId: attemptId as string,
          updatedAnswers: body.responses.map((response) => ({
            questionId: response.questionId,
            answer: response.response as string,
            savedAt: new Date().toISOString(),
          })),
        },
      });
    }
  ),

  // POST /assessments/:assessmentId/attempts/:attemptId/submit - Submit attempt
  http.post(
    `${baseUrl}/assessments/:assessmentId/attempts/:attemptId/submit`,
    ({ params }) => {
      const { assessmentId, attemptId } = params;
      const existing = assessmentAttemptStore.get(attemptId as string);

      assessmentAttemptStore.set(attemptId as string, {
        ...(existing || buildAssessmentAttempt(assessmentId as string, attemptId as string)),
        ...mockExamResult,
        id: attemptId as string,
        examId: assessmentId as string,
        status: 'graded',
        submittedAt: new Date().toISOString(),
      });

      return HttpResponse.json({
        data: {
          ...mockSubmitExamResponse,
          attemptId: attemptId as string,
        },
      });
    }
  ),

  // GET /assessments/:assessmentId/attempts/my - Learner attempt history
  http.get(`${baseUrl}/assessments/:assessmentId/attempts/my`, ({ params }) => {
    const { assessmentId } = params;
    return HttpResponse.json({
      data: {
        attempts: mockExamAttemptListItems.map((attempt) => ({
          ...attempt,
          examId: assessmentId as string,
        })),
        pagination: {
          page: 1,
          limit: 20,
          total: mockExamAttemptListItems.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  }),

  // GET /assessments/:assessmentId/attempts/:attemptId - Attempt detail/result
  http.get(`${baseUrl}/assessments/:assessmentId/attempts/:attemptId`, ({ params }) => {
    const { assessmentId, attemptId } = params;
    const attempt =
      assessmentAttemptStore.get(attemptId as string) ||
      buildAssessmentAttempt(assessmentId as string, attemptId as string);

    return HttpResponse.json({
      data: {
        ...attempt,
        id: attemptId as string,
        examId: assessmentId as string,
      },
    });
  }),

  // GET /assessment-attempts - Staff aggregate attempt listing
  http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const status = url.searchParams.get('status');
    const assessmentId = url.searchParams.get('assessmentId');

    const aggregateAttempts = [
      ...mockExamAttemptListItems.map((attempt) => mapAttemptSummaryToAggregate(attempt)),
      ...Array.from(assessmentAttemptStore.values()).map((attempt) =>
        mapAttemptSummaryToAggregate(attempt)
      ),
    ];

    let filtered = aggregateAttempts;

    if (assessmentId) {
      filtered = filtered.filter((attempt) => attempt.assessmentId === assessmentId);
    }

    if (status) {
      filtered = filtered.filter((attempt) => attempt.status === status);
    }

    if (search) {
      filtered = filtered.filter((attempt) => {
        const learnerName = asString(attempt.learnerName)?.toLowerCase() || '';
        const learnerEmail = asString(attempt.learnerEmail)?.toLowerCase() || '';
        const assessmentTitle = asString(attempt.assessmentTitle)?.toLowerCase() || '';
        return (
          learnerName.includes(search) ||
          learnerEmail.includes(search) ||
          assessmentTitle.includes(search) ||
          asString(attempt.id)?.toLowerCase().includes(search)
        );
      });
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        attempts: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // GET /assessment-attempts/:attemptId - Staff attempt detail by attemptId
  http.get(`${baseUrl}/assessment-attempts/:attemptId`, ({ params }) => {
    const { attemptId } = params;
    const detail = buildAggregateDetail(attemptId as string);

    return HttpResponse.json({
      success: true,
      data: detail,
    });
  }),

  // POST /assessment-attempts/:attemptId/grade - Staff batch grading by attemptId
  http.post(`${baseUrl}/assessment-attempts/:attemptId/grade`, async ({ params, request }) => {
    const { attemptId } = params;
    const body = (await request.json()) as {
      questionGrades?: Array<{
        questionIndex?: number;
        questionId?: string;
        scoreEarned?: number;
        feedback?: string;
      }>;
      overallFeedback?: string;
      notifyLearner?: boolean;
    };

    if (!Array.isArray(body.questionGrades) || body.questionGrades.length === 0) {
      return HttpResponse.json(
        {
          success: false,
          code: 'VALIDATION_ERROR',
          message:
            'questionGrades is required; each item must include questionIndex and scoreEarned',
        },
        { status: 400 }
      );
    }

    const hasInvalidGrade = body.questionGrades.some(
      (grade) =>
        typeof grade.questionIndex !== 'number' ||
        typeof grade.scoreEarned !== 'number' ||
        grade.scoreEarned < 0
    );
    if (hasInvalidGrade) {
      return HttpResponse.json(
        {
          success: false,
          code: 'VALIDATION_ERROR',
          message:
            'questionGrades is required; each item must include questionIndex and scoreEarned',
        },
        { status: 400 }
      );
    }

    const attemptDetail = buildAggregateDetail(attemptId as string);
    const questions = asArray(attemptDetail.questions);
    const gradingComplete = body.questionGrades.length >= questions.length;

    const score = body.questionGrades.reduce((sum, grade) => sum + (grade.scoreEarned || 0), 0);
    const maxScore =
      questions.length > 0
        ? questions.reduce((sum, question) => sum + (asNumber(asRecord(question)?.points) || 0), 0)
        : 100;

    const gradedQuestions = body.questionGrades.map((grade, index) => ({
      questionId: grade.questionId || asString(asRecord(questions[grade.questionIndex || 0])?.id) || `q-${index + 1}`,
      questionIndex: grade.questionIndex as number,
      learningUnitQuestionId: `luq-${index + 1}`,
      scoreEarned: grade.scoreEarned as number,
      pointsPossible: asNumber(asRecord(questions[grade.questionIndex || 0])?.points) || 10,
      feedback: grade.feedback,
      gradedAt: new Date().toISOString(),
      gradedBy: 'staff-1',
    }));

    return HttpResponse.json({
      success: true,
      message: 'Attempt graded successfully',
      data: {
        attemptId: attemptId as string,
        status: gradingComplete ? 'graded' : 'submitted',
        learningUnitId: asString(attemptDetail.learningUnitId) || undefined,
        scoring: {
          rawScore: score,
          maxScore,
          percentageScore: maxScore > 0 ? (score / maxScore) * 100 : 0,
          passed: maxScore > 0 ? score / maxScore >= 0.6 : false,
          gradingComplete,
          requiresManualGrading: !gradingComplete,
        },
        notification: {
          requested: !!body.notifyLearner,
          deferred: !!body.notifyLearner && !gradingComplete,
          notifiedAt:
            body.notifyLearner && gradingComplete
              ? new Date().toISOString()
              : undefined,
        },
        questionGrades: gradedQuestions,
        overallFeedback: body.overallFeedback,
      },
    });
  }),

  // ==================== CLASS API HANDLERS ====================

  // GET /classes - List classes
  http.get(`${baseUrl}/classes`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const course = url.searchParams.get('course');
    const instructor = url.searchParams.get('instructor');
    const term = url.searchParams.get('term');
    const search = url.searchParams.get('search');

    let filteredClasses = [...mockClasses];

    // Apply filters
    if (status) {
      filteredClasses = filteredClasses.filter((c) => c.status === status);
    }
    if (course) {
      filteredClasses = filteredClasses.filter((c) => c.course.id === course);
    }
    if (instructor) {
      filteredClasses = filteredClasses.filter((c) =>
        c.instructors.some((i) => i.id === instructor)
      );
    }
    if (term) {
      filteredClasses = filteredClasses.filter((c) => c.academicTerm?.id === term);
    }
    if (search) {
      filteredClasses = filteredClasses.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Pagination
    const total = filteredClasses.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedClasses = filteredClasses.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        classes: paginatedClasses,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // GET /classes/:id - Get single class
  http.get(`${baseUrl}/classes/:id`, ({ params }) => {
    const { id } = params;

    if (id === mockFullClass.id) {
      return HttpResponse.json({
        success: true,
        data: mockFullClass,
      });
    }

    return HttpResponse.json(
      { message: 'Class not found' },
      { status: 404 }
    );
  }),

  // POST /classes - Create class
  http.post(`${baseUrl}/classes`, async ({ request }) => {
    const body = await request.json();
    const newClass = createMockClass({
      name: (body as any).name,
    });

    return HttpResponse.json(
      {
        success: true,
        data: newClass,
        message: 'Class created successfully',
      },
      { status: 201 }
    );
  }),

  // PUT /classes/:id - Update class
  http.put(`${baseUrl}/classes/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;

    const updatedClass = {
      ...mockFullClass,
      id: id as string,
      ...body,
    };

    return HttpResponse.json({
      success: true,
      data: updatedClass,
      message: 'Class updated successfully',
    });
  }),

  // DELETE /classes/:id - Delete class
  http.delete(`${baseUrl}/classes/:id`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockDeleteClassResponse,
        id: id as string,
      },
      message: 'Class deleted successfully',
    });
  }),

  // GET /classes/:id/roster - Get class roster
  http.get(`${baseUrl}/classes/:id/roster`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockClassRoster,
        classId: id as string,
      },
    });
  }),

  // POST /classes/:id/enrollments - Add learners to class
  http.post(`${baseUrl}/classes/:id/enrollments`, async ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockEnrollmentResult,
        classId: id as string,
      },
      message: 'Learners enrolled successfully',
    });
  }),

  // DELETE /classes/:classId/enrollments/:enrollmentId - Remove learner from class
  http.delete(
    `${baseUrl}/classes/:classId/enrollments/:enrollmentId`,
    ({ params }) => {
      const { enrollmentId } = params;

      return HttpResponse.json({
        success: true,
        data: {
          ...mockDropEnrollmentResponse,
          enrollmentId: enrollmentId as string,
        },
        message: 'Learner removed successfully',
      });
    }
  ),

  // GET /classes/:id/progress - Get class progress
  http.get(`${baseUrl}/classes/:id/progress`, ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockClassProgress,
        classId: id as string,
      },
    });
  }),

  // GET /classes/:id/enrollments - Get class enrollments
  http.get(`${baseUrl}/classes/:id/enrollments`, ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');

    let enrollments = [...mockClassEnrollmentsResponse.enrollments];

    if (status) {
      enrollments = enrollments.filter((e) => e.status === status);
    }

    return HttpResponse.json({
      success: true,
      data: {
        classId: id as string,
        enrollments,
        pagination: {
          page,
          limit,
          total: enrollments.length,
          totalPages: Math.ceil(enrollments.length / limit),
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  }),

  // ==================== CONTENT API HANDLERS ====================

  // GET /content - List all content
  http.get(`${baseUrl}/content`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const departmentId = url.searchParams.get('departmentId');

    let filteredContent = [...mockContentListResponse.content];

    if (type) {
      filteredContent = filteredContent.filter((c) => c.type === type);
    }
    if (status) {
      filteredContent = filteredContent.filter((c) => c.status === status);
    }
    if (departmentId) {
      filteredContent = filteredContent.filter((c) => c.departmentId === departmentId);
    }

    const total = filteredContent.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedContent = filteredContent.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        content: paginatedContent,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // GET /content/:id - Get single content item
  http.get(`${baseUrl}/content/:id`, ({ params }) => {
    const { id } = params;
    const content = mockContents.find((c) => c.id === id);

    if (content) {
      return HttpResponse.json({
        success: true,
        data: content,
      });
    }

    return HttpResponse.json(
      { message: 'Content not found' },
      { status: 404 }
    );
  }),

  // ==================== SCORM PACKAGE HANDLERS ====================

  // GET /content/scorm - List SCORM packages
  http.get(`${baseUrl}/content/scorm`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const version = url.searchParams.get('version');
    const status = url.searchParams.get('status');

    let filteredPackages = [...mockScormPackagesListResponse.packages];

    if (version) {
      filteredPackages = filteredPackages.filter((p) => p.version === version);
    }
    if (status) {
      filteredPackages = filteredPackages.filter((p) => p.status === status);
    }

    const total = filteredPackages.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPackages = filteredPackages.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        packages: paginatedPackages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // POST /content/scorm - Upload SCORM package
  http.post(`${baseUrl}/content/scorm`, async ({ request }) => {
    await request.formData(); // Consume form data

    return HttpResponse.json(
      {
        success: true,
        data: mockUploadScormPackageResponse,
      },
      { status: 201 }
    );
  }),

  // GET /content/scorm/:id - Get SCORM package
  http.get(`${baseUrl}/content/scorm/:id`, ({ params }) => {
    const { id } = params;
    const scormPackage = mockScormPackages.find((p) => p.id === id);

    if (scormPackage) {
      return HttpResponse.json({
        success: true,
        data: scormPackage,
      });
    }

    return HttpResponse.json(
      { message: 'SCORM package not found' },
      { status: 404 }
    );
  }),

  // PUT /content/scorm/:id - Update SCORM package
  http.put(`${baseUrl}/content/scorm/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;
    const scormPackage = mockScormPackages.find((p) => p.id === id);

    if (scormPackage) {
      const updatedPackage = {
        ...scormPackage,
        ...body,
      };

      return HttpResponse.json({
        success: true,
        data: updatedPackage,
      });
    }

    return HttpResponse.json(
      { message: 'SCORM package not found' },
      { status: 404 }
    );
  }),

  // DELETE /content/scorm/:id - Delete SCORM package
  http.delete(`${baseUrl}/content/scorm/:id`, () => {
    return HttpResponse.json({}, { status: 204 });
  }),

  // POST /content/scorm/:id/launch - Launch SCORM package
  http.post(`${baseUrl}/content/scorm/:id/launch`, async ({ params }) => {
    const { id: _id } = params;

    return HttpResponse.json({
      success: true,
      data: mockScormLaunchResponse,
    });
  }),

  // POST /content/scorm/:id/publish - Publish SCORM package
  http.post(`${baseUrl}/content/scorm/:id/publish`, async ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockPublishScormPackageResponse,
        id: id as string,
      },
    });
  }),

  // POST /content/scorm/:id/unpublish - Unpublish SCORM package
  http.post(`${baseUrl}/content/scorm/:id/unpublish`, async ({ params }) => {
    const { id } = params;

    return HttpResponse.json({
      success: true,
      data: {
        ...mockUnpublishScormPackageResponse,
        id: id as string,
      },
    });
  }),

  // ==================== MEDIA FILE HANDLERS ====================

  // GET /media - List media files
  http.get(`${baseUrl}/media`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');
    const departmentId = url.searchParams.get('departmentId');

    let filteredMedia = [...mockMediaFilesListResponse.media];

    if (type) {
      filteredMedia = filteredMedia.filter((m) => m.type === type);
    }
    if (departmentId) {
      filteredMedia = filteredMedia.filter((m) => m.departmentId === departmentId);
    }

    const total = filteredMedia.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedMedia = filteredMedia.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: {
        media: paginatedMedia,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  }),

  // POST /media/upload-url - Request upload URL
  http.post(`${baseUrl}/media/upload-url`, async ({ request }) => {
    const body = (await request.json()) as {
      filename?: string;
      mimeType?: string;
    };

    const uploadId = `upload-${Date.now()}`;
    const extension = body.filename?.split('.').pop() || 'bin';

    return HttpResponse.json({
      success: true,
      data: {
        uploadId,
        uploadUrl: `${baseUrl}/media/local-upload/${uploadId}`,
        method: 'PUT',
        contentType: body.mimeType || 'application/octet-stream',
        storageKey: `media/content/${uploadId}.${extension}`,
      },
    });
  }),

  // PUT /media/local-upload/:uploadId - Direct upload sink for tests
  http.put(`${baseUrl}/media/local-upload/:uploadId`, async ({ request }) => {
    await request.arrayBuffer();
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /media/confirm - Confirm upload and create media record
  http.post(`${baseUrl}/media/confirm`, async ({ request }) => {
    const body = (await request.json()) as {
      metadata?: { title?: string; description?: string; departmentId?: string };
    };

    return HttpResponse.json(
      {
        success: true,
        data: {
          ...mockUploadMediaFileResponse,
          title: body.metadata?.title || mockUploadMediaFileResponse.title,
          description: body.metadata?.description || null,
          departmentId: body.metadata?.departmentId || mockUploadMediaFileResponse.departmentId,
          fileSize: mockUploadMediaFileResponse.size,
          cdnUrl: mockUploadMediaFileResponse.url,
        },
      },
      { status: 201 }
    );
  }),

  // GET /media/:id - Get media file
  http.get(`${baseUrl}/media/:id`, ({ params }) => {
    const { id } = params;
    const mediaFile = mockMediaFiles.find((m) => m.id === id);

    if (mediaFile) {
      return HttpResponse.json({
        success: true,
        data: mediaFile,
      });
    }

    return HttpResponse.json(
      { message: 'Media file not found' },
      { status: 404 }
    );
  }),

  // PUT /media/:id - Update media file metadata
  http.put(`${baseUrl}/media/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;
    const mediaFile = mockMediaFiles.find((m) => m.id === id);

    if (mediaFile) {
      const updatedMedia = {
        ...mediaFile,
        ...body,
      };

      return HttpResponse.json({
        success: true,
        data: updatedMedia,
      });
    }

    return HttpResponse.json(
      { message: 'Media file not found' },
      { status: 404 }
    );
  }),

  // DELETE /media/:id - Delete media file
  http.delete(`${baseUrl}/media/:id`, ({ params }) => {
    const { id: _id } = params;

    return HttpResponse.json({}, { status: 204 });
  }),

  // ==================== COURSE SEGMENT HANDLERS ====================

  // GET /courses/:courseId/modules - List course segments
  http.get(`${baseUrl}/courses/:courseId/modules`, ({ params, request }) => {
    const { courseId } = params;
    const url = new URL(request.url);
    const includeUnpublished = url.searchParams.get('includeUnpublished') === 'true';

    let modules = [...mockCourseModulesList];

    if (!includeUnpublished) {
      modules = modules.filter((m) => m.isPublished);
    }

    return HttpResponse.json({
      data: {
        courseId: courseId as string,
        courseTitle: 'Advanced Web Development',
        modules,
        totalModules: modules.length,
      },
    });
  }),

  // GET /courses/:courseId/modules/:moduleId - Get course segment
  http.get(`${baseUrl}/courses/:courseId/modules/:moduleId`, ({ params }) => {
    const { courseId, moduleId } = params;

    return HttpResponse.json({
      data: {
        ...mockFullCourseModule,
        id: moduleId as string,
        courseId: courseId as string,
      },
    });
  }),

  // POST /courses/:courseId/modules - Create course segment
  http.post(`${baseUrl}/courses/:courseId/modules`, async ({ params, request }) => {
    const { courseId } = params;
    const body = await request.json();

    const newSegment = createMockCourseModule({
      courseId: courseId as string,
      title: (body as any).title,
      type: (body as any).type,
      order: (body as any).order,
    });

    return HttpResponse.json(
      {
        data: newSegment,
      },
      { status: 201 }
    );
  }),

  // PUT /courses/:courseId/modules/:moduleId - Update course segment
  http.put(
    `${baseUrl}/courses/:courseId/modules/:moduleId`,
    async ({ params, request }) => {
      const { courseId, moduleId } = params;
      const body = await request.json() as Record<string, unknown>;

      const updatedSegment = {
        ...mockFullCourseModule,
        id: moduleId as string,
        courseId: courseId as string,
        ...body,
      };

      return HttpResponse.json({
        data: updatedSegment,
      });
    }
  ),

  // DELETE /courses/:courseId/modules/:moduleId - Delete course segment
  http.delete(`${baseUrl}/courses/:courseId/modules/:moduleId`, ({ params }) => {
    const { courseId: _courseId, moduleId } = params;

    return HttpResponse.json({
      data: {
        id: moduleId as string,
        title: 'Introduction to TypeScript',
        deletedAt: new Date().toISOString(),
        affectedModules: 0,
        reorderedModules: [],
      },
    });
  }),

  // PATCH /courses/:courseId/modules/reorder - Reorder course segments
  http.patch(
    `${baseUrl}/courses/:courseId/modules/reorder`,
    async ({ params, request }) => {
      const { courseId } = params;
      const body = await request.json();
      const { moduleIds } = body as any;

      const modules = moduleIds.map((id: string, index: number) => ({
        id,
        title: `Module ${index + 1}`,
        oldOrder: parseInt(id.split('-')[1] || '1'),
        newOrder: index + 1,
      }));

      return HttpResponse.json({
        data: {
          courseId: courseId as string,
          modules,
          totalReordered: modules.length,
        },
      });
    }
  ),

  // POST /courses/:courseId/modules/:moduleId/link-content - Link content to module
  http.post(
    `${baseUrl}/courses/:courseId/modules/:moduleId/link-content`,
    async ({ params, request }) => {
      const { courseId: _courseId, moduleId } = params;
      const body = await request.json() as Record<string, unknown>;
      const { contentId, contentType } = body as any;

      return HttpResponse.json({
        data: {
          moduleId: moduleId as string,
          contentId,
          contentType: contentType || 'scorm',
          linkedAt: new Date().toISOString(),
          message: 'Content linked successfully',
        },
      });
    }
  ),

  // ==================== PERSON API V2.0 HANDLERS ====================

  // GET /users/me/person - Get person data
  http.get(`${baseUrl}/users/me/person`, () => {
    return HttpResponse.json(mockPersonResponse);
  }),

  // PUT /users/me/person - Update person data
  http.put(`${baseUrl}/users/me/person`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      message: 'Person data updated successfully',
      data: {
        ...mockPersonResponse.data,
        ...body,
      },
    });
  }),

  // GET /users/me/person/extended - Get extended person data
  http.get(`${baseUrl}/users/me/person/extended`, () => {
    return HttpResponse.json(mockPersonExtendedLearnerResponse);
  }),

  // PUT /users/me/person/extended - Update extended person data
  http.put(`${baseUrl}/users/me/person/extended`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      message: 'Extended person data updated successfully',
      data: {
        ...mockPersonExtendedLearnerResponse.data,
        ...(mockPersonExtendedLearnerResponse.data.role === 'learner'
          ? { learner: { ...mockPersonExtendedLearnerResponse.data.learner, ...body } }
          : {}),
      },
    });
  }),

  // ==================== DEMOGRAPHICS API V2.0 HANDLERS ====================

  // GET /users/me/demographics - Get demographics data
  http.get(`${baseUrl}/users/me/demographics`, () => {
    return HttpResponse.json(mockDemographicsResponse);
  }),

  // PUT /users/me/demographics - Update demographics data
  http.put(`${baseUrl}/users/me/demographics`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      message: 'Demographics data updated successfully',
      data: {
        ...mockDemographicsResponse.data,
        ...body,
      },
    });
  }),

  // ==================== PASSWORD CHANGE HANDLERS (PHASE 6) ====================

  // POST /users/me/password - Change user password
  http.post(`${baseUrl}/users/me/password`, async ({ request }) => {
    const body = (await request.json()) as { currentPassword: string; newPassword: string };

    // Simulate validation
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    // Simulate wrong current password
    if (body.currentPassword === 'wrongpassword') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  }),

  // POST /admin/me/password - Change admin password
  http.post(`${baseUrl}/admin/me/password`, async ({ request }) => {
    const body = (await request.json()) as { currentPassword: string; newPassword: string };

    // Simulate validation
    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    // Simulate wrong current password
    if (body.currentPassword === 'wrongpassword') {
      return HttpResponse.json(
        {
          success: false,
          message: 'Current password is incorrect',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Admin password changed successfully',
    });
  }),

  // ==================== DEFAULT HANDLERS ====================

  // Health check endpoint
  http.get(`${baseUrl}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
