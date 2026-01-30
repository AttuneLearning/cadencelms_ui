/**
 * Tests for Audit Log React Query Hooks
 * Tests all hooks with cache management and filters
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import { useAuditLogs } from '../useAuditLogs';
import { useAuditLog } from '../useAuditLog';
import { useExportAuditLogs } from '../useExportAuditLogs';
import type {
  AuditLog,
  AuditLogsListResponse,
  ExportAuditLogsResponse,
} from '../../model/types';

describe('Audit Log Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mock data
  const mockAuditLogs: AuditLog[] = [
    {
      id: 'audit-1',
      timestamp: '2024-01-10T10:00:00Z',
      userId: 'user-1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      action: 'create',
      entityType: 'course',
      entityId: 'course-1',
      entityName: 'Introduction to Programming',
      severity: 'info',
      ipAddress: '192.168.1.1',
      description: 'Created new course',
      changes: [
        {
          field: 'title',
          oldValue: null,
          newValue: 'Introduction to Programming',
        },
      ],
      metadata: {
        userAgent: 'Mozilla/5.0',
        sessionId: 'session-1',
      },
      createdAt: '2024-01-10T10:00:00Z',
    },
    {
      id: 'audit-2',
      timestamp: '2024-01-10T09:30:00Z',
      userId: 'user-1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      action: 'login',
      entityType: 'user',
      entityId: 'user-1',
      severity: 'info',
      ipAddress: '192.168.1.1',
      description: 'User logged in',
      metadata: {
        userAgent: 'Mozilla/5.0',
      },
      createdAt: '2024-01-10T09:30:00Z',
    },
  ];

  const mockListResponse: AuditLogsListResponse = {
    logs: mockAuditLogs,
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
  };

  // =====================
  // AUDIT LOGS LIST
  // =====================

  describe('useAuditLogs', () => {
    it('should fetch audit logs without filters', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListResponse,
          });
        })
      );

      const { result } = renderHook(() => useAuditLogs({}));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockListResponse);
      expect(result.current.data?.logs).toHaveLength(2);
    });

    it('should fetch audit logs with pagination', async () => {
      const paginatedResponse = {
        logs: [mockAuditLogs[0]],
        pagination: {
          page: 1,
          limit: 1,
          total: 2,
          totalPages: 2,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: paginatedResponse,
          });
        })
      );

      const { result } = renderHook(() => useAuditLogs({ page: 1, limit: 1 }));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.logs).toHaveLength(1);
      expect(result.current.data?.pagination.totalPages).toBe(2);
    });

    it('should filter by userId', async () => {
      const filteredResponse = {
        logs: mockAuditLogs.filter((log) => log.userId === 'user-1'),
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: filteredResponse,
          });
        })
      );

      const { result } = renderHook(() => useAuditLogs({ userId: 'user-1' }));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.logs).toHaveLength(2);
      expect(result.current.data?.logs.every((log) => log.userId === 'user-1')).toBe(true);
    });

    it('should filter by action types', async () => {
      const filteredResponse = {
        logs: [mockAuditLogs[0]],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: filteredResponse,
          });
        })
      );

      const { result } = renderHook(() => useAuditLogs({ action: ['create'] }));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.logs).toHaveLength(1);
      expect(result.current.data?.logs[0].action).toBe('create');
    });

    it('should filter by entityType', async () => {
      const filteredResponse = {
        logs: [mockAuditLogs[0]],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: filteredResponse,
          });
        })
      );

      const { result } = renderHook(() => useAuditLogs({ entityType: 'course' }));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.logs[0].entityType).toBe('course');
    });

    it('should filter by date range', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useAuditLogs({
          dateFrom: '2024-01-10T00:00:00Z',
          dateTo: '2024-01-10T23:59:59Z',
        })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.logs).toHaveLength(2);
    });

    it('should search audit logs', async () => {
      const searchResponse = {
        logs: [mockAuditLogs[0]],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: searchResponse,
          });
        })
      );

      const { result } = renderHook(() => useAuditLogs({ search: 'course' }));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.logs).toHaveLength(1);
    });

    it('should handle loading state', () => {
      const { result } = renderHook(() => useAuditLogs({}));

      expect(result.current.isPending).toBe(true);
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed to fetch audit logs' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useAuditLogs({}));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should disable query when specified', () => {
      const { result } = renderHook(() => useAuditLogs({}, { enabled: false }));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =====================
  // SINGLE AUDIT LOG
  // =====================

  describe('useAuditLog', () => {
    it('should fetch single audit log by id', async () => {
      const auditLog = mockAuditLogs[0];

      server.use(
        http.get(`${baseUrl}/audit-logs/${auditLog.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: auditLog,
          });
        })
      );

      const { result } = renderHook(() => useAuditLog(auditLog.id));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(auditLog);
      expect(result.current.data?.id).toBe(auditLog.id);
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useAuditLog(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should include changes in audit log', async () => {
      const auditLog = mockAuditLogs[0];

      server.use(
        http.get(`${baseUrl}/audit-logs/${auditLog.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: auditLog,
          });
        })
      );

      const { result } = renderHook(() => useAuditLog(auditLog.id));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.changes).toBeDefined();
      expect(result.current.data?.changes).toHaveLength(1);
    });

    it('should include metadata in audit log', async () => {
      const auditLog = mockAuditLogs[0];

      server.use(
        http.get(`${baseUrl}/audit-logs/${auditLog.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: auditLog,
          });
        })
      );

      const { result } = renderHook(() => useAuditLog(auditLog.id));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.metadata).toBeDefined();
      expect(result.current.data?.metadata?.userAgent).toBe('Mozilla/5.0');
    });

    it('should handle not found error', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs/non-existent`, () => {
          return HttpResponse.json(
            { success: false, message: 'Audit log not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useAuditLog('non-existent'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =====================
  // EXPORT AUDIT LOGS
  // =====================

  describe('useExportAuditLogs', () => {
    it('should export audit logs in CSV format', async () => {
      const mockResponse: ExportAuditLogsResponse = {
        url: 'https://example.com/exports/audit-logs-123.csv',
        expiresAt: '2024-01-10T12:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/audit-logs/export`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useExportAuditLogs());

      act(() => {
        result.current.mutate({ format: 'csv' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.url).toContain('.csv');
    });

    it('should export audit logs in Excel format', async () => {
      const mockResponse: ExportAuditLogsResponse = {
        url: 'https://example.com/exports/audit-logs-456.xlsx',
        expiresAt: '2024-01-10T12:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/audit-logs/export`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useExportAuditLogs());

      act(() => {
        result.current.mutate({ format: 'excel' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.url).toContain('.xlsx');
    });

    it('should export with filters', async () => {
      const mockResponse: ExportAuditLogsResponse = {
        url: 'https://example.com/exports/audit-logs-789.json',
        expiresAt: '2024-01-10T12:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/audit-logs/export`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useExportAuditLogs());

      act(() => {
        result.current.mutate({
          format: 'json',
          filters: { entityType: 'course', action: ['create'] },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should export with date range', async () => {
      const mockResponse: ExportAuditLogsResponse = {
        url: 'https://example.com/exports/audit-logs.csv',
        expiresAt: '2024-01-10T12:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/audit-logs/export`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useExportAuditLogs());

      act(() => {
        result.current.mutate({
          format: 'csv',
          dateRange: {
            start: '2024-01-01T00:00:00Z',
            end: '2024-01-31T23:59:59Z',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle export error', async () => {
      server.use(
        http.post(`${baseUrl}/audit-logs/export`, () => {
          return HttpResponse.json(
            { success: false, message: 'Export failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useExportAuditLogs());

      act(() => {
        result.current.mutate({ format: 'csv' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
