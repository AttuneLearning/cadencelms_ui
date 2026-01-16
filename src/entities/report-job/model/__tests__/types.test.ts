/**
 * Report Job Types Tests
 */

import { describe, it, expect } from 'vitest';
import type {
  ReportJob,
  ReportJobState,
  ReportJobPriority,
  CreateReportJobRequest,
  ListReportJobsParams,
} from '../types';

describe('Report Job Types', () => {
  describe('ReportJobState', () => {
    it('should have all valid job states', () => {
      const validStates: ReportJobState[] = [
        'pending',
        'queued',
        'processing',
        'rendering',
        'uploading',
        'ready',
        'downloaded',
        'failed',
        'cancelled',
        'expired',
      ];

      // Type-level assertion - if this compiles, all states are valid
      validStates.forEach((state) => {
        expect(typeof state).toBe('string');
      });
    });
  });

  describe('ReportJobPriority', () => {
    it('should have all valid priority levels', () => {
      const validPriorities: ReportJobPriority[] = [
        'low',
        'normal',
        'high',
        'urgent',
        'critical',
        'scheduled',
      ];

      validPriorities.forEach((priority) => {
        expect(typeof priority).toBe('string');
      });
    });
  });

  describe('ReportJob', () => {
    it('should have correct structure for a complete job', () => {
      const mockJob: ReportJob = {
        _id: 'job-123',
        organizationId: 'org-456',
        reportType: 'enrollment-summary',
        name: 'Test Report',
        state: 'ready',
        priority: 'normal',
        definition: {
          dimensions: [],
          measures: [],
          slicers: [],
          groups: [],
        },
        filters: [],
        dateRange: {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
        },
        outputFormat: 'pdf',
        visibility: 'private',
        createdBy: 'user-789',
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z',
      };

      expect(mockJob._id).toBe('job-123');
      expect(mockJob.state).toBe('ready');
      expect(mockJob.priority).toBe('normal');
      expect(mockJob.outputFormat).toBe('pdf');
    });
  });

  describe('CreateReportJobRequest', () => {
    it('should have correct structure for creating a predefined report', () => {
      const request: CreateReportJobRequest = {
        name: 'Monthly Enrollment Report',
        type: 'predefined',
        predefinedType: 'enrollment-summary',
        outputFormat: 'excel',
        priority: 'normal',
      };

      expect(request.name).toBe('Monthly Enrollment Report');
      expect(request.type).toBe('predefined');
      expect(request.predefinedType).toBe('enrollment-summary');
    });

    it('should have correct structure for creating a custom report', () => {
      const request: CreateReportJobRequest = {
        name: 'Custom Performance Analysis',
        type: 'custom',
        customDefinition: {
          dimensions: [{ type: 'learner' }],
          measures: [{ type: 'average-score' }],
          slicers: [],
          groups: [],
        },
        outputFormat: 'pdf',
        filters: [],
      };

      expect(request.name).toBe('Custom Performance Analysis');
      expect(request.type).toBe('custom');
      expect(request.customDefinition).toBeDefined();
    });
  });

  describe('ListReportJobsParams', () => {
    it('should allow filtering by status', () => {
      const params: ListReportJobsParams = {
        status: ['ready', 'processing'],
        page: 1,
        limit: 20,
      };

      expect(params.status).toHaveLength(2);
      expect(params.status?.[0]).toBe('ready');
    });

    it('should allow searching and sorting', () => {
      const params: ListReportJobsParams = {
        search: 'enrollment',
        sort: '-createdAt',
        page: 1,
        limit: 50,
      };

      expect(params.search).toBe('enrollment');
      expect(params.sort).toBe('-createdAt');
    });
  });
});
