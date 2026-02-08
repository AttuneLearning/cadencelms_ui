/**
 * Tests for Assignment React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import {
  useAssignments,
  useAssignment,
  useSubmissions,
  useMySubmissions,
  useSubmission,
  useCreateSubmission,
  useUpdateSubmission,
  useSubmitAssignment,
  useDeleteSubmission,
  useGradeSubmission,
} from '../useAssignments';
import type {
  Assignment,
  AssignmentSubmission,
  ListAssignmentsResponse,
  ListSubmissionsResponse,
} from '../../model/types';

describe('Assignment Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mock data
  const mockAssignment: Assignment = {
    id: 'assign-1',
    title: 'Week 1 Essay',
    description: 'Write a 500-word essay on the topic.',
    type: 'text',
    allowResubmission: true,
    maxSubmissions: 3,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  };

  const mockSubmission: AssignmentSubmission = {
    id: 'sub-1',
    assignmentId: 'assign-1',
    learnerId: 'user-1',
    attemptNumber: 1,
    status: 'draft',
    textContent: 'My essay draft...',
    submittedAt: null,
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
  };

  const mockSubmittedSubmission: AssignmentSubmission = {
    ...mockSubmission,
    id: 'sub-2',
    status: 'submitted',
    submittedAt: '2026-02-08T12:00:00Z',
  };

  const mockListAssignmentsResponse: ListAssignmentsResponse = {
    assignments: [mockAssignment],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  const mockListSubmissionsResponse: ListSubmissionsResponse = {
    submissions: [mockSubmission],
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

  describe('useAssignments', () => {
    it('should fetch assignments list', async () => {
      server.use(
        http.get(`${baseUrl}/assignments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListAssignmentsResponse,
          });
        })
      );

      const { result } = renderHook(() => useAssignments());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockListAssignmentsResponse);
      expect(result.current.data?.assignments).toHaveLength(1);
    });

    it('should fetch assignments with params', async () => {
      server.use(
        http.get(`${baseUrl}/assignments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListAssignmentsResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useAssignments({ courseId: 'course-1', page: 1 })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/assignments`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useAssignments());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useAssignment', () => {
    it('should fetch single assignment by id', async () => {
      server.use(
        http.get(`${baseUrl}/assignments/assign-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockAssignment,
          });
        })
      );

      const { result } = renderHook(() => useAssignment('assign-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAssignment);
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useAssignment(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useSubmissions', () => {
    it('should fetch submissions for an assignment', async () => {
      server.use(
        http.get(`${baseUrl}/assignments/assign-1/submissions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListSubmissionsResponse,
          });
        })
      );

      const { result } = renderHook(() => useSubmissions('assign-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.submissions).toHaveLength(1);
    });

    it('should not fetch when assignmentId is empty', () => {
      const { result } = renderHook(() => useSubmissions(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useMySubmissions', () => {
    it('should fetch my submissions for an assignment', async () => {
      server.use(
        http.get(`${baseUrl}/assignments/assign-1/my-submissions`, () => {
          return HttpResponse.json({
            success: true,
            data: { submissions: [mockSubmission] },
          });
        })
      );

      const { result } = renderHook(() => useMySubmissions('assign-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(1);
    });
  });

  describe('useSubmission', () => {
    it('should fetch a single submission by id', async () => {
      server.use(
        http.get(`${baseUrl}/assignment-submissions/sub-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSubmission,
          });
        })
      );

      const { result } = renderHook(() => useSubmission('sub-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSubmission);
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useSubmission(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =====================
  // MUTATION HOOKS
  // =====================

  describe('useCreateSubmission', () => {
    it('should create a new submission', async () => {
      server.use(
        http.post(`${baseUrl}/assignment-submissions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSubmission,
          });
        })
      );

      const { result } = renderHook(() => useCreateSubmission());

      act(() => {
        result.current.mutate({
          assignmentId: 'assign-1',
          textContent: 'My essay draft...',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSubmission);
    });
  });

  describe('useUpdateSubmission', () => {
    it('should update a submission', async () => {
      const updatedSubmission = { ...mockSubmission, textContent: 'Updated draft' };

      server.use(
        http.patch(`${baseUrl}/assignment-submissions/sub-1`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedSubmission,
          });
        })
      );

      const { result } = renderHook(() => useUpdateSubmission());

      act(() => {
        result.current.mutate({
          id: 'sub-1',
          data: { textContent: 'Updated draft' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.textContent).toBe('Updated draft');
    });
  });

  describe('useSubmitAssignment', () => {
    it('should submit an assignment', async () => {
      server.use(
        http.post(`${baseUrl}/assignment-submissions/sub-1/submit`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSubmittedSubmission,
          });
        })
      );

      const { result } = renderHook(() => useSubmitAssignment());

      act(() => {
        result.current.mutate({
          submissionId: 'sub-1',
          textContent: 'My final essay.',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.status).toBe('submitted');
    });
  });

  describe('useGradeSubmission', () => {
    it('should grade a submission', async () => {
      const gradedSubmission: AssignmentSubmission = {
        ...mockSubmittedSubmission,
        status: 'graded',
        grade: {
          score: 85,
          maxScore: 100,
          feedback: 'Good work!',
          gradedBy: 'instructor-1',
          gradedAt: '2026-02-09T10:00:00Z',
        },
      };

      server.use(
        http.post(`${baseUrl}/assignment-submissions/sub-2/grade`, () => {
          return HttpResponse.json({
            success: true,
            data: gradedSubmission,
          });
        })
      );

      const { result } = renderHook(() => useGradeSubmission());

      act(() => {
        result.current.mutate({
          submissionId: 'sub-2',
          data: { score: 85, maxScore: 100, feedback: 'Good work!' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.status).toBe('graded');
      expect(result.current.data?.grade?.score).toBe(85);
    });
  });

  describe('useDeleteSubmission', () => {
    it('should delete a submission', async () => {
      server.use(
        http.delete(`${baseUrl}/assignment-submissions/sub-1`, () => {
          return HttpResponse.json({
            success: true,
            data: { id: 'sub-1', deleted: true },
          });
        })
      );

      const { result } = renderHook(() => useDeleteSubmission());

      act(() => {
        result.current.mutate('sub-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
