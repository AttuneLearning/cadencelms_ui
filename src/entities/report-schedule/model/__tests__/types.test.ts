/**
 * Report Schedule Types Tests
 */

import { describe, it, expect } from 'vitest';
import type {
  ReportSchedule,
  ScheduleFrequency,
  CreateReportScheduleRequest,
  ListReportSchedulesParams,
} from '../types';

describe('Report Schedule Types', () => {
  describe('ScheduleFrequency', () => {
    it('should have all valid frequency types', () => {
      const validFrequencies: ScheduleFrequency[] = [
        'once',
        'daily',
        'weekly',
        'biweekly',
        'monthly',
        'quarterly',
        'yearly',
      ];

      validFrequencies.forEach((frequency) => {
        expect(typeof frequency).toBe('string');
      });
    });
  });

  describe('ReportSchedule', () => {
    it('should have correct structure for a complete schedule', () => {
      const mockSchedule: ReportSchedule = {
        _id: 'schedule-123',
        organizationId: 'org-456',
        name: 'Weekly Enrollment Report',
        reportType: 'enrollment-summary',
        definition: {
          dimensions: [],
          measures: [],
          slicers: [],
          groups: [],
        },
        schedule: {
          frequency: 'weekly',
          timezone: 'America/New_York',
          dayOfWeek: 1, // Monday
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

      expect(mockSchedule._id).toBe('schedule-123');
      expect(mockSchedule.schedule.frequency).toBe('weekly');
      expect(mockSchedule.isActive).toBe(true);
      expect(mockSchedule.delivery.email?.recipients).toContain('admin@example.com');
    });
  });

  describe('CreateReportScheduleRequest', () => {
    it('should have correct structure for creating a daily schedule', () => {
      const request: CreateReportScheduleRequest = {
        name: 'Daily Performance Report',
        reportType: 'performance-analysis',
        definition: {
          dimensions: [{ type: 'learner' }],
          measures: [{ type: 'average-score' }],
          slicers: [],
          groups: [],
        },
        schedule: {
          frequency: 'daily',
          timezone: 'UTC',
          time: '00:00',
        },
        outputFormat: 'pdf',
        delivery: {
          email: {
            recipients: ['reports@example.com'],
            attachReport: true,
          },
        },
        visibility: 'private',
      };

      expect(request.name).toBe('Daily Performance Report');
      expect(request.schedule.frequency).toBe('daily');
      expect(request.outputFormat).toBe('pdf');
    });
  });

  describe('ListReportSchedulesParams', () => {
    it('should allow filtering schedules', () => {
      const params: ListReportSchedulesParams = {
        isActive: true,
        search: 'enrollment',
        sort: '-createdAt',
        page: 1,
        limit: 20,
      };

      expect(params.isActive).toBe(true);
      expect(params.search).toBe('enrollment');
    });
  });
});
