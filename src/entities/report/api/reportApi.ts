/**
 * Report API Client
 * Implements all report and report template management endpoints
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  Report,
  ReportsListResponse,
  ReportFilters,
  CreateReportPayload,
  GenerateReportResponse,
  DownloadReportResponse,
  ReportTemplate,
  ReportTemplatesListResponse,
  TemplateFilters,
  CreateReportTemplatePayload,
  UpdateReportTemplatePayload,
  CanonicalCourseContext,
  CompletionReportFilters,
  CompletionReportResponse,
  PerformanceReportFilters,
  PerformanceReportResponse,
  TranscriptFilters,
  LearnerTranscriptResponse,
  CourseReportFilters,
  CourseReportResponse,
  ProgramReportFilters,
  ProgramReportResponse,
  DepartmentReportFilters,
  DepartmentReportResponse,
  ExportReportFilters,
  ReportExportResponse,
  CompletionReportGroup,
  CompletionReportDetail,
  PerformanceMetric,
  PerformanceCourseMetric,
  TranscriptProgram,
  TranscriptCourse,
  CourseReportModuleProgress,
  CourseReportModuleAnalytics,
  CourseReportLearner,
  CourseReportCourse,
  ProgramCoursePerformance,
  DepartmentCoursePerformance,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    const text = asString(value);
    if (text && text.trim().length > 0) return text;
  }
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

function normalizeCourseContext(raw: unknown): CanonicalCourseContext {
  const row = asRecord(raw) || {};
  const nestedCourse = asRecord(row.course) || {};

  const courseId =
    asString(row.courseId) ??
    asString(row.id) ??
    asString(row._id) ??
    asString(nestedCourse.courseId) ??
    asString(nestedCourse.id) ??
    asString(nestedCourse._id) ??
    '';

  const courseCode =
    asString(row.courseCode) ??
    asString(row.code) ??
    asString(nestedCourse.courseCode) ??
    asString(nestedCourse.code) ??
    '';

  const courseName =
    asString(row.courseName) ??
    asString(row.courseTitle) ??
    asString(row.title) ??
    asString(row.name) ??
    asString(nestedCourse.courseName) ??
    asString(nestedCourse.courseTitle) ??
    asString(nestedCourse.title) ??
    asString(nestedCourse.name) ??
    courseCode;

  const courseVersionId =
    asString(row.courseVersionId) ??
    asString(row.versionId) ??
    asString(nestedCourse.courseVersionId) ??
    asString(nestedCourse.versionId) ??
    undefined;

  return {
    courseId,
    courseCode,
    courseName,
    ...(courseVersionId ? { courseVersionId } : {}),
  };
}

function normalizeCompletionDetail(raw: unknown): CompletionReportDetail {
  const detail = asRecord(raw) || {};
  return {
    ...detail,
    ...normalizeCourseContext(detail),
  } as CompletionReportDetail;
}

function normalizeCompletionGroup(raw: unknown): CompletionReportGroup {
  const group = asRecord(raw) || {};
  const details = asArray(group.details).map((detail) => normalizeCompletionDetail(detail));
  return {
    ...group,
    details,
  } as CompletionReportGroup;
}

function normalizeCompletionReport(raw: CompletionReportResponse): CompletionReportResponse {
  const report = asRecord(raw) || {};
  return {
    summary: asRecord(report.summary) || {},
    groups: asArray(report.groups).map((group) => normalizeCompletionGroup(group)),
    filters: asRecord(report.filters) || {},
    pagination: asRecord(report.pagination) || {},
  };
}

function normalizePerformanceCourse(raw: unknown): PerformanceCourseMetric {
  const course = asRecord(raw) || {};
  return {
    ...course,
    ...normalizeCourseContext(course),
  } as PerformanceCourseMetric;
}

function normalizePerformanceMetric(raw: unknown): PerformanceMetric {
  const metric = asRecord(raw) || {};
  return {
    ...metric,
    coursePerformance: asArray(metric.coursePerformance).map((course) =>
      normalizePerformanceCourse(course)
    ),
  } as PerformanceMetric;
}

function normalizePerformanceReport(raw: PerformanceReportResponse): PerformanceReportResponse {
  const report = asRecord(raw) || {};
  return {
    summary: asRecord(report.summary) || {},
    performanceMetrics: asArray(report.performanceMetrics).map((metric) =>
      normalizePerformanceMetric(metric)
    ),
    analytics: asRecord(report.analytics) || {},
    filters: asRecord(report.filters) || {},
    pagination: asRecord(report.pagination) || {},
  };
}

function normalizeTranscriptCourse(raw: unknown): TranscriptCourse {
  const course = asRecord(raw) || {};
  return {
    ...course,
    ...normalizeCourseContext(course),
  } as TranscriptCourse;
}

function normalizeTranscriptProgram(raw: unknown): TranscriptProgram {
  const program = asRecord(raw) || {};
  return {
    ...program,
    courses: asArray(program.courses).map((course) => normalizeTranscriptCourse(course)),
  } as TranscriptProgram;
}

function normalizeLearnerTranscript(
  raw: LearnerTranscriptResponse
): LearnerTranscriptResponse {
  const report = asRecord(raw) || {};
  const transcript = asRecord(report.transcript) || {};
  return {
    transcript: {
      ...transcript,
      programs: asArray(transcript.programs).map((program) => normalizeTranscriptProgram(program)),
    },
  };
}

function normalizeCourseReportCourse(raw: unknown): CourseReportCourse {
  const course = asRecord(raw) || {};
  const normalizedCourse = normalizeCourseContext(course);
  return {
    ...course,
    ...normalizedCourse,
    id: normalizedCourse.courseId,
    code: normalizedCourse.courseCode,
    title: normalizedCourse.courseName,
  } as CourseReportCourse;
}

function normalizeModuleProgress(raw: unknown, index: number): CourseReportModuleProgress {
  const moduleRow = asRecord(raw) || {};
  const moduleOrder =
    asNumber(moduleRow.moduleOrder) ??
    asNumber(moduleRow.order) ??
    index + 1;

  return {
    ...moduleRow,
    moduleId:
      asString(moduleRow.moduleId) ??
      asString(moduleRow.learningUnitId) ??
      asString(moduleRow.id) ??
      `module-${index + 1}`,
    moduleName:
      asString(moduleRow.moduleName) ??
      asString(moduleRow.learningUnitName) ??
      asString(moduleRow.learningUnitTitle) ??
      asString(moduleRow.title) ??
      asString(moduleRow.name) ??
      `Module ${index + 1}`,
    moduleOrder,
  };
}

function normalizeCourseLearner(raw: unknown): CourseReportLearner {
  const learner = asRecord(raw) || {};
  return {
    ...learner,
    moduleProgress: asArray(learner.moduleProgress).map((module, index) =>
      normalizeModuleProgress(module, index)
    ),
  } as CourseReportLearner;
}

function normalizeModuleAnalytics(raw: unknown, index: number): CourseReportModuleAnalytics {
  const moduleAnalytics = asRecord(raw) || {};
  const moduleOrder =
    asNumber(moduleAnalytics.moduleOrder) ??
    asNumber(moduleAnalytics.order) ??
    index + 1;

  return {
    ...moduleAnalytics,
    moduleId:
      asString(moduleAnalytics.moduleId) ??
      asString(moduleAnalytics.learningUnitId) ??
      asString(moduleAnalytics.id) ??
      `module-${index + 1}`,
    moduleName:
      asString(moduleAnalytics.moduleName) ??
      asString(moduleAnalytics.learningUnitName) ??
      asString(moduleAnalytics.learningUnitTitle) ??
      asString(moduleAnalytics.title) ??
      asString(moduleAnalytics.name) ??
      `Module ${index + 1}`,
    moduleOrder,
  };
}

function normalizeCourseReport(raw: CourseReportResponse): CourseReportResponse {
  const report = asRecord(raw) || {};
  return {
    ...report,
    course: normalizeCourseReportCourse(report.course),
    summary: asRecord(report.summary) || {},
    learners: asArray(report.learners).map((learner) => normalizeCourseLearner(learner)),
    moduleAnalytics: asArray(report.moduleAnalytics).map((module, index) =>
      normalizeModuleAnalytics(module, index)
    ),
  } as CourseReportResponse;
}

function normalizeProgramCoursePerformance(raw: unknown): ProgramCoursePerformance {
  const course = asRecord(raw) || {};
  return {
    ...course,
    ...normalizeCourseContext(course),
  } as ProgramCoursePerformance;
}

function normalizeProgramReport(raw: ProgramReportResponse): ProgramReportResponse {
  const report = asRecord(raw) || {};
  return {
    ...report,
    program: asRecord(report.program) || {},
    summary: asRecord(report.summary) || {},
    coursePerformance: asArray(report.coursePerformance).map((course) =>
      normalizeProgramCoursePerformance(course)
    ),
  } as ProgramReportResponse;
}

function normalizeDepartmentCoursePerformance(raw: unknown): DepartmentCoursePerformance {
  const course = asRecord(raw) || {};
  return {
    ...course,
    ...normalizeCourseContext(course),
  } as DepartmentCoursePerformance;
}

function normalizeDepartmentReport(raw: DepartmentReportResponse): DepartmentReportResponse {
  const report = asRecord(raw) || {};
  return {
    ...report,
    department: asRecord(report.department) || {},
    summary: asRecord(report.summary) || {},
    coursePerformance: asArray(report.coursePerformance).map((course) =>
      normalizeDepartmentCoursePerformance(course)
    ),
  } as DepartmentReportResponse;
}

function normalizeExportReport(raw: ReportExportResponse): ReportExportResponse {
  const report = asRecord(raw) || {};
  return {
    ...report,
    reportType:
      firstNonEmptyString(report.reportType, report.type) ??
      '',
    format:
      firstNonEmptyString(report.format) ??
      '',
    fileUrl:
      firstNonEmptyString(report.fileUrl, report.url, report.downloadUrl) ??
      '',
    fileName:
      firstNonEmptyString(report.fileName, report.name) ??
      'report-export',
    fileSizeBytes: asNumber(report.fileSizeBytes) ?? undefined,
    recordCount: asNumber(report.recordCount) ?? undefined,
    generatedAt: asString(report.generatedAt) ?? undefined,
    expiresAt: asString(report.expiresAt) ?? undefined,
    filters: asRecord(report.filters) || {},
  };
}

// =====================
// REPORTS
// =====================

/**
 * GET /reports - List all reports
 */
export async function listReports(filters?: ReportFilters): Promise<ReportsListResponse> {
  const response = await client.get<ApiResponse<ReportsListResponse>>(endpoints.reports.list, {
    params: filters,
  });
  return response.data.data;
}

/**
 * GET /reports/:id - Get report details
 */
export async function getReport(id: string): Promise<Report> {
  const response = await client.get<ApiResponse<Report>>(endpoints.reports.byId(id));
  return response.data.data;
}

/**
 * POST /reports - Create report
 */
export async function createReport(
  payload: CreateReportPayload
): Promise<GenerateReportResponse> {
  const response = await client.post<ApiResponse<GenerateReportResponse>>(
    endpoints.reports.create,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /reports/:id - Delete report
 */
export async function deleteReport(id: string): Promise<void> {
  await client.delete(endpoints.reports.delete(id));
}

/**
 * GET /reports/:id/download?format=:format - Download report
 */
export async function downloadReport(
  id: string,
  format: string
): Promise<DownloadReportResponse> {
  const response = await client.get<ApiResponse<DownloadReportResponse>>(
    endpoints.reports.download(id, format)
  );
  return response.data.data;
}

/**
 * GET /reports/completion - Completion report with canonical/mixed course fields
 */
export async function getCompletionReport(
  filters?: CompletionReportFilters
): Promise<CompletionReportResponse> {
  const response = await client.get<ApiResponse<CompletionReportResponse>>(
    endpoints.reports.completion,
    { params: filters }
  );
  return normalizeCompletionReport(response.data.data);
}

/**
 * GET /reports/performance - Performance report with canonical/mixed course fields
 */
export async function getPerformanceReport(
  filters?: PerformanceReportFilters
): Promise<PerformanceReportResponse> {
  const response = await client.get<ApiResponse<PerformanceReportResponse>>(
    endpoints.reports.performance,
    { params: filters }
  );
  return normalizePerformanceReport(response.data.data);
}

/**
 * GET /reports/transcript/:learnerId - Learner transcript
 */
export async function getLearnerTranscript(
  learnerId: string,
  filters?: TranscriptFilters
): Promise<LearnerTranscriptResponse> {
  const response = await client.get<ApiResponse<LearnerTranscriptResponse>>(
    endpoints.reports.transcript(learnerId),
    { params: filters }
  );
  return normalizeLearnerTranscript(response.data.data);
}

/**
 * GET /reports/course/:courseId - Course report with module analytics
 */
export async function getCourseReport(
  courseId: string,
  filters?: CourseReportFilters
): Promise<CourseReportResponse> {
  const response = await client.get<ApiResponse<CourseReportResponse>>(
    endpoints.reports.course(courseId),
    { params: filters }
  );
  return normalizeCourseReport(response.data.data);
}

/**
 * GET /reports/program/:programId - Program report
 */
export async function getProgramReport(
  programId: string,
  filters?: ProgramReportFilters
): Promise<ProgramReportResponse> {
  const response = await client.get<ApiResponse<ProgramReportResponse>>(
    endpoints.reports.program(programId),
    { params: filters }
  );
  return normalizeProgramReport(response.data.data);
}

/**
 * GET /reports/department/:departmentId - Department report
 */
export async function getDepartmentReport(
  departmentId: string,
  filters?: DepartmentReportFilters
): Promise<DepartmentReportResponse> {
  const response = await client.get<ApiResponse<DepartmentReportResponse>>(
    endpoints.reports.department(departmentId),
    { params: filters }
  );
  return normalizeDepartmentReport(response.data.data);
}

/**
 * GET /reports/export - Export report payload
 */
export async function exportReport(
  filters: ExportReportFilters
): Promise<ReportExportResponse> {
  const response = await client.get<ApiResponse<ReportExportResponse>>(
    endpoints.reports.export,
    { params: filters }
  );
  return normalizeExportReport(response.data.data);
}

// =====================
// REPORT TEMPLATES
// =====================

/**
 * GET /report-templates - List all report templates
 */
export async function listReportTemplates(
  filters?: TemplateFilters
): Promise<ReportTemplatesListResponse> {
  const response = await client.get<ApiResponse<ReportTemplatesListResponse>>(
    endpoints.reportTemplates.list,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /report-templates/:id - Get report template details
 */
export async function getReportTemplate(id: string): Promise<ReportTemplate> {
  const response = await client.get<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.byId(id)
  );
  return response.data.data;
}

/**
 * POST /report-templates - Create report template
 */
export async function createReportTemplate(
  payload: CreateReportTemplatePayload
): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.create,
    payload
  );
  return response.data.data;
}

/**
 * PATCH /report-templates/:id - Update report template
 */
export async function updateReportTemplate(
  id: string,
  payload: UpdateReportTemplatePayload
): Promise<ReportTemplate> {
  const response = await client.patch<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.update(id),
    payload
  );
  return response.data.data;
}

/**
 * DELETE /report-templates/:id - Delete report template
 */
export async function deleteReportTemplate(id: string): Promise<void> {
  await client.delete(endpoints.reportTemplates.delete(id));
}

/**
 * POST /report-templates/:id/set-default - Set template as default
 */
export async function setAsDefaultTemplate(id: string): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.setDefault(id)
  );
  return response.data.data;
}

/**
 * POST /report-templates/:id/toggle-shared - Toggle template shared status
 */
export async function toggleSharedTemplate(id: string): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.toggleShared(id)
  );
  return response.data.data;
}
