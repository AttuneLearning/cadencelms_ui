/**
 * Mock report and report template data for testing
 */

import type {
  Report,
  ReportTemplate,
  CreateReportPayload,
  CreateReportTemplatePayload,
  ReportsListResponse,
  ReportTemplatesListResponse,
} from '@/entities/report/model/types';

// Mock Report Templates
export const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'template-1',
    name: 'Monthly Enrollment Summary',
    description: 'Default template for monthly enrollment reports',
    type: 'enrollment',
    defaultFilters: {
      dateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
    },
    columns: ['studentName', 'enrollmentDate', 'program', 'status'],
    isDefault: true,
    isShared: true,
    createdBy: 'user-1',
    createdByName: 'John Doe',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
  {
    id: 'template-2',
    name: 'Course Completion Report',
    description: 'Track course completion rates',
    type: 'completion',
    defaultFilters: {
      completionStatus: ['completed'],
    },
    columns: ['studentName', 'courseName', 'completionDate', 'grade'],
    isDefault: false,
    isShared: true,
    createdBy: 'user-2',
    createdByName: 'Jane Smith',
    createdAt: '2025-12-15T14:30:00Z',
    updatedAt: '2025-12-15T14:30:00Z',
  },
  {
    id: 'template-3',
    name: 'Performance Analytics',
    description: 'Detailed performance metrics by course',
    type: 'performance',
    defaultFilters: {
      minGrade: 0,
      maxGrade: 100,
    },
    columns: ['courseName', 'avgGrade', 'passRate', 'totalStudents'],
    isDefault: false,
    isShared: false,
    createdBy: 'user-1',
    createdByName: 'John Doe',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'template-4',
    name: 'Attendance Tracker',
    description: 'Student attendance tracking',
    type: 'attendance',
    defaultFilters: {
      dateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
    },
    columns: ['studentName', 'courseName', 'attendanceRate', 'absences'],
    isDefault: true,
    isShared: true,
    createdBy: 'user-3',
    createdByName: 'Admin User',
    createdAt: '2025-11-20T08:00:00Z',
    updatedAt: '2026-01-03T08:00:00Z',
  },
];

// Mock Reports
export const mockReports: Report[] = [
  {
    id: 'report-1',
    name: 'Q1 2026 Enrollment Report',
    description: 'Quarterly enrollment statistics',
    type: 'enrollment',
    status: 'ready',
    filters: {
      dateRange: {
        start: '2026-01-01',
        end: '2026-03-31',
      },
      programs: ['prog-1'],
    },
    createdBy: 'user-1',
    createdByName: 'John Doe',
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-08T10:05:00Z',
    generatedAt: '2026-01-08T10:05:00Z',
    fileUrl: '/reports/report-1.pdf',
    rowCount: 150,
  },
  {
    id: 'report-2',
    name: 'Class Performance Summary',
    type: 'performance',
    status: 'generating',
    filters: {
      courses: ['course-1', 'course-2'],
    },
    createdBy: 'user-2',
    createdByName: 'Jane Smith',
    createdAt: '2026-01-09T14:30:00Z',
    updatedAt: '2026-01-09T14:30:00Z',
  },
  {
    id: 'report-3',
    name: 'Attendance Report - Math 101',
    type: 'attendance',
    status: 'ready',
    filters: {
      courses: ['course-1'],
      dateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
    },
    createdBy: 'user-1',
    createdByName: 'John Doe',
    createdAt: '2026-01-07T09:15:00Z',
    updatedAt: '2026-01-07T09:20:00Z',
    generatedAt: '2026-01-07T09:20:00Z',
    fileUrl: '/reports/report-3.xlsx',
    rowCount: 45,
  },
  {
    id: 'report-4',
    name: 'Student Progress Overview',
    type: 'completion',
    status: 'failed',
    filters: {
      programs: ['prog-1', 'prog-2'],
    },
    createdBy: 'user-3',
    createdByName: 'Admin User',
    createdAt: '2026-01-05T16:45:00Z',
    updatedAt: '2026-01-05T16:45:00Z',
    error: 'Database connection timeout',
  },
  {
    id: 'report-5',
    name: 'Pending Report',
    type: 'enrollment',
    status: 'pending',
    filters: {},
    createdBy: 'user-1',
    createdByName: 'John Doe',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
];

// Mock API Response
export const mockTemplatesListResponse: ReportTemplatesListResponse = {
  templates: mockReportTemplates,
  pagination: {
    page: 1,
    limit: 20,
    total: mockReportTemplates.length,
    totalPages: 1,
  },
};

export const mockReportsListResponse: ReportsListResponse = {
  reports: mockReports,
  pagination: {
    page: 1,
    limit: 20,
    total: mockReports.length,
    totalPages: 1,
  },
};

// Single report instances for specific test cases
export const mockReadyReport = mockReports[0];
export const mockGeneratingReport = mockReports[1];
export const mockFailedReport = mockReports[3];
export const mockPendingReport = mockReports[4];

// Mock form data
export const mockCreateTemplatePayload: CreateReportTemplatePayload = {
  name: 'New Test Template',
  description: 'A test template for unit tests',
  type: 'enrollment',
  defaultFilters: {
    dateRange: {
      start: '2026-01-01',
      end: '2026-01-31',
    },
  },
  columns: ['studentName', 'enrollmentDate', 'program'],
  isDefault: false,
  isShared: false,
};

export const mockCreateReportPayload: CreateReportPayload = {
  name: 'Test Report',
  description: 'A test report',
  type: 'enrollment',
  filters: {
    dateRange: {
      start: '2026-01-01',
      end: '2026-01-31',
    },
    programs: ['prog-1'],
  },
  templateId: 'template-1',
};

// Factory functions
export const createMockTemplate = (overrides?: Partial<ReportTemplate>): ReportTemplate => ({
  id: `template-${Date.now()}`,
  name: `Test Template ${Date.now()}`,
  description: 'Test description',
  type: 'enrollment',
  defaultFilters: {},
  columns: ['col1', 'col2'],
  isDefault: false,
  isShared: false,
  createdBy: 'user-1',
  createdByName: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockReport = (overrides?: Partial<Report>): Report => ({
  id: `report-${Date.now()}`,
  name: `Test Report ${Date.now()}`,
  type: 'enrollment',
  status: 'ready',
  filters: {},
  createdBy: 'user-1',
  createdByName: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  fileUrl: '/reports/test.pdf',
  rowCount: 100,
  ...overrides,
});

export const createMockReportListItem = (overrides?: Partial<Report>): Report => ({
  id: `report-${Date.now()}`,
  name: `Test Report ${Date.now()}`,
  type: 'enrollment',
  status: 'ready',
  filters: {},
  createdBy: 'user-1',
  createdByName: 'Test User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  generatedAt: new Date().toISOString(),
  fileUrl: '/reports/test.pdf',
  rowCount: 100,
  ...overrides,
});
