/**
 * Report Template Types Tests
 */

import { describe, it, expect } from 'vitest';
import type {
  ReportTemplate,
  CreateReportTemplateRequest,
  ListReportTemplatesParams,
} from '../types';

describe('Report Template Types', () => {
  describe('ReportTemplate', () => {
    it('should have correct structure for a complete template', () => {
      const mockTemplate: ReportTemplate = {
        _id: 'template-123',
        organizationId: 'org-456',
        name: 'Enrollment Summary Template',
        slug: 'enrollment-summary',
        category: 'enrollment',
        tags: ['monthly', 'department'],
        reportType: 'enrollment-summary',
        definition: {
          dimensions: [],
          measures: [],
          slicers: [],
          groups: [],
        },
        version: 1,
        isLatest: true,
        visibility: 'organization',
        isSystemTemplate: true,
        isDeleted: false,
        usageCount: 42,
        createdBy: 'system',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      expect(mockTemplate._id).toBe('template-123');
      expect(mockTemplate.name).toBe('Enrollment Summary Template');
      expect(mockTemplate.isSystemTemplate).toBe(true);
      expect(mockTemplate.usageCount).toBe(42);
    });
  });

  describe('CreateReportTemplateRequest', () => {
    it('should have correct structure for creating a template', () => {
      const request: CreateReportTemplateRequest = {
        name: 'Custom Performance Template',
        description: 'Monthly performance report template',
        type: 'predefined',
        predefinedType: 'performance-analysis',
        defaultOutputFormat: 'excel',
        visibility: 'department',
        tags: ['performance', 'monthly'],
        category: 'analytics',
      };

      expect(request.name).toBe('Custom Performance Template');
      expect(request.type).toBe('predefined');
      expect(request.defaultOutputFormat).toBe('excel');
    });
  });

  describe('ListReportTemplatesParams', () => {
    it('should allow filtering by various criteria', () => {
      const params: ListReportTemplatesParams = {
        type: 'predefined',
        visibility: 'system',
        category: 'enrollment',
        tags: ['monthly'],
        search: 'enrollment',
        sort: 'usageCount',
        page: 1,
        limit: 20,
      };

      expect(params.type).toBe('predefined');
      expect(params.visibility).toBe('system');
      expect(params.tags).toContain('monthly');
    });
  });
});
