/**
 * Report Schedule Hooks Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useReportSchedules,
  useReportSchedule,
  useScheduleHistory,
  useCreateReportSchedule,
  useUpdateReportSchedule,
  useDeleteReportSchedule,
  useActivateReportSchedule,
  useDeactivateReportSchedule,
  useTriggerReportSchedule,
} from '../useReportSchedules';
import type { ReportSchedule } from '../../model/types';

// Mock data
const mockSchedule: ReportSchedule = {
  _id: 'schedule-123',
  organizationId: 'org-456',
  name: 'Test Schedule',
  reportType: 'enrollment-summary',
  definition: {
    dimensions: [{ type: 'learner' }],
    measures: [{ type: 'count' }],
    slicers: [],
    groups: [],
  },
  schedule: {
    frequency: 'weekly',
    timezone: 'America/New_York',
    dayOfWeek: 1,
    time: '09:00',
  },
  outputFormat: 'excel',
  delivery: {
    email: {
      recipients: ['admin@example.com'],
      subject: 'Weekly Report',
      attachReport: true,
    },
  },
  isActive: true,
  consecutiveFailures: 0,
  maxConsecutiveFailures: 3,
  visibility: 'department',
  createdBy: 'user-123',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

// MSW server
const server = setupServer(
  http.get('http://localhost:3000/api/v2/reports/schedules', () => {
    return HttpResponse.json({
      success: true,
      data: { schedules: [mockSchedule], totalCount: 1, page: 1, limit: 20, totalPages: 1 },
    });
  }),
  http.get('http://localhost:3000/api/v2/reports/schedules/:id', () => {
    return HttpResponse.json({ success: true, data: { schedule: mockSchedule } });
  }),
  http.get('http://localhost:3000/api/v2/reports/schedules/:id/history', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobs: [
          { jobId: 'job-1', triggeredAt: '2026-01-08T09:00:00Z', status: 'ready' },
          { jobId: 'job-2', triggeredAt: '2026-01-15T09:00:00Z', status: 'processing' },
        ],
      },
    });
  }),
  http.post('http://localhost:3000/api/v2/reports/schedules', () => {
    return HttpResponse.json({ success: true, data: { schedule: mockSchedule } });
  }),
  http.put('http://localhost:3000/api/v2/reports/schedules/:id', () => {
    return HttpResponse.json({
      success: true,
      data: { schedule: { ...mockSchedule, name: 'Updated' } },
    });
  }),
  http.delete('http://localhost:3000/api/v2/reports/schedules/:id', () => {
    return HttpResponse.json({ success: true, data: null });
  }),
  http.post('http://localhost:3000/api/v2/reports/schedules/:id/activate', () => {
    return HttpResponse.json({
      success: true,
      data: { schedule: { ...mockSchedule, isActive: true } },
    });
  }),
  http.post('http://localhost:3000/api/v2/reports/schedules/:id/deactivate', () => {
    return HttpResponse.json({
      success: true,
      data: { schedule: { ...mockSchedule, isActive: false } },
    });
  }),
  http.post('http://localhost:3000/api/v2/reports/schedules/:id/trigger', () => {
    return HttpResponse.json({ success: true, data: { jobId: 'job-456' } });
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

describe('Report Schedule Hooks', () => {
  describe('useReportSchedules', () => {
    it('should fetch list of schedules', async () => {
      const { result } = renderHook(() => useReportSchedules(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.schedules).toHaveLength(1);
      expect(result.current.data?.schedules[0]._id).toBe('schedule-123');
    });
  });

  describe('useReportSchedule', () => {
    it('should fetch a single schedule', async () => {
      const { result } = renderHook(() => useReportSchedule('schedule-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('schedule-123');
      expect(result.current.data?.name).toBe('Test Schedule');
    });
  });

  describe('useScheduleHistory', () => {
    it('should fetch schedule execution history', async () => {
      const { result } = renderHook(() => useScheduleHistory('schedule-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.jobs).toHaveLength(2);
      expect(result.current.data?.jobs[0].jobId).toBe('job-1');
    });
  });

  describe('useCreateReportSchedule', () => {
    it('should create a new schedule', async () => {
      const { result } = renderHook(() => useCreateReportSchedule(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'Test Schedule',
        reportType: 'enrollment-summary',
        definition: {
          dimensions: [{ type: 'learner' }],
          measures: [{ type: 'count' }],
          slicers: [],
          groups: [],
        },
        schedule: {
          frequency: 'weekly',
          timezone: 'America/New_York',
          dayOfWeek: 1,
          time: '09:00',
        },
        outputFormat: 'excel',
        delivery: {
          email: {
            recipients: ['admin@example.com'],
            attachReport: true,
          },
        },
        visibility: 'department',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('schedule-123');
    });
  });

  describe('useUpdateReportSchedule', () => {
    it('should update a schedule', async () => {
      const { result } = renderHook(() => useUpdateReportSchedule(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'schedule-123', request: { name: 'Updated' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('Updated');
    });
  });

  describe('useDeleteReportSchedule', () => {
    it('should delete a schedule', async () => {
      const { result } = renderHook(() => useDeleteReportSchedule(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('schedule-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useActivateReportSchedule', () => {
    it('should activate a schedule', async () => {
      const { result } = renderHook(() => useActivateReportSchedule(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('schedule-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.isActive).toBe(true);
    });
  });

  describe('useDeactivateReportSchedule', () => {
    it('should deactivate a schedule', async () => {
      const { result } = renderHook(() => useDeactivateReportSchedule(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('schedule-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.isActive).toBe(false);
    });
  });

  describe('useTriggerReportSchedule', () => {
    it('should trigger a schedule immediately', async () => {
      const { result } = renderHook(() => useTriggerReportSchedule(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('schedule-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.jobId).toBe('job-456');
    });
  });
});
