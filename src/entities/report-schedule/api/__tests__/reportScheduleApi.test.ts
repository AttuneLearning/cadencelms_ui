/**
 * Report Schedule API Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as reportScheduleApi from '../reportScheduleApi';
import type { ReportSchedule, CreateReportScheduleRequest } from '../../model/types';

// Mock data
const mockSchedule: ReportSchedule = {
  _id: 'schedule-123',
  organizationId: 'org-456',
  name: 'Weekly Enrollment Report',
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
      subject: 'Weekly Enrollment Report',
      attachReport: true,
    },
  },
  isActive: true,
  consecutiveFailures: 0,
  maxConsecutiveFailures: 3,
  visibility: 'department',
  createdBy: 'user-789',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

// MSW server setup
const server = setupServer(
  http.post('http://localhost:3000/api/v2/reports/schedules', () => {
    return HttpResponse.json({
      success: true,
      data: { schedule: mockSchedule },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/schedules', () => {
    return HttpResponse.json({
      success: true,
      data: {
        schedules: [mockSchedule],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/schedules/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { schedule: { ...mockSchedule, _id: params.id as string } },
    });
  }),

  http.put('http://localhost:3000/api/v2/reports/schedules/:id', () => {
    return HttpResponse.json({
      success: true,
      data: { schedule: { ...mockSchedule, name: 'Updated Schedule' } },
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
    return HttpResponse.json({
      success: true,
      data: { jobId: 'job-456' },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/schedules/:id/history', () => {
    return HttpResponse.json({
      success: true,
      data: {
        jobs: [
          {
            jobId: 'job-123',
            triggeredAt: '2026-01-08T09:00:00Z',
            status: 'ready',
          },
          {
            jobId: 'job-456',
            triggeredAt: '2026-01-15T09:00:00Z',
            status: 'processing',
          },
        ],
      },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('reportScheduleApi', () => {
  describe('createReportSchedule', () => {
    it('should create a new report schedule', async () => {
      const request: CreateReportScheduleRequest = {
        name: 'Weekly Enrollment Report',
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
      };

      const result = await reportScheduleApi.createReportSchedule(request);

      expect(result._id).toBe('schedule-123');
      expect(result.name).toBe('Weekly Enrollment Report');
      expect(result.schedule.frequency).toBe('weekly');
    });
  });

  describe('listReportSchedules', () => {
    it('should list report schedules', async () => {
      const result = await reportScheduleApi.listReportSchedules();

      expect(result.schedules).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should list schedules with filters', async () => {
      const result = await reportScheduleApi.listReportSchedules({
        isActive: true,
        page: 1,
        limit: 20,
      });

      expect(result.schedules).toHaveLength(1);
      expect(result.schedules[0].isActive).toBe(true);
    });
  });

  describe('getReportSchedule', () => {
    it('should get a specific schedule', async () => {
      const result = await reportScheduleApi.getReportSchedule('schedule-123');

      expect(result._id).toBe('schedule-123');
      expect(result.reportType).toBe('enrollment-summary');
    });
  });

  describe('updateReportSchedule', () => {
    it('should update a schedule', async () => {
      const result = await reportScheduleApi.updateReportSchedule('schedule-123', {
        name: 'Updated Schedule',
      });

      expect(result.name).toBe('Updated Schedule');
    });
  });

  describe('deleteReportSchedule', () => {
    it('should delete a schedule', async () => {
      await expect(
        reportScheduleApi.deleteReportSchedule('schedule-123')
      ).resolves.toBeUndefined();
    });
  });

  describe('activateReportSchedule', () => {
    it('should activate a schedule', async () => {
      const result = await reportScheduleApi.activateReportSchedule('schedule-123');

      expect(result.isActive).toBe(true);
    });
  });

  describe('deactivateReportSchedule', () => {
    it('should deactivate a schedule', async () => {
      const result = await reportScheduleApi.deactivateReportSchedule('schedule-123');

      expect(result.isActive).toBe(false);
    });
  });

  describe('triggerReportSchedule', () => {
    it('should trigger a schedule to run immediately', async () => {
      const result = await reportScheduleApi.triggerReportSchedule('schedule-123');

      expect(result.jobId).toBe('job-456');
    });
  });

  describe('getScheduleHistory', () => {
    it('should get schedule execution history', async () => {
      const result = await reportScheduleApi.getScheduleHistory('schedule-123');

      expect(result.jobs).toHaveLength(2);
      expect(result.jobs[0].jobId).toBe('job-123');
      expect(result.jobs[0].status).toBe('ready');
    });

    it('should get paginated schedule history', async () => {
      const result = await reportScheduleApi.getScheduleHistory('schedule-123', {
        page: 1,
        limit: 10,
      });

      expect(result.jobs).toHaveLength(2);
    });
  });
});
