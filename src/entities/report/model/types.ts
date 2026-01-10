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
