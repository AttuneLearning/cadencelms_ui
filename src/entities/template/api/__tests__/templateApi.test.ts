/**
 * Tests for Template API Client
 * Tests all 7 template management endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  previewTemplate,
} from '../templateApi';
import type { TemplatesListResponse } from '../../model/types';
import {
  mockTemplateListItems,
  mockMasterTemplate,
  mockDepartmentTemplate,
  mockCustomTemplate,
  mockDraftTemplate,
  mockCreateMasterTemplatePayload,
  mockCreateDepartmentTemplatePayload,
  mockCreateCustomTemplatePayload,
  mockUpdateTemplatePayload,
  mockDuplicateMasterPayload,
  mockDuplicateCustomPayload,
  mockDuplicateTemplateResponse,
  mockDeleteTemplateResponse,
  mockDeleteWithReplacementResponse,
  mockForceDeleteResponse,
  mockPreviewDataJSON,
  mockPreviewHTML,
  createMockTemplate,
} from '@/test/mocks/data/templates';

describe('templateApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // LIST TEMPLATES
  // =====================

  describe('listTemplates', () => {
    it('should fetch paginated list of templates without filters', async () => {
      const mockResponse: TemplatesListResponse = {
        templates: mockTemplateListItems,
        pagination: {
          page: 1,
          limit: 20,
          total: mockTemplateListItems.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates();

      expect(result).toEqual(mockResponse);
      expect(result.templates).toHaveLength(mockTemplateListItems.length);
    });

    it('should fetch templates with pagination params', async () => {
      const mockResponse: TemplatesListResponse = {
        templates: mockTemplateListItems.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockTemplateListItems.length,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/templates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ page: 1, limit: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should filter templates by type - master', async () => {
      const filteredTemplates = mockTemplateListItems.filter((t) => t.type === 'master');

      const mockResponse: TemplatesListResponse = {
        templates: filteredTemplates,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTemplates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ type: 'master' });

      expect(result.templates).toHaveLength(filteredTemplates.length);
      expect(result.templates.every((t) => t.type === 'master')).toBe(true);
    });

    it('should filter templates by type - department', async () => {
      const filteredTemplates = mockTemplateListItems.filter((t) => t.type === 'department');

      const mockResponse: TemplatesListResponse = {
        templates: filteredTemplates,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTemplates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ type: 'department' });

      expect(result.templates).toHaveLength(filteredTemplates.length);
      expect(result.templates.every((t) => t.type === 'department')).toBe(true);
    });

    it('should filter templates by type - custom', async () => {
      const filteredTemplates = mockTemplateListItems.filter((t) => t.type === 'custom');

      const mockResponse: TemplatesListResponse = {
        templates: filteredTemplates,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTemplates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ type: 'custom' });

      expect(result.templates).toHaveLength(filteredTemplates.length);
      expect(result.templates.every((t) => t.type === 'custom')).toBe(true);
    });

    it('should filter templates by department', async () => {
      const filteredTemplates = mockTemplateListItems.filter((t) => t.department === 'dept-1');

      const mockResponse: TemplatesListResponse = {
        templates: filteredTemplates,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTemplates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ department: 'dept-1' });

      expect(result.templates.every((t) => t.department === 'dept-1')).toBe(true);
    });

    it('should filter templates by status - active', async () => {
      const filteredTemplates = mockTemplateListItems.filter((t) => t.status === 'active');

      const mockResponse: TemplatesListResponse = {
        templates: filteredTemplates,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTemplates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ status: 'active' });

      expect(result.templates.every((t) => t.status === 'active')).toBe(true);
    });

    it('should filter templates by status - draft', async () => {
      const filteredTemplates = mockTemplateListItems.filter((t) => t.status === 'draft');

      const mockResponse: TemplatesListResponse = {
        templates: filteredTemplates,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTemplates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ status: 'draft' });

      expect(result.templates.every((t) => t.status === 'draft')).toBe(true);
    });

    it('should search templates by name', async () => {
      const searchTerm = 'Master';
      const filteredTemplates = mockTemplateListItems.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const mockResponse: TemplatesListResponse = {
        templates: filteredTemplates,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTemplates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listTemplates({ search: searchTerm });

      expect(result.templates.length).toBeGreaterThan(0);
    });

    it('should handle error response', async () => {
      server.use(
        http.get(`${baseUrl}/templates`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Failed to fetch templates',
            },
            { status: 500 }
          );
        })
      );

      await expect(listTemplates()).rejects.toThrow();
    });
  });

  // =====================
  // GET TEMPLATE
  // =====================

  describe('getTemplate', () => {
    it('should fetch master template by id', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockMasterTemplate,
          });
        })
      );

      const result = await getTemplate(mockMasterTemplate.id);

      expect(result).toEqual(mockMasterTemplate);
      expect(result.type).toBe('master');
      expect(result.isGlobal).toBe(true);
      expect(result.css).toBeTruthy();
      expect(result.html).toBeTruthy();
    });

    it('should fetch department template by id', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockDepartmentTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDepartmentTemplate,
          });
        })
      );

      const result = await getTemplate(mockDepartmentTemplate.id);

      expect(result).toEqual(mockDepartmentTemplate);
      expect(result.type).toBe('department');
      expect(result.department).toBe('dept-1');
      expect(result.departmentName).toBe('Computer Science');
    });

    it('should fetch custom template by id', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockCustomTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockCustomTemplate,
          });
        })
      );

      const result = await getTemplate(mockCustomTemplate.id);

      expect(result).toEqual(mockCustomTemplate);
      expect(result.type).toBe('custom');
      expect(result.department).toBeNull();
      expect(result.isGlobal).toBe(false);
    });

    it('should include usage information', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockMasterTemplate,
          });
        })
      );

      const result = await getTemplate(mockMasterTemplate.id);

      expect(result.usageCount).toBe(45);
      expect(result.usedByCourses).toBeDefined();
      expect(result.usedByCourses!.length).toBeGreaterThan(0);
    });

    it('should normalize canonical usedByCourses rows with version metadata', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockMasterTemplate,
              usedByCourses: [
                {
                  id: 'canonical-course-1',
                  code: 'CBT101',
                  title: 'CBT Introduction',
                  versionId: 'course-version-1',
                  version: 2,
                  versionStatus: 'published',
                },
              ],
            },
          });
        })
      );

      const result = await getTemplate(mockMasterTemplate.id);

      expect(result.usedByCourses).toEqual([
        {
          id: 'canonical-course-1',
          code: 'CBT101',
          title: 'CBT Introduction',
          versionId: 'course-version-1',
          version: 2,
          versionStatus: 'published',
        },
      ]);
    });

    it('should normalize legacy mixed usedByCourses row keys during rollout', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockMasterTemplate,
              usedByCourses: [
                {
                  courseId: 'canonical-course-2',
                  courseCode: 'CBT201',
                  courseTitle: 'Advanced CBT',
                  courseVersionId: 'course-version-2',
                  version: '3',
                  courseVersionStatus: 'draft',
                },
              ],
            },
          });
        })
      );

      const result = await getTemplate(mockMasterTemplate.id);

      expect(result.usedByCourses).toEqual([
        {
          id: 'canonical-course-2',
          code: 'CBT201',
          title: 'Advanced CBT',
          versionId: 'course-version-2',
          version: 3,
          versionStatus: 'draft',
        },
      ]);
    });

    it('should fallback title to course code when canonical row title is missing', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockMasterTemplate,
              usedByCourses: [
                {
                  id: 'canonical-course-3',
                  code: 'CBT301',
                },
              ],
            },
          });
        })
      );

      const result = await getTemplate(mockMasterTemplate.id);

      expect(result.usedByCourses).toEqual([
        {
          id: 'canonical-course-3',
          code: 'CBT301',
          title: 'CBT301',
        },
      ]);
    });

    it('should handle template not found error', async () => {
      server.use(
        http.get(`${baseUrl}/templates/non-existent-id`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(getTemplate('non-existent-id')).rejects.toThrow();
    });
  });

  // =====================
  // CREATE TEMPLATE
  // =====================

  describe('createTemplate', () => {
    it('should create master template', async () => {
      const newTemplate = createMockTemplate({
        ...mockCreateMasterTemplatePayload,
        type: 'master',
        isGlobal: true,
      });

      server.use(
        http.post(`${baseUrl}/templates`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(mockCreateMasterTemplatePayload);

          return HttpResponse.json({
            success: true,
            data: newTemplate,
          });
        })
      );

      const result = await createTemplate(mockCreateMasterTemplatePayload);

      expect(result.type).toBe('master');
      expect(result.isGlobal).toBe(true);
      expect(result.department).toBeNull();
    });

    it('should create department template', async () => {
      const newTemplate = createMockTemplate({
        ...mockCreateDepartmentTemplatePayload,
        type: 'department',
        department: 'dept-1',
        departmentName: 'Computer Science',
      });

      server.use(
        http.post(`${baseUrl}/templates`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(mockCreateDepartmentTemplatePayload);

          return HttpResponse.json({
            success: true,
            data: newTemplate,
          });
        })
      );

      const result = await createTemplate(mockCreateDepartmentTemplatePayload);

      expect(result.type).toBe('department');
      expect(result.department).toBe('dept-1');
      expect(result.departmentName).toBeTruthy();
    });

    it('should create custom template', async () => {
      const newTemplate = createMockTemplate({
        ...mockCreateCustomTemplatePayload,
        type: 'custom',
      });

      server.use(
        http.post(`${baseUrl}/templates`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(mockCreateCustomTemplatePayload);

          return HttpResponse.json({
            success: true,
            data: newTemplate,
          });
        })
      );

      const result = await createTemplate(mockCreateCustomTemplatePayload);

      expect(result.type).toBe('custom');
      expect(result.department).toBeNull();
      expect(result.isGlobal).toBe(false);
    });

    it('should create template with draft status', async () => {
      const draftPayload = {
        ...mockCreateCustomTemplatePayload,
        status: 'draft' as const,
      };

      const newTemplate = createMockTemplate({
        ...draftPayload,
        status: 'draft',
      });

      server.use(
        http.post(`${baseUrl}/templates`, () => {
          return HttpResponse.json({
            success: true,
            data: newTemplate,
          });
        })
      );

      const result = await createTemplate(draftPayload);

      expect(result.status).toBe('draft');
    });

    it('should handle validation error', async () => {
      server.use(
        http.post(`${baseUrl}/templates`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation error: name is required',
            },
            { status: 400 }
          );
        })
      );

      const invalidPayload = { ...mockCreateCustomTemplatePayload, name: '' };
      await expect(createTemplate(invalidPayload)).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE TEMPLATE
  // =====================

  describe('updateTemplate', () => {
    it('should update template name', async () => {
      const updatedTemplate = createMockTemplate({
        ...mockCustomTemplate,
        name: mockUpdateTemplatePayload.name!,
      });

      server.use(
        http.put(`${baseUrl}/templates/${mockCustomTemplate.id}`, async ({ request }) => {
          const body = await request.json() as Record<string, unknown> | null;
          if (body && 'name' in body) {
            expect(body.name).toBe(mockUpdateTemplatePayload.name);
          }

          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const result = await updateTemplate(mockCustomTemplate.id, {
        name: mockUpdateTemplatePayload.name,
      });

      expect(result.name).toBe(mockUpdateTemplatePayload.name);
    });

    it('should update template CSS', async () => {
      const updatedTemplate = createMockTemplate({
        ...mockCustomTemplate,
        css: mockUpdateTemplatePayload.css!,
      });

      server.use(
        http.put(`${baseUrl}/templates/${mockCustomTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const result = await updateTemplate(mockCustomTemplate.id, {
        css: mockUpdateTemplatePayload.css,
      });

      expect(result.css).toBe(mockUpdateTemplatePayload.css);
    });

    it('should update template HTML', async () => {
      const updatedTemplate = createMockTemplate({
        ...mockCustomTemplate,
        html: mockUpdateTemplatePayload.html!,
      });

      server.use(
        http.put(`${baseUrl}/templates/${mockCustomTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const result = await updateTemplate(mockCustomTemplate.id, {
        html: mockUpdateTemplatePayload.html,
      });

      expect(result.html).toBe(mockUpdateTemplatePayload.html);
    });

    it('should update template status', async () => {
      const updatedTemplate = createMockTemplate({
        ...mockDraftTemplate,
        status: 'active',
      });

      server.use(
        http.put(`${baseUrl}/templates/${mockDraftTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const result = await updateTemplate(mockDraftTemplate.id, {
        status: 'active',
      });

      expect(result.status).toBe('active');
    });

    it('should update master template global setting', async () => {
      const updatedTemplate = createMockTemplate({
        ...mockMasterTemplate,
        isGlobal: false,
      });

      server.use(
        http.put(`${baseUrl}/templates/${mockMasterTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const result = await updateTemplate(mockMasterTemplate.id, {
        isGlobal: false,
      });

      expect(result.isGlobal).toBe(false);
    });

    it('should update multiple fields at once', async () => {
      const updatedTemplate = createMockTemplate({
        ...mockCustomTemplate,
        ...mockUpdateTemplatePayload,
      });

      server.use(
        http.put(`${baseUrl}/templates/${mockCustomTemplate.id}`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(mockUpdateTemplatePayload);

          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const result = await updateTemplate(mockCustomTemplate.id, mockUpdateTemplatePayload);

      expect(result.name).toBe(mockUpdateTemplatePayload.name);
      expect(result.css).toBe(mockUpdateTemplatePayload.css);
      expect(result.html).toBe(mockUpdateTemplatePayload.html);
      expect(result.status).toBe(mockUpdateTemplatePayload.status);
    });

    it('should handle template not found error', async () => {
      server.use(
        http.put(`${baseUrl}/templates/non-existent-id`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(
        updateTemplate('non-existent-id', mockUpdateTemplatePayload)
      ).rejects.toThrow();
    });
  });

  // =====================
  // DELETE TEMPLATE
  // =====================

  describe('deleteTemplate', () => {
    it('should delete template without usage', async () => {
      server.use(
        http.delete(`${baseUrl}/templates/${mockDraftTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDeleteTemplateResponse,
          });
        })
      );

      const result = await deleteTemplate(mockDraftTemplate.id);

      expect(result.deletedId).toBe(mockDraftTemplate.id);
      expect(result.affectedCourses).toBe(0);
      expect(result.replacedWith).toBeNull();
    });

    it('should delete template with replacement', async () => {
      server.use(
        http.delete(`${baseUrl}/templates/${mockDepartmentTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDeleteWithReplacementResponse,
          });
        })
      );

      const result = await deleteTemplate(mockDepartmentTemplate.id);

      expect(result.deletedId).toBe(mockDepartmentTemplate.id);
      expect(result.affectedCourses).toBe(23);
      expect(result.replacedWith).toBe('template-1');
    });

    it('should force delete template in use', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.delete(`${baseUrl}/templates/${mockCustomTemplate.id}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockForceDeleteResponse,
          });
        })
      );

      const result = await deleteTemplate(mockCustomTemplate.id, true);

      expect(capturedParams!.get('force')).toBe('true');
      expect(result.deletedId).toBe(mockCustomTemplate.id);
      expect(result.affectedCourses).toBe(5);
      expect(result.replacedWith).toBeNull();
    });

    it('should normalize delete response aliases for affected and replacement fields', async () => {
      server.use(
        http.delete(`${baseUrl}/templates/${mockDepartmentTemplate.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              id: mockDepartmentTemplate.id,
              affectedCourseCount: '12',
              replacementTemplateId: 'template-1',
            },
          });
        })
      );

      const result = await deleteTemplate(mockDepartmentTemplate.id, true);

      expect(result).toEqual({
        deletedId: mockDepartmentTemplate.id,
        affectedCourses: 12,
        replacedWith: 'template-1',
      });
    });

    it('should handle delete error for template in use without force', async () => {
      server.use(
        http.delete(`${baseUrl}/templates/${mockMasterTemplate.id}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete template in use by 45 courses',
            },
            { status: 400 }
          );
        })
      );

      await expect(deleteTemplate(mockMasterTemplate.id, false)).rejects.toThrow();
    });

    it('should handle template not found error', async () => {
      server.use(
        http.delete(`${baseUrl}/templates/non-existent-id`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(deleteTemplate('non-existent-id')).rejects.toThrow();
    });
  });

  // =====================
  // DUPLICATE TEMPLATE
  // =====================

  describe('duplicateTemplate', () => {
    it('should duplicate master template as department template', async () => {
      server.use(
        http.post(
          `${baseUrl}/templates/${mockMasterTemplate.id}/duplicate`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual(mockDuplicateMasterPayload);

            return HttpResponse.json({
              success: true,
              data: mockDuplicateTemplateResponse,
            });
          }
        )
      );

      const result = await duplicateTemplate(
        mockMasterTemplate.id,
        mockDuplicateMasterPayload
      );

      expect(result.duplicatedFrom).toBe(mockMasterTemplate.id);
      expect(result.name).toBe(mockDuplicateMasterPayload.name);
      expect(result.type).toBe('department');
      expect(result.department).toBe('dept-1');
      expect(result.usageCount).toBe(0);
    });

    it('should duplicate custom template with same type', async () => {
      const duplicatedTemplate = createMockTemplate({
        ...mockCustomTemplate,
        id: 'template-7',
        name: mockDuplicateCustomPayload.name!,
        status: 'draft',
        usageCount: 0,
      });

      server.use(
        http.post(
          `${baseUrl}/templates/${mockCustomTemplate.id}/duplicate`,
          async ({ request }) => {
            const body = await request.json();
            expect(body).toEqual(mockDuplicateCustomPayload);

            return HttpResponse.json({
              success: true,
              data: {
                ...duplicatedTemplate,
                duplicatedFrom: mockCustomTemplate.id,
              },
            });
          }
        )
      );

      const result = await duplicateTemplate(
        mockCustomTemplate.id,
        mockDuplicateCustomPayload
      );

      expect(result.duplicatedFrom).toBe(mockCustomTemplate.id);
      expect(result.name).toBe(mockDuplicateCustomPayload.name);
      expect(result.type).toBe('custom');
    });

    it('should duplicate with default name if not provided', async () => {
      const duplicatedTemplate = createMockTemplate({
        ...mockCustomTemplate,
        id: 'template-8',
        name: `${mockCustomTemplate.name} (Copy)`,
        usageCount: 0,
      });

      server.use(
        http.post(`${baseUrl}/templates/${mockCustomTemplate.id}/duplicate`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...duplicatedTemplate,
              duplicatedFrom: mockCustomTemplate.id,
            },
          });
        })
      );

      const result = await duplicateTemplate(mockCustomTemplate.id, {});

      expect(result.duplicatedFrom).toBe(mockCustomTemplate.id);
      expect(result.name).toContain('Copy');
    });

    it('should preserve CSS and HTML from original', async () => {
      server.use(
        http.post(`${baseUrl}/templates/${mockMasterTemplate.id}/duplicate`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDuplicateTemplateResponse,
          });
        })
      );

      const result = await duplicateTemplate(
        mockMasterTemplate.id,
        mockDuplicateMasterPayload
      );

      expect(result.css).toBeTruthy();
      expect(result.html).toBeTruthy();
    });

    it('should handle template not found error', async () => {
      server.use(
        http.post(`${baseUrl}/templates/non-existent-id/duplicate`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(
        duplicateTemplate('non-existent-id', mockDuplicateCustomPayload)
      ).rejects.toThrow();
    });
  });

  // =====================
  // PREVIEW TEMPLATE
  // =====================

  describe('previewTemplate', () => {
    it('should preview template in JSON format', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}/preview`, () => {
          return HttpResponse.json({
            success: true,
            data: mockPreviewDataJSON,
          });
        })
      );

      const result = await previewTemplate(mockMasterTemplate.id, { format: 'json' });

      expect(result).toEqual(mockPreviewDataJSON);
      expect(typeof result).toBe('object');
      expect((result as typeof mockPreviewDataJSON).html).toBeTruthy();
      expect((result as typeof mockPreviewDataJSON).css).toBeTruthy();
      expect((result as typeof mockPreviewDataJSON).metadata).toBeDefined();
    });

    it('should preview template in HTML format', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}/preview`, () => {
          return HttpResponse.text(mockPreviewHTML);
        })
      );

      const result = await previewTemplate(mockMasterTemplate.id, { format: 'html' });

      expect(typeof result).toBe('string');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html');
    });

    it('should preview with custom course title', async () => {
      const customTitle = 'Advanced Web Development';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}/preview`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: {
              ...mockPreviewDataJSON,
              metadata: {
                ...mockPreviewDataJSON.metadata,
                placeholders: {
                  ...mockPreviewDataJSON.metadata.placeholders,
                  courseTitle: customTitle,
                },
              },
            },
          });
        })
      );

      await previewTemplate(mockMasterTemplate.id, {
        courseTitle: customTitle,
        format: 'json',
      });

      expect(capturedParams!.get('courseTitle')).toBe(customTitle);
    });

    it('should preview with custom course code', async () => {
      const customCode = 'WEB401';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}/preview`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: {
              ...mockPreviewDataJSON,
              metadata: {
                ...mockPreviewDataJSON.metadata,
                placeholders: {
                  ...mockPreviewDataJSON.metadata.placeholders,
                  courseCode: customCode,
                },
              },
            },
          });
        })
      );

      await previewTemplate(mockMasterTemplate.id, {
        courseCode: customCode,
        format: 'json',
      });

      expect(capturedParams!.get('courseCode')).toBe(customCode);
    });

    it('should default to JSON format when format not specified', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}/preview`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockPreviewDataJSON,
          });
        })
      );

      const result = await previewTemplate(mockMasterTemplate.id);

      expect(capturedParams!.get('format')).toBe('json');
      expect(typeof result).toBe('object');
    });

    it('should include placeholder metadata in JSON preview', async () => {
      server.use(
        http.get(`${baseUrl}/templates/${mockMasterTemplate.id}/preview`, () => {
          return HttpResponse.json({
            success: true,
            data: mockPreviewDataJSON,
          });
        })
      );

      const result = await previewTemplate(mockMasterTemplate.id, { format: 'json' });

      const jsonResult = result as typeof mockPreviewDataJSON;
      expect(jsonResult.metadata.templateId).toBe('template-1');
      expect(jsonResult.metadata.templateName).toBeTruthy();
      expect(jsonResult.metadata.previewGenerated).toBeTruthy();
      expect(jsonResult.metadata.placeholders).toBeDefined();
      expect(jsonResult.metadata.placeholders.courseTitle).toBeTruthy();
      expect(jsonResult.metadata.placeholders.courseCode).toBeTruthy();
      expect(jsonResult.metadata.placeholders.instructorName).toBeTruthy();
      expect(jsonResult.metadata.placeholders.departmentName).toBeTruthy();
      expect(jsonResult.metadata.placeholders.content).toBeTruthy();
    });

    it('should handle template not found error', async () => {
      server.use(
        http.get(`${baseUrl}/templates/non-existent-id/preview`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(previewTemplate('non-existent-id')).rejects.toThrow();
    });
  });
});
