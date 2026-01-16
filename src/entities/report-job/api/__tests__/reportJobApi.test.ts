/**
 * Report Job API Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as reportJobApi from '../reportJobApi';
import type {
  ReportJob,
  CreateReportJobRequest,
  ListReportJobsParams,
} from '../../model/types';

// Mock data
const mockReportJob: ReportJob = {
  _id: 'job-123',
  organizationId: 'org-456',
  reportType: 'enrollment-summary',
  name: 'Q1 Enrollment Report',
  state: 'ready',
  priority: 'normal',
  definition: {
    dimensions: [{ type: 'learner' }],
    measures: [{ type: 'count' }],
    slicers: [],
    groups: [],
  },
  filters: [],
  dateRange: {
    start: '2026-01-01',
    end: '2026-03-31',
  },
  outputFormat: 'pdf',
  visibility: 'private',
  createdBy: 'user-789',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

// MSW server setup
const server = setupServer(
  http.post('http://localhost:3000/api/v2/reports/jobs', () => {
    return HttpResponse.json({
      success: true,
      data: { job: mockReportJob },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/jobs', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobs: [mockReportJob],
        totalCount: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/jobs/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { job: { ...mockReportJob, _id: params.id as string } },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/jobs/:id/status', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobId: 'job-123',
        state: 'ready',
        progress: 100,
        message: 'Report ready for download',
      },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/jobs/:id/download', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobId: 'job-123',
        downloadUrl: 'https://storage.example.com/reports/job-123.pdf',
        fileName: 'Q1_Enrollment_Report.pdf',
        fileSize: 1024000,
        expiresAt: '2026-01-22T00:00:00Z',
      },
    });
  }),

  http.post('http://localhost:3000/api/v2/reports/jobs/:id/cancel', () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  http.post('http://localhost:3000/api/v2/reports/jobs/:id/retry', () => {
    return HttpResponse.json({
      success: true,
      data: { job: { ...mockReportJob, state: 'pending' } },
    });
  }),

  http.delete('http://localhost:3000/api/v2/reports/jobs/:id', () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  http.post('http://localhost:3000/api/v2/reports/jobs/bulk-delete', () => {
    return HttpResponse.json({ success: true, data: null });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('reportJobApi', () => {
  describe('createReportJob', () => {
    it('should create a new report job', async () => {
      const request: CreateReportJobRequest = {
        type: 'predefined',
        predefinedType: 'enrollment-summary',
        name: 'Q1 Enrollment Report',
        dateRange: {
          start: '2026-01-01',
          end: '2026-03-31',
        },
        outputFormat: 'pdf',
        visibility: 'private',
      };

      const result = await reportJobApi.createReportJob(request);

      expect(result._id).toBe('job-123');
      expect(result.reportType).toBe('enrollment-summary');
      expect(result.name).toBe('Q1 Enrollment Report');
    });
  });

  describe('listReportJobs', () => {
    it('should list report jobs without params', async () => {
      const result = await reportJobApi.listReportJobs();

      expect(result.jobs).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should list report jobs with params', async () => {
      const params: ListReportJobsParams = {
        state: ['ready'],
        page: 1,
        limit: 20,
      };

      const result = await reportJobApi.listReportJobs(params);

      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].state).toBe('ready');
    });
  });

  describe('getReportJob', () => {
    it('should get a specific report job', async () => {
      const result = await reportJobApi.getReportJob('job-123');

      expect(result._id).toBe('job-123');
      expect(result.reportType).toBe('enrollment-summary');
    });
  });

  describe('getReportJobStatus', () => {
    it('should get report job status', async () => {
      const result = await reportJobApi.getReportJobStatus('job-123');

      expect(result.jobId).toBe('job-123');
      expect(result.state).toBe('ready');
      expect(result.progress).toBe(100);
    });
  });

  describe('getReportJobDownload', () => {
    it('should get report job download information', async () => {
      const result = await reportJobApi.getReportJobDownload('job-123');

      expect(result.jobId).toBe('job-123');
      expect(result.downloadUrl).toContain('storage.example.com');
      expect(result.fileName).toBe('Q1_Enrollment_Report.pdf');
    });
  });

  describe('cancelReportJob', () => {
    it('should cancel a report job', async () => {
      await expect(reportJobApi.cancelReportJob('job-123')).resolves.toBeUndefined();
    });
  });

  describe('retryReportJob', () => {
    it('should retry a failed report job', async () => {
      const result = await reportJobApi.retryReportJob('job-123');

      expect(result._id).toBe('job-123');
      expect(result.state).toBe('pending');
    });
  });

  describe('deleteReportJob', () => {
    it('should delete a report job', async () => {
      await expect(reportJobApi.deleteReportJob('job-123')).resolves.toBeUndefined();
    });
  });

  describe('bulkDeleteReportJobs', () => {
    it('should bulk delete report jobs', async () => {
      await expect(
        reportJobApi.bulkDeleteReportJobs(['job-1', 'job-2', 'job-3'])
      ).resolves.toBeUndefined();
    });
  });
});
