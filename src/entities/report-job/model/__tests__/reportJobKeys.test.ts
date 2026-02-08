/**
 * Report Job Query Keys Tests
 */

import { describe, it, expect } from 'vitest';
import { reportJobKeys } from '../reportJobKeys';
import type { ListReportJobsParams } from '../types';

describe('reportJobKeys', () => {
  describe('all', () => {
    it('should return base key array', () => {
      expect(reportJobKeys.all).toEqual(['report-jobs']);
    });
  });

  describe('lists', () => {
    it('should return list key array', () => {
      expect(reportJobKeys.lists()).toEqual(['report-jobs', 'list']);
    });
  });

  describe('list', () => {
    it('should return list key with empty params', () => {
      const params = {};
      expect(reportJobKeys.list(params)).toEqual(['report-jobs', 'list', params]);
    });

    it('should return list key with params', () => {
      const params: ListReportJobsParams = { status: ['ready'], page: 1, limit: 20 };
      expect(reportJobKeys.list(params)).toEqual(['report-jobs', 'list', params]);
    });
  });

  describe('details', () => {
    it('should return details key array', () => {
      expect(reportJobKeys.details()).toEqual(['report-jobs', 'detail']);
    });
  });

  describe('detail', () => {
    it('should return detail key for specific job', () => {
      const jobId = 'job-123';
      expect(reportJobKeys.detail(jobId)).toEqual(['report-jobs', 'detail', jobId]);
    });
  });

  describe('status', () => {
    it('should return status key for specific job', () => {
      const jobId = 'job-123';
      expect(reportJobKeys.status(jobId)).toEqual(['report-jobs', 'detail', jobId, 'status']);
    });
  });

  describe('download', () => {
    it('should return download key for specific job', () => {
      const jobId = 'job-123';
      expect(reportJobKeys.download(jobId)).toEqual([
        'report-jobs',
        'detail',
        jobId,
        'download',
      ]);
    });
  });

  describe('key hierarchy', () => {
    it('should maintain proper hierarchy for cache invalidation', () => {
      // All keys should start with base key
      expect(reportJobKeys.lists()[0]).toBe(reportJobKeys.all[0]);
      expect(reportJobKeys.details()[0]).toBe(reportJobKeys.all[0]);

      // Detail keys should include detail in hierarchy
      const jobId = 'test-job';
      const detailKey = reportJobKeys.detail(jobId);
      expect(detailKey[0]).toBe('report-jobs');
      expect(detailKey[1]).toBe('detail');
      expect(detailKey[2]).toBe(jobId);

      // Status keys should be under detail
      const statusKey = reportJobKeys.status(jobId);
      expect(statusKey.slice(0, 3)).toEqual(detailKey);
    });
  });
});
