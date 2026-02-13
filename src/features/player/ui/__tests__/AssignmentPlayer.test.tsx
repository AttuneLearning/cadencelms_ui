/**
 * AssignmentPlayer Component Tests
 * Aligned with API-ISS-029 assignment contracts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssignmentPlayer } from '../AssignmentPlayer';
import * as assignmentHooks from '@/entities/assignment/hooks/useAssignments';
import * as contentAttemptHooks from '@/entities/content-attempt/hooks/useContentAttempts';
import type { Assignment, AssignmentSubmission } from '@/entities/assignment';

// Mock the hooks
vi.mock('@/entities/assignment/hooks/useAssignments');
vi.mock('@/entities/content-attempt/hooks/useContentAttempts');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockTextAssignment: Assignment = {
  id: 'assignment-1',
  courseId: 'course-1',
  title: 'Essay Assignment',
  instructions: '<p>Write an essay about testing</p>',
  submissionType: 'text',
  allowedFileTypes: [],
  maxFileSize: 0,
  maxFiles: 0,
  maxScore: 100,
  maxResubmissions: null,
  isPublished: true,
  createdBy: 'instructor-1',
  isDeleted: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockFileAssignment: Assignment = {
  id: 'assignment-2',
  courseId: 'course-1',
  title: 'File Upload Assignment',
  instructions: '<p>Upload your project files</p>',
  submissionType: 'file',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['pdf', 'docx'],
  maxFiles: 3,
  maxScore: 100,
  maxResubmissions: null,
  isPublished: true,
  createdBy: 'instructor-1',
  isDeleted: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockTextAndFileAssignment: Assignment = {
  id: 'assignment-3',
  courseId: 'course-1',
  title: 'Combined Assignment',
  instructions: '<p>Submit text and files</p>',
  submissionType: 'text_and_file',
  allowedFileTypes: [],
  maxFileSize: 0,
  maxFiles: 0,
  maxScore: 100,
  maxResubmissions: 2,
  isPublished: true,
  createdBy: 'instructor-1',
  isDeleted: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockDraftSubmission: AssignmentSubmission = {
  id: 'submission-1',
  assignmentId: 'assignment-1',
  learnerId: 'learner-1',
  enrollmentId: 'enroll-1',
  submissionNumber: 1,
  status: 'draft',
  textContent: 'Draft content',
  files: [],
  submittedAt: null,
  grade: null,
  feedback: null,
  gradedBy: null,
  gradedAt: null,
  returnedAt: null,
  returnReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

const mockSubmittedSubmission: AssignmentSubmission = {
  id: 'submission-2',
  assignmentId: 'assignment-1',
  learnerId: 'learner-1',
  enrollmentId: 'enroll-1',
  submissionNumber: 1,
  status: 'submitted',
  textContent: 'Final submission',
  files: [],
  submittedAt: '2024-01-03T00:00:00Z',
  grade: null,
  feedback: null,
  gradedBy: null,
  gradedAt: null,
  returnedAt: null,
  returnReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-03T00:00:00Z',
};

const mockGradedSubmission: AssignmentSubmission = {
  id: 'submission-3',
  assignmentId: 'assignment-1',
  learnerId: 'learner-1',
  enrollmentId: 'enroll-1',
  submissionNumber: 1,
  status: 'graded',
  textContent: 'Final submission',
  files: [],
  submittedAt: '2024-01-03T00:00:00Z',
  grade: 85,
  feedback: 'Great work!',
  gradedBy: 'instructor-1',
  gradedAt: '2024-01-04T00:00:00Z',
  returnedAt: null,
  returnReason: null,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-04T00:00:00Z',
};

describe('AssignmentPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock all mutation hooks with default implementations
    vi.spyOn(assignmentHooks, 'useCreateSubmission').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(assignmentHooks, 'useUpdateSubmission').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(assignmentHooks, 'useSubmitSubmission').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.spyOn(contentAttemptHooks, 'useCompleteContentAttempt').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  describe('Text Assignment', () => {
    it('renders assignment instructions', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Essay Assignment')).toBeInTheDocument();
      expect(screen.getByText('Write an essay about testing')).toBeInTheDocument();
    });

    it('shows text area for text assignments', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByPlaceholderText('Type your response here...')).toBeInTheDocument();
    });

    it('loads existing draft content', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [mockDraftSubmission], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Draft content')).toBeInTheDocument();
    });

    it('enables save draft button when text is changed', async () => {
      const user = userEvent.setup();
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      const textarea = screen.getByPlaceholderText('Type your response here...');
      await user.type(textarea, 'New content');

      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      expect(saveDraftButton).toBeEnabled();
    });

    it('shows submit button', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('button', { name: /submit assignment/i })).toBeInTheDocument();
    });
  });

  describe('File Assignment', () => {
    it('shows file upload for file assignments', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockFileAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Upload File')).toBeInTheDocument();
      expect(screen.getByText('Allowed types: pdf, docx')).toBeInTheDocument();
      expect(screen.getByText('Max size: 5.00MB')).toBeInTheDocument();
    });

    it('does not show text area for file-only assignments', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockFileAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByPlaceholderText('Type your response here...')).not.toBeInTheDocument();
    });
  });

  describe('Text and File Assignment', () => {
    it('shows both text area and file upload', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAndFileAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByPlaceholderText('Type your response here...')).toBeInTheDocument();
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });
  });

  describe('Submitted Assignment', () => {
    it('shows submitted status', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [mockSubmittedSubmission], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('submitted')).toBeInTheDocument();
      expect(screen.getByText(/assignment submitted on/i)).toBeInTheDocument();
    });

    it('displays submitted content', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [mockSubmittedSubmission], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Submitted Work')).toBeInTheDocument();
      expect(screen.getByText('Final submission')).toBeInTheDocument();
    });
  });

  describe('Graded Assignment', () => {
    it('shows grade when graded', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [mockGradedSubmission], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Grade')).toBeInTheDocument();
      expect(screen.getByText('85 / 100')).toBeInTheDocument();
      expect(screen.getByText('(85%)')).toBeInTheDocument();
    });

    it('shows feedback when available', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [mockGradedSubmission], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Feedback')).toBeInTheDocument();
      expect(screen.getByText('Great work!')).toBeInTheDocument();
    });
  });

  describe('Resubmission Flow', () => {
    it('shows resubmission option when allowed', () => {
      const submittedWithResubmit: AssignmentSubmission = {
        ...mockSubmittedSubmission,
        assignmentId: 'assignment-3',
        submissionNumber: 1,
      };

      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [submittedWithResubmit], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAndFileAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Resubmission Available')).toBeInTheDocument();
      expect(screen.getByText('Submission 1 of 3')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start resubmission/i })).toBeInTheDocument();
    });

    it('does not show resubmission when not allowed', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [mockSubmittedSubmission], pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.queryByText('Resubmission Available')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching submissions', () => {
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText('Loading assignment...')).toBeInTheDocument();
    });
  });

  describe('Submit Confirmation', () => {
    it('shows confirmation dialog when submit is clicked', async () => {
      const user = userEvent.setup();
      vi.spyOn(assignmentHooks, 'useSubmissions').mockReturnValue({
        data: { submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
        isLoading: false,
      } as any);

      render(
        <AssignmentPlayer attemptId="attempt-1" assignment={mockTextAssignment} />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit assignment/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Submit Assignment?')).toBeInTheDocument();
        expect(
          screen.getByText(/are you sure you want to submit this assignment/i)
        ).toBeInTheDocument();
      });
    });
  });
});
