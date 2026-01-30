/**
 * Tests for Audit Log API Client
 * Tests all audit log management endpoints with comprehensive coverage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listAuditLogs,
  getAuditLog,
  exportAuditLogs,
} from '../auditLogApi';
import type {
  AuditLog,
  AuditLogsListResponse,
  ExportAuditLogsResponse,
  ActionType,
  SeverityLevel,
} from '../../model/types';

describe('auditLogApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
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
    {
      id: 'audit-3',
      timestamp: '2024-01-10T08:00:00Z',
      userId: 'user-2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      action: 'delete',
      entityType: 'enrollment',
      entityId: 'enroll-1',
      entityName: 'Student enrollment',
      severity: 'warning',
      ipAddress: '192.168.1.2',
      description: 'Deleted enrollment',
      changes: [
        {
          field: 'status',
          oldValue: 'active',
          newValue: 'deleted',
        },
      ],
      metadata: {
        userAgent: 'Mozilla/5.0',
      },
      createdAt: '2024-01-10T08:00:00Z',
    },
  ];

  const mockListResponse: AuditLogsListResponse = {
    logs: mockAuditLogs,
    pagination: {
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1,
    },
  };

  // =====================
  // LIST AUDIT LOGS
  // =====================

  describe('listAuditLogs', () => {
    it('should fetch audit logs without filters', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListResponse,
          });
        })
      );

      const result = await listAuditLogs();

      expect(result).toEqual(mockListResponse);
      expect(result.logs).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
    });

    it('should fetch audit logs with pagination', async () => {
      const paginatedResponse = {
        logs: mockAuditLogs.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: 3,
          totalPages: 2,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('page')).toBe('1');
          expect(url.searchParams.get('limit')).toBe('2');

          return HttpResponse.json({
            success: true,
            data: paginatedResponse,
          });
        })
      );

      const result = await listAuditLogs({ page: 1, limit: 2 });

      expect(result.logs).toHaveLength(2);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter by userId', async () => {
      const filteredLogs = mockAuditLogs.filter((log) => log.userId === 'user-1');
      const filteredResponse = {
        logs: filteredLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredLogs.length,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('userId')).toBe('user-1');

          return HttpResponse.json({
            success: true,
            data: filteredResponse,
          });
        })
      );

      const result = await listAuditLogs({ userId: 'user-1' });

      expect(result.logs).toHaveLength(2);
      expect(result.logs.every((log) => log.userId === 'user-1')).toBe(true);
    });

    it('should filter by action types', async () => {
      const filteredLogs = mockAuditLogs.filter((log) =>
        ['create', 'login'].includes(log.action)
      );
      const filteredResponse = {
        logs: filteredLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredLogs.length,
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

      const result = await listAuditLogs({ action: ['create', 'login'] });

      expect(result.logs).toHaveLength(2);
    });

    it('should filter by entityType', async () => {
      const filteredLogs = mockAuditLogs.filter((log) => log.entityType === 'course');
      const filteredResponse = {
        logs: filteredLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredLogs.length,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('entityType')).toBe('course');

          return HttpResponse.json({
            success: true,
            data: filteredResponse,
          });
        })
      );

      const result = await listAuditLogs({ entityType: 'course' });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].entityType).toBe('course');
    });

    it('should filter by severity levels', async () => {
      const filteredLogs = mockAuditLogs.filter((log) =>
        ['warning', 'error'].includes(log.severity)
      );
      const filteredResponse = {
        logs: filteredLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredLogs.length,
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

      const result = await listAuditLogs({ severity: ['warning', 'error'] });

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].severity).toBe('warning');
    });

    it('should filter by IP address', async () => {
      const filteredLogs = mockAuditLogs.filter((log) => log.ipAddress === '192.168.1.1');
      const filteredResponse = {
        logs: filteredLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredLogs.length,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('ipAddress')).toBe('192.168.1.1');

          return HttpResponse.json({
            success: true,
            data: filteredResponse,
          });
        })
      );

      const result = await listAuditLogs({ ipAddress: '192.168.1.1' });

      expect(result.logs).toHaveLength(2);
      expect(result.logs.every((log) => log.ipAddress === '192.168.1.1')).toBe(true);
    });

    it('should filter by date range', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('dateFrom')).toBe('2024-01-10T00:00:00Z');
          expect(url.searchParams.get('dateTo')).toBe('2024-01-10T23:59:59Z');

          return HttpResponse.json({
            success: true,
            data: mockListResponse,
          });
        })
      );

      const result = await listAuditLogs({
        dateFrom: '2024-01-10T00:00:00Z',
        dateTo: '2024-01-10T23:59:59Z',
      });

      expect(result.logs).toHaveLength(3);
    });

    it('should search audit logs', async () => {
      const searchTerm = 'course';
      const filteredLogs = mockAuditLogs.filter(
        (log) =>
          log.description.toLowerCase().includes(searchTerm) ||
          log.entityName?.toLowerCase().includes(searchTerm)
      );
      const filteredResponse = {
        logs: filteredLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredLogs.length,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('search')).toBe(searchTerm);

          return HttpResponse.json({
            success: true,
            data: filteredResponse,
          });
        })
      );

      const result = await listAuditLogs({ search: searchTerm });

      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('should sort audit logs', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('sort')).toBe('-timestamp');

          return HttpResponse.json({
            success: true,
            data: mockListResponse,
          });
        })
      );

      const result = await listAuditLogs({ sort: '-timestamp' });

      expect(result.logs).toHaveLength(3);
    });

    it('should handle multiple filters', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('userId')).toBe('user-1');
          expect(url.searchParams.get('entityType')).toBe('course');
          expect(url.searchParams.get('search')).toBe('programming');

          return HttpResponse.json({
            success: true,
            data: {
              logs: [mockAuditLogs[0]],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
              },
            },
          });
        })
      );

      const result = await listAuditLogs({
        userId: 'user-1',
        entityType: 'course',
        search: 'programming',
      });

      expect(result.logs).toHaveLength(1);
    });

    it('should handle error response', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed to fetch audit logs' },
            { status: 500 }
          );
        })
      );

      await expect(listAuditLogs()).rejects.toThrow();
    });
  });

  // =====================
  // GET AUDIT LOG BY ID
  // =====================

  describe('getAuditLog', () => {
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

      const result = await getAuditLog(auditLog.id);

      expect(result).toEqual(auditLog);
      expect(result.id).toBe(auditLog.id);
    });

    it('should include all audit log details', async () => {
      const auditLog = mockAuditLogs[0];

      server.use(
        http.get(`${baseUrl}/audit-logs/${auditLog.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: auditLog,
          });
        })
      );

      const result = await getAuditLog(auditLog.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('entityType');
      expect(result).toHaveProperty('severity');
      expect(result).toHaveProperty('ipAddress');
      expect(result).toHaveProperty('description');
    });

    it('should include changes when present', async () => {
      const auditLog = mockAuditLogs[0];

      server.use(
        http.get(`${baseUrl}/audit-logs/${auditLog.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: auditLog,
          });
        })
      );

      const result = await getAuditLog(auditLog.id);

      expect(result.changes).toBeDefined();
      expect(result.changes).toHaveLength(1);
      expect(result.changes![0].field).toBe('title');
    });

    it('should include metadata when present', async () => {
      const auditLog = mockAuditLogs[0];

      server.use(
        http.get(`${baseUrl}/audit-logs/${auditLog.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: auditLog,
          });
        })
      );

      const result = await getAuditLog(auditLog.id);

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.userAgent).toBe('Mozilla/5.0');
      expect(result.metadata?.sessionId).toBe('session-1');
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

      await expect(getAuditLog('non-existent')).rejects.toThrow();
    });
  });

  // =====================
  // EXPORT AUDIT LOGS
  // =====================

  describe('exportAuditLogs', () => {
    it('should export audit logs in CSV format', async () => {
      const payload = {
        format: 'csv' as const,
        filters: { entityType: 'course' as const },
      };

      const mockResponse: ExportAuditLogsResponse = {
        url: 'https://example.com/exports/audit-logs-123.csv',
        expiresAt: '2024-01-10T12:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/audit-logs/export`, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(payload);

          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await exportAuditLogs(payload);

      expect(result.url).toBe(mockResponse.url);
      expect(result.expiresAt).toBe(mockResponse.expiresAt);
    });

    it('should export audit logs in Excel format', async () => {
      const payload = {
        format: 'excel' as const,
        dateRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-01-31T23:59:59Z',
        },
      };

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

      const result = await exportAuditLogs(payload);

      expect(result.url).toContain('.xlsx');
    });

    it('should export audit logs in JSON format', async () => {
      const payload = {
        format: 'json' as const,
        filters: {
          severity: ['error', 'critical'] as SeverityLevel[],
          action: ['delete'] as ActionType[],
        },
      };

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

      const result = await exportAuditLogs(payload);

      expect(result.url).toContain('.json');
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

      await expect(
        exportAuditLogs({ format: 'csv' })
      ).rejects.toThrow();
    });
  });
});
