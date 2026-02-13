export type ReportType =
  | 'enrollment'
  | 'completion'
  | 'performance'
  | 'attendance'
  | 'learner-activity'
  | 'course-analytics'
  | 'custom';

export type ReportStatus = 'pending' | 'generating' | 'ready' | 'failed';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  programs?: string[];
  courses?: string[];
  departments?: string[];
  learners?: string[];
  staff?: string[];
  academicYears?: string[];
  completionStatus?: ('completed' | 'in-progress' | 'not-started')[];
  minGrade?: number;
  maxGrade?: number;
}

export interface CanonicalCourseContext {
  courseId: string;
  courseCode: string;
  courseName: string;
  courseVersionId?: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  filters: ReportFilter;
  status: ReportStatus;
  fileUrl?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  generatedAt?: string;
  expiresAt?: string;
  rowCount?: number;
  error?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  defaultFilters: ReportFilter;
  columns: string[];
  isDefault: boolean;
  isShared: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportPayload {
  name: string;
  description?: string;
  type: ReportType;
  filters: ReportFilter;
  templateId?: string;
}

export interface CreateReportTemplatePayload {
  name: string;
  description: string;
  type: ReportType;
  defaultFilters: ReportFilter;
  columns: string[];
  isDefault?: boolean;
  isShared?: boolean;
}

export interface UpdateReportTemplatePayload {
  name?: string;
  description?: string;
  defaultFilters?: ReportFilter;
  columns?: string[];
  isDefault?: boolean;
  isShared?: boolean;
}

export interface ReportFilters {
  type?: ReportType;
  status?: ReportStatus;
  createdBy?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface TemplateFilters {
  type?: ReportType;
  isDefault?: boolean;
  isShared?: boolean;
  createdBy?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ReportsListResponse {
  reports: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportTemplatesListResponse {
  templates: ReportTemplate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GenerateReportResponse {
  report: Report;
  message: string;
}

export interface DownloadReportResponse {
  url: string;
}

export interface CompletionReportFilters {
  programId?: string;
  courseId?: string;
  classId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'withdrawn';
  learnerId?: string;
  groupBy?: 'program' | 'course' | 'department' | 'status' | 'month';
  includeDetails?: boolean;
  page?: number;
  limit?: number;
}

export interface PerformanceReportFilters {
  programId?: string;
  courseId?: string;
  classId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  learnerId?: string;
  minScore?: number;
  includeRankings?: boolean;
  page?: number;
  limit?: number;
}

export interface TranscriptFilters {
  programId?: string;
  includeInProgress?: boolean;
}

export interface CourseReportFilters {
  classId?: string;
  startDate?: string;
  endDate?: string;
  includeModules?: boolean;
}

export interface ProgramReportFilters {
  academicYearId?: string;
  startDate?: string;
  endDate?: string;
}

export interface DepartmentReportFilters {
  startDate?: string;
  endDate?: string;
  includeSubDepartments?: boolean;
}

export type ReportExportType =
  | 'completion'
  | 'performance'
  | 'course'
  | 'program'
  | 'department';

export type ReportExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json';

export interface ExportReportFilters {
  reportType: ReportExportType;
  format: ReportExportFormat;
  programId?: string;
  courseId?: string;
  classId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  learnerId?: string;
  includeDetails?: boolean;
}

export interface CompletionReportDetail extends CanonicalCourseContext {
  [key: string]: unknown;
}

export interface CompletionReportGroup {
  details: CompletionReportDetail[];
  [key: string]: unknown;
}

export interface CompletionReportResponse {
  summary: Record<string, unknown>;
  groups: CompletionReportGroup[];
  filters: Record<string, unknown>;
  pagination: Record<string, unknown>;
}

export interface PerformanceCourseMetric extends CanonicalCourseContext {
  [key: string]: unknown;
}

export interface PerformanceMetric {
  coursePerformance: PerformanceCourseMetric[];
  [key: string]: unknown;
}

export interface PerformanceReportResponse {
  summary: Record<string, unknown>;
  performanceMetrics: PerformanceMetric[];
  analytics: Record<string, unknown>;
  filters: Record<string, unknown>;
  pagination: Record<string, unknown>;
}

export interface TranscriptCourse extends CanonicalCourseContext {
  [key: string]: unknown;
}

export interface TranscriptProgram {
  courses: TranscriptCourse[];
  [key: string]: unknown;
}

export interface LearnerTranscript {
  programs: TranscriptProgram[];
  [key: string]: unknown;
}

export interface LearnerTranscriptResponse {
  transcript: LearnerTranscript;
}

export interface CourseReportModuleProgress {
  moduleId: string;
  moduleName: string;
  moduleOrder?: number;
  [key: string]: unknown;
}

export interface CourseReportLearner {
  moduleProgress: CourseReportModuleProgress[];
  [key: string]: unknown;
}

export interface CourseReportModuleAnalytics {
  moduleId: string;
  moduleName: string;
  moduleOrder?: number;
  [key: string]: unknown;
}

export interface CourseReportCourse extends CanonicalCourseContext {
  [key: string]: unknown;
}

export interface CourseReportResponse {
  course: CourseReportCourse;
  summary: Record<string, unknown>;
  learners: CourseReportLearner[];
  moduleAnalytics: CourseReportModuleAnalytics[];
  generatedAt?: string;
  [key: string]: unknown;
}

export interface ProgramCoursePerformance extends CanonicalCourseContext {
  [key: string]: unknown;
}

export interface ProgramReportResponse {
  program: Record<string, unknown>;
  summary: Record<string, unknown>;
  coursePerformance: ProgramCoursePerformance[];
  [key: string]: unknown;
}

export interface DepartmentCoursePerformance extends CanonicalCourseContext {
  [key: string]: unknown;
}

export interface DepartmentReportResponse {
  department: Record<string, unknown>;
  summary: Record<string, unknown>;
  coursePerformance: DepartmentCoursePerformance[];
  [key: string]: unknown;
}

export interface ReportExportResponse {
  reportType: string;
  format: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  recordCount?: number;
  generatedAt?: string;
  expiresAt?: string;
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}
