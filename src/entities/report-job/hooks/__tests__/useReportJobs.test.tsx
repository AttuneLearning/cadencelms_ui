/**
 * Report Job Hooks Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useReportJobs,
  useReportJob,
  useReportJobStatus,
  useReportJobDownload,
  useCreateReportJob,
  useCancelReportJob,
  useRetryReportJob,
  useDeleteReportJob,
  useBulkDeleteReportJobs,
} from '../useReportJobs';
import type { ReportJob } from '../../model/types';

// Mock data
const mockJob: ReportJob = {
  _id: 'job-123',
  organizationId: 'org-456',
  reportType: 'enrollment-summary',
  name: 'Test Report',
  state: 'ready',
  priority: 'normal',
  definition: {
    dimensions: [{ type: 'learner' }],
    measures: [{ type: 'count' }],
    slicers: [],
    groups: [],
  },
  filters: [],
  dateRange: { start: '2026-01-01', end: '2026-01-31' },
  outputFormat: 'pdf',
  visibility: 'private',
  createdBy: 'user-123',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

// MSW server
const server = setupServer(
  http.get('http://localhost:3000/api/v2/reports/jobs', () => {
    return HttpResponse.json({
      success: true,
      data: { jobs: [mockJob], totalCount: 1, page: 1, limit: 20, totalPages: 1 },
    });
  }),
  http.get('http://localhost:3000/api/v2/reports/jobs/:id', () => {
    return HttpResponse.json({ success: true, data: { job: mockJob } });
  }),
  http.get('http://localhost:3000/api/v2/reports/jobs/:id/status', () => {
    return HttpResponse.json({
      success: true,
      data: { jobId: 'job-123', state: 'ready', progress: 100 },
    });
  }),
  http.get('http://localhost:3000/api/v2/reports/jobs/:id/download', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobId: 'job-123',
        downloadUrl: 'https://example.com/file.pdf',
        fileName: 'report.pdf',
        fileSize: 1024,
        expiresAt: '2026-01-22T00:00:00Z',
      },
    });
  }),
  http.post('http://localhost:3000/api/v2/reports/jobs', () => {
    return HttpResponse.json({ success: true, data: { job: mockJob } });
  }),
  http.post('http://localhost:3000/api/v2/reports/jobs/:id/cancel', () => {
    return HttpResponse.json({ success: true, data: null });
  }),
  http.post('http://localhost:3000/api/v2/reports/jobs/:id/retry', () => {
    return HttpResponse.json({ success: true, data: { job: { ...mockJob, state: 'pending' } } });
  }),
  http.delete('http://localhost:3000/api/v2/reports/jobs/:id', () => {
    return HttpResponse.json({ success: true, data: null });
  }),
  http.post('http://localhost:3000/api/v2/reports/jobs/bulk-delete', () => {
    return HttpResponse.json({ success: true, data: null });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test wrapper
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Report Job Hooks', () => {
  describe('useReportJobs', () => {
    it('should fetch list of report jobs', async () => {
      const { result } = renderHook(() => useReportJobs(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.jobs).toHaveLength(1);
      expect(result.current.data?.jobs[0]._id).toBe('job-123');
    });
  });

  describe('useReportJob', () => {
    it('should fetch a single report job', async () => {
      const { result } = renderHook(() => useReportJob('job-123'), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('job-123');
      expect(result.current.data?.name).toBe('Test Report');
    });
  });

  describe('useReportJobStatus', () => {
    it('should fetch job status', async () => {
      const { result } = renderHook(() => useReportJobStatus('job-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe('job-123');
      expect(result.current.data?.state).toBe('ready');
      expect(result.current.data?.progress).toBe(100);
    });
  });

  describe('useReportJobDownload', () => {
    it('should fetch download information', async () => {
      const { result } = renderHook(() => useReportJobDownload('job-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.downloadUrl).toBe('https://example.com/file.pdf');
      expect(result.current.data?.fileName).toBe('report.pdf');
    });
  });

  describe('useCreateReportJob', () => {
    it('should create a new report job', async () => {
      const { result } = renderHook(() => useCreateReportJob(), { wrapper: createWrapper() });

      result.current.mutate({
        type: 'predefined',
        predefinedType: 'enrollment-summary',
        name: 'Test Report',
        dateRange: { start: '2026-01-01', end: '2026-01-31' },
        outputFormat: 'pdf',
        visibility: 'private',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('job-123');
    });
  });

  describe('useCancelReportJob', () => {
    it('should cancel a report job', async () => {
      const { result } = renderHook(() => useCancelReportJob(), { wrapper: createWrapper() });

      result.current.mutate('job-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useRetryReportJob', () => {
    it('should retry a failed job', async () => {
      const { result } = renderHook(() => useRetryReportJob(), { wrapper: createWrapper() });

      result.current.mutate('job-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.state).toBe('pending');
    });
  });

  describe('useDeleteReportJob', () => {
    it('should delete a report job', async () => {
      const { result } = renderHook(() => useDeleteReportJob(), { wrapper: createWrapper() });

      result.current.mutate('job-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useBulkDeleteReportJobs', () => {
    it('should bulk delete report jobs', async () => {
      const { result } = renderHook(() => useBulkDeleteReportJobs(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(['job-1', 'job-2', 'job-3']);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
