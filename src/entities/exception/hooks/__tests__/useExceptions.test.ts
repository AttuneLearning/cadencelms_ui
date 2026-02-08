/**
 * Tests for Exception React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import {
  useEnrollmentExceptions,
  useException,
  useGrantException,
  useUpdateException,
  useRevokeException,
} from '../useExceptions';
import type {
  LearnerException,
  ExceptionsListResponse,
  LearnerExceptionListItem,
} from '../../model/types';

describe('Exception Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mock data
  const mockException: LearnerException = {
    id: 'exc-1',
    enrollmentId: 'enr-1',
    learnerId: 'user-1',
    learnerName: 'Jane Smith',
    courseId: 'course-1',
    type: 'extra_attempts',
    details: {
      contentId: 'exercise-1',
      contentType: 'exercise',
      additionalAttempts: 2,
    },
    reason: 'Technical difficulties during initial attempt',
    grantedBy: {
      id: 'admin-1',
      firstName: 'Admin',
      lastName: 'User',
    },
    grantedAt: '2026-02-08T10:00:00Z',
    expiresAt: null,
    isActive: true,
  };

  const mockExceptionListItem: LearnerExceptionListItem = {
    id: 'exc-1',
    enrollmentId: 'enr-1',
    learnerId: 'user-1',
    learnerName: 'Jane Smith',
    courseId: 'course-1',
    type: 'extra_attempts',
    details: {
      contentId: 'exercise-1',
      contentType: 'exercise',
      additionalAttempts: 2,
    },
    reason: 'Technical difficulties during initial attempt',
    grantedBy: {
      id: 'admin-1',
      firstName: 'Admin',
      lastName: 'User',
    },
    grantedAt: '2026-02-08T10:00:00Z',
    expiresAt: null,
    isActive: true,
  };

  const mockExceptionsListResponse: ExceptionsListResponse = {
    exceptions: [mockExceptionListItem],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  // =====================
  // QUERY HOOKS
  // =====================

  describe('useEnrollmentExceptions', () => {
    it('should fetch exceptions for an enrollment', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enr-1/exceptions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExceptionsListResponse,
          });
        })
      );

      const { result } = renderHook(() => useEnrollmentExceptions('enr-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockExceptionsListResponse);
      expect(result.current.data?.exceptions).toHaveLength(1);
    });

    it('should fetch exceptions with filters', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enr-1/exceptions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExceptionsListResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useEnrollmentExceptions('enr-1', { type: 'extra_attempts', isActive: true })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should not fetch when enrollmentId is empty', () => {
      const { result } = renderHook(() => useEnrollmentExceptions(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enr-1/exceptions`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useEnrollmentExceptions('enr-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useException', () => {
    it('should fetch single exception by id', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments/enr-1/exceptions/exc-1`, () => {
          return HttpResponse.json({
            success: true,
            data: { exception: mockException },
          });
        })
      );

      const { result } = renderHook(() => useException('enr-1', 'exc-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockException);
    });

    it('should not fetch when enrollmentId is empty', () => {
      const { result } = renderHook(() => useException('', 'exc-1'));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useException('enr-1', ''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =====================
  // MUTATION HOOKS
  // =====================

  describe('useGrantException', () => {
    it('should grant a new exception', async () => {
      server.use(
        http.post(`${baseUrl}/enrollments/enr-1/exceptions/attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: { exception: mockException },
          });
        })
      );

      const { result } = renderHook(() => useGrantException());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enr-1',
          type: 'extra_attempts',
          details: {
            contentId: 'exercise-1',
            contentType: 'exercise',
            additionalAttempts: 2,
          },
          reason: 'Technical difficulties during initial attempt',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockException);
    });

    it('should handle grant error', async () => {
      server.use(
        http.post(`${baseUrl}/enrollments/enr-1/exceptions/attempts`, () => {
          return HttpResponse.json(
            { success: false, message: 'Not authorized' },
            { status: 403 }
          );
        })
      );

      const { result } = renderHook(() => useGrantException());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enr-1',
          type: 'extra_attempts',
          details: {},
          reason: 'Test',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateException', () => {
    it('should update an exception', async () => {
      const updatedException = { ...mockException, reason: 'Updated reason' };

      server.use(
        http.patch(`${baseUrl}/enrollments/enr-1/exceptions/exc-1`, () => {
          return HttpResponse.json({
            success: true,
            data: { exception: updatedException },
          });
        })
      );

      const { result } = renderHook(() => useUpdateException());

      act(() => {
        result.current.mutate({
          enrollmentId: 'enr-1',
          id: 'exc-1',
          payload: { reason: 'Updated reason' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.reason).toBe('Updated reason');
    });
  });

  describe('useRevokeException', () => {
    it('should revoke an exception', async () => {
      server.use(
        http.put(`${baseUrl}/enrollments/enr-1/exceptions/exc-1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useRevokeException());

      act(() => {
        result.current.mutate({ enrollmentId: 'enr-1', id: 'exc-1' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle revoke error', async () => {
      server.use(
        http.put(`${baseUrl}/enrollments/enr-1/exceptions/exc-1`, () => {
          return HttpResponse.json(
            { success: false, message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useRevokeException());

      act(() => {
        result.current.mutate({ enrollmentId: 'enr-1', id: 'exc-1' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
