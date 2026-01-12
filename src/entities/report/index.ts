/**
 * Report Entity - Barrel Export
 * Public API for the report entity
 */

// Types
export type {
  ReportType,
  ReportStatus,
  ExportFormat,
  ReportFilter,
  Report,
  ReportTemplate,
  CreateReportPayload,
  CreateReportTemplatePayload,
  UpdateReportTemplatePayload,
  ReportFilters,
  TemplateFilters,
  ReportsListResponse,
  ReportTemplatesListResponse,
  GenerateReportResponse,
  DownloadReportResponse,
} from './model/types';

// API Functions
export {
  listReports,
  getReport,
  createReport,
  deleteReport,
  downloadReport,
  listReportTemplates,
  getReportTemplate,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
} from './api/reportApi';

// React Query Hooks
export {
  useReports,
  useReport,
  useCreateReport,
  useDeleteReport,
  useDownloadReport,
  useReportTemplates,
  useReportTemplate,
  useCreateReportTemplate,
  useUpdateReportTemplate,
  useDeleteReportTemplate,
} from './hooks/useReports';

// Query Keys
export { reportKeys } from './model/reportKeys';
