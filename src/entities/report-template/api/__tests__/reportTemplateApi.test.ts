/**
 * Report Template API Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as reportTemplateApi from '../reportTemplateApi';
import type { ReportTemplate, CreateReportTemplateRequest } from '../../model/types';

// Mock data
const mockTemplate: ReportTemplate = {
  _id: 'template-123',
  organizationId: 'org-456',
  name: 'Enrollment Summary Template',
  slug: 'enrollment-summary',
  category: 'enrollment',
  tags: ['monthly', 'department'],
  reportType: 'enrollment-summary',
  definition: {
    dimensions: [{ type: 'learner' }],
    measures: [{ type: 'count' }],
    slicers: [],
    groups: [],
  },
  version: 1,
  isLatest: true,
  visibility: 'organization',
  isSystemTemplate: false,
  isDeleted: false,
  usageCount: 0,
  createdBy: 'user-789',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

// MSW server setup
const server = setupServer(
  http.post('http://localhost:3000/api/v2/reports/templates', () => {
    return HttpResponse.json({
      success: true,
      data: { template: mockTemplate },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/templates', () => {
    return HttpResponse.json({
      success: true,
      data: {
        templates: [mockTemplate],
        totalCount: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/templates/my', () => {
    return HttpResponse.json({
      success: true,
      data: { templates: [mockTemplate] },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/templates/system', () => {
    return HttpResponse.json({
      success: true,
      data: { templates: [{ ...mockTemplate, isSystemTemplate: true }] },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/templates/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, _id: params.id as string } },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/templates/slug/:slug', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, slug: params.slug as string } },
    });
  }),

  http.put('http://localhost:3000/api/v2/reports/templates/:id', () => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, name: 'Updated Template' } },
    });
  }),

  http.delete('http://localhost:3000/api/v2/reports/templates/:id', () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  http.post('http://localhost:3000/api/v2/reports/templates/:id/duplicate', () => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, _id: 'template-456', name: 'Copy of Template' } },
    });
  }),

  http.post('http://localhost:3000/api/v2/reports/templates/:id/versions', () => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, version: 2 } },
    });
  }),

  http.get('http://localhost:3000/api/v2/reports/templates/:id/versions', () => {
    return HttpResponse.json({
      success: true,
      data: { versions: [mockTemplate, { ...mockTemplate, version: 2 }] },
    });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('reportTemplateApi', () => {
  describe('createReportTemplate', () => {
    it('should create a new report template', async () => {
      const request: CreateReportTemplateRequest = {
        name: 'Enrollment Summary Template',
        type: 'predefined',
        predefinedType: 'enrollment-summary',
        visibility: 'organization',
        category: 'enrollment',
        tags: ['monthly', 'department'],
      };

      const result = await reportTemplateApi.createReportTemplate(request);

      expect(result._id).toBe('template-123');
      expect(result.name).toBe('Enrollment Summary Template');
      expect(result.reportType).toBe('enrollment-summary');
    });
  });

  describe('listReportTemplates', () => {
    it('should list report templates', async () => {
      const result = await reportTemplateApi.listReportTemplates();

      expect(result.templates).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it('should list templates with filters', async () => {
      const result = await reportTemplateApi.listReportTemplates({
        category: 'enrollment',
        page: 1,
        limit: 20,
      });

      expect(result.templates).toHaveLength(1);
      expect(result.templates[0].category).toBe('enrollment');
    });
  });

  describe('getMyTemplates', () => {
    it('should get user personal templates', async () => {
      const result = await reportTemplateApi.getMyTemplates();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Enrollment Summary Template');
    });
  });

  describe('getSystemTemplates', () => {
    it('should get system templates', async () => {
      const result = await reportTemplateApi.getSystemTemplates();

      expect(result).toHaveLength(1);
      expect(result[0].isSystemTemplate).toBe(true);
    });
  });

  describe('getReportTemplate', () => {
    it('should get a specific template by ID', async () => {
      const result = await reportTemplateApi.getReportTemplate('template-123');

      expect(result._id).toBe('template-123');
      expect(result.reportType).toBe('enrollment-summary');
    });
  });

  describe('getReportTemplateBySlug', () => {
    it('should get a template by slug', async () => {
      const result = await reportTemplateApi.getReportTemplateBySlug('enrollment-summary');

      expect(result.slug).toBe('enrollment-summary');
    });
  });

  describe('updateReportTemplate', () => {
    it('should update a template', async () => {
      const result = await reportTemplateApi.updateReportTemplate('template-123', {
        name: 'Updated Template',
      });

      expect(result.name).toBe('Updated Template');
    });
  });

  describe('deleteReportTemplate', () => {
    it('should delete a template', async () => {
      await expect(
        reportTemplateApi.deleteReportTemplate('template-123')
      ).resolves.toBeUndefined();
    });
  });

  describe('duplicateReportTemplate', () => {
    it('should duplicate a template', async () => {
      const result = await reportTemplateApi.duplicateReportTemplate('template-123');

      expect(result._id).toBe('template-456');
      expect(result.name).toBe('Copy of Template');
    });

    it('should duplicate a template with custom name', async () => {
      const result = await reportTemplateApi.duplicateReportTemplate(
        'template-123',
        'Custom Copy'
      );

      expect(result._id).toBe('template-456');
    });
  });

  describe('publishTemplateVersion', () => {
    it('should publish a new version', async () => {
      const result = await reportTemplateApi.publishTemplateVersion('template-123', {
        name: 'Updated Template',
      });

      expect(result.version).toBe(2);
    });
  });

  describe('getTemplateVersions', () => {
    it('should get template version history', async () => {
      const result = await reportTemplateApi.getTemplateVersions('template-123');

      expect(result).toHaveLength(2);
      expect(result[1].version).toBe(2);
    });
  });
});
