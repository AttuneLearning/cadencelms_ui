/**
 * Tests for Assignment React Query Hooks
 * Updated for API-ISS-029 contract alignment
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
  useSubmission,
  useCreateAssignment,
  useCreateSubmission,
  useUpdateSubmission,
  useSubmitSubmission,
  useGradeSubmission,
  useReturnSubmission,
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

  // Mock data aligned with API-ISS-029 contract
  const mockAssignment: Assignment = {
    id: 'assign-1',
    courseId: 'course-1',
    title: 'Week 1 Essay',
    instructions: 'Write a 500-word essay on the topic.',
    submissionType: 'text',
    allowedFileTypes: ['pdf', 'docx'],
    maxFileSize: 10485760,
    maxFiles: 5,
    maxScore: 100,
    maxResubmissions: 2,
    isPublished: true,
    createdBy: 'instructor-1',
    isDeleted: false,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  };

  const mockSubmission: AssignmentSubmission = {
    id: 'sub-1',
    assignmentId: 'assign-1',
    learnerId: 'user-1',
    enrollmentId: 'enroll-1',
    submissionNumber: 1,
    status: 'draft',
    textContent: 'My essay draft...',
    files: [],
    submittedAt: null,
    grade: null,
    feedback: null,
    gradedBy: null,
    gradedAt: null,
    returnedAt: null,
    returnReason: null,
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

  describe('useSubmission', () => {
    it('should fetch a single submission by id', async () => {
      server.use(
        http.get(`${baseUrl}/submissions/sub-1`, () => {
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

  describe('useCreateAssignment', () => {
    it('should create a new assignment', async () => {
      server.use(
        http.post(`${baseUrl}/assignments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockAssignment,
          });
        })
      );

      const { result } = renderHook(() => useCreateAssignment());

      act(() => {
        result.current.mutate({
          courseId: 'course-1',
          title: 'Week 1 Essay',
          instructions: 'Write a 500-word essay on the topic.',
          submissionType: 'text',
          maxScore: 100,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAssignment);
    });
  });

  describe('useCreateSubmission', () => {
    it('should create a new submission', async () => {
      server.use(
        http.post(`${baseUrl}/assignments/assign-1/submissions`, () => {
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
          data: {
            enrollmentId: 'enroll-1',
            textContent: 'My essay draft...',
          },
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
        http.put(`${baseUrl}/submissions/sub-1`, () => {
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

  describe('useSubmitSubmission', () => {
    it('should submit a submission', async () => {
      server.use(
        http.post(`${baseUrl}/submissions/sub-1/submit`, () => {
          return HttpResponse.json({
            success: true,
            data: mockSubmittedSubmission,
          });
        })
      );

      const { result } = renderHook(() => useSubmitSubmission());

      act(() => {
        result.current.mutate('sub-1');
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
        grade: 85,
        feedback: 'Good work!',
        gradedBy: 'instructor-1',
        gradedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/submissions/sub-2/grade`, () => {
          return HttpResponse.json({
            success: true,
            data: gradedSubmission,
          });
        })
      );

      const { result } = renderHook(() => useGradeSubmission());

      act(() => {
        result.current.mutate({
          id: 'sub-2',
          data: { grade: 85, feedback: 'Good work!' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.status).toBe('graded');
      expect(result.current.data?.grade).toBe(85);
    });
  });

  describe('useReturnSubmission', () => {
    it('should return a submission for resubmission', async () => {
      const returnedSubmission: AssignmentSubmission = {
        ...mockSubmittedSubmission,
        status: 'returned',
        returnedAt: '2026-02-09T11:00:00Z',
        returnReason: 'Please add more detail to section 2.',
      };

      server.use(
        http.post(`${baseUrl}/submissions/sub-2/return`, () => {
          return HttpResponse.json({
            success: true,
            data: returnedSubmission,
          });
        })
      );

      const { result } = renderHook(() => useReturnSubmission());

      act(() => {
        result.current.mutate({
          id: 'sub-2',
          data: { returnReason: 'Please add more detail to section 2.' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.status).toBe('returned');
      expect(result.current.data?.returnReason).toBe('Please add more detail to section 2.');
    });
  });
});
