/**
 * Report Template Hooks Tests
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  useReportTemplates,
  useMyTemplates,
  useSystemTemplates,
  useReportTemplate,
  useReportTemplateBySlug,
  useTemplateVersions,
  useCreateReportTemplate,
  useUpdateReportTemplate,
  useDeleteReportTemplate,
  useDuplicateReportTemplate,
  usePublishTemplateVersion,
} from '../useReportTemplates';
import type { ReportTemplate } from '../../model/types';

// Mock data
const mockTemplate: ReportTemplate = {
  _id: 'template-123',
  organizationId: 'org-456',
  name: 'Test Template',
  slug: 'test-template',
  category: 'enrollment',
  tags: ['monthly'],
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
  createdBy: 'user-123',
  createdAt: '2026-01-15T00:00:00Z',
  updatedAt: '2026-01-15T00:00:00Z',
};

// MSW server
const server = setupServer(
  http.get('http://localhost:3000/api/v2/reports/templates', () => {
    return HttpResponse.json({
      success: true,
      data: { templates: [mockTemplate], totalCount: 1, page: 1, limit: 20, totalPages: 1 },
    });
  }),
  http.get('http://localhost:3000/api/v2/reports/templates/my', () => {
    return HttpResponse.json({ success: true, data: { templates: [mockTemplate] } });
  }),
  http.get('http://localhost:3000/api/v2/reports/templates/system', () => {
    return HttpResponse.json({
      success: true,
      data: { templates: [{ ...mockTemplate, isSystemTemplate: true }] },
    });
  }),
  http.get('http://localhost:3000/api/v2/reports/templates/:id', () => {
    return HttpResponse.json({ success: true, data: { template: mockTemplate } });
  }),
  http.get('http://localhost:3000/api/v2/reports/templates/slug/:slug', () => {
    return HttpResponse.json({ success: true, data: { template: mockTemplate } });
  }),
  http.get('http://localhost:3000/api/v2/reports/templates/:id/versions', () => {
    return HttpResponse.json({
      success: true,
      data: { versions: [mockTemplate, { ...mockTemplate, version: 2 }] },
    });
  }),
  http.post('http://localhost:3000/api/v2/reports/templates', () => {
    return HttpResponse.json({ success: true, data: { template: mockTemplate } });
  }),
  http.put('http://localhost:3000/api/v2/reports/templates/:id', () => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, name: 'Updated' } },
    });
  }),
  http.delete('http://localhost:3000/api/v2/reports/templates/:id', () => {
    return HttpResponse.json({ success: true, data: null });
  }),
  http.post('http://localhost:3000/api/v2/reports/templates/:id/duplicate', () => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, _id: 'template-456', name: 'Copy' } },
    });
  }),
  http.post('http://localhost:3000/api/v2/reports/templates/:id/versions', () => {
    return HttpResponse.json({
      success: true,
      data: { template: { ...mockTemplate, version: 2 } },
    });
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

describe('Report Template Hooks', () => {
  describe('useReportTemplates', () => {
    it('should fetch list of templates', async () => {
      const { result } = renderHook(() => useReportTemplates(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.templates).toHaveLength(1);
      expect(result.current.data?.templates[0]._id).toBe('template-123');
    });
  });

  describe('useMyTemplates', () => {
    it('should fetch user personal templates', async () => {
      const { result } = renderHook(() => useMyTemplates(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].name).toBe('Test Template');
    });
  });

  describe('useSystemTemplates', () => {
    it('should fetch system templates', async () => {
      const { result } = renderHook(() => useSystemTemplates(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0].isSystemTemplate).toBe(true);
    });
  });

  describe('useReportTemplate', () => {
    it('should fetch a single template', async () => {
      const { result } = renderHook(() => useReportTemplate('template-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('template-123');
      expect(result.current.data?.name).toBe('Test Template');
    });
  });

  describe('useReportTemplateBySlug', () => {
    it('should fetch template by slug', async () => {
      const { result } = renderHook(() => useReportTemplateBySlug('test-template'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.slug).toBe('test-template');
    });
  });

  describe('useTemplateVersions', () => {
    it('should fetch template versions', async () => {
      const { result } = renderHook(() => useTemplateVersions('template-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[1].version).toBe(2);
    });
  });

  describe('useCreateReportTemplate', () => {
    it('should create a new template', async () => {
      const { result } = renderHook(() => useCreateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'Test Template',
        type: 'predefined',
        predefinedType: 'enrollment-summary',
        visibility: 'organization',
        category: 'enrollment',
        tags: ['monthly'],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('template-123');
    });
  });

  describe('useUpdateReportTemplate', () => {
    it('should update a template', async () => {
      const { result } = renderHook(() => useUpdateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'template-123', request: { name: 'Updated' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('Updated');
    });
  });

  describe('useDeleteReportTemplate', () => {
    it('should delete a template', async () => {
      const { result } = renderHook(() => useDeleteReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('template-123');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useDuplicateReportTemplate', () => {
    it('should duplicate a template', async () => {
      const { result } = renderHook(() => useDuplicateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'template-123', name: 'Copy' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?._id).toBe('template-456');
      expect(result.current.data?.name).toBe('Copy');
    });
  });

  describe('usePublishTemplateVersion', () => {
    it('should publish a new version', async () => {
      const { result } = renderHook(() => usePublishTemplateVersion(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'template-123', request: { name: 'Updated' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.version).toBe(2);
    });
  });
});
