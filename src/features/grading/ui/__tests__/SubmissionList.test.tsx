/**
 * Tests for SubmissionList Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmissionList } from '../SubmissionList';
import type { ExamAttemptListItem } from '@/entities/exam-attempt/model/types';

describe('SubmissionList', () => {
  const mockAttempts: ExamAttemptListItem[] = [
    {
      id: 'attempt-1',
      examId: 'exam-1',
      examTitle: 'Math Quiz',
      learnerId: 'learner-1',
      learnerName: 'John Doe',
      attemptNumber: 1,
      status: 'submitted',
      score: 0,
      maxScore: 100,
      percentage: 0,
      passed: false,
      startedAt: '2026-01-09T09:00:00.000Z',
      submittedAt: '2026-01-09T09:25:00.000Z',
      gradedAt: null,
      timeSpent: 1500,
      remainingTime: null,
      createdAt: '2026-01-09T09:00:00.000Z',
      updatedAt: '2026-01-09T09:25:00.000Z',
    },
    {
      id: 'attempt-2',
      examId: 'exam-2',
      examTitle: 'Science Test',
      learnerId: 'learner-2',
      learnerName: 'Jane Smith',
      attemptNumber: 1,
      status: 'graded',
      score: 85,
      maxScore: 100,
      percentage: 85,
      passed: true,
      gradeLetter: 'B',
      startedAt: '2026-01-09T08:00:00.000Z',
      submittedAt: '2026-01-09T08:25:00.000Z',
      gradedAt: '2026-01-09T08:30:00.000Z',
      timeSpent: 1500,
      remainingTime: null,
      createdAt: '2026-01-09T08:00:00.000Z',
      updatedAt: '2026-01-09T08:30:00.000Z',
    },
  ];

  const mockHandlers = {
    onSelect: vi.fn(),
    onSelectAll: vi.fn(),
    onViewSubmission: vi.fn(),
  };

  describe('Display', () => {
    it('should render all submissions', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Math Quiz')).toBeInTheDocument();
      expect(screen.getByText('Science Test')).toBeInTheDocument();
    });

    it('should display status badges correctly', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Graded')).toBeInTheDocument();
    });

    it('should display scores for graded submissions', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should format submission dates correctly', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      // Should display relative or formatted dates
      const dates = screen.getAllByText(/Jan|2026|ago/);
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  describe('Selection', () => {
    it('should render checkboxes for each submission', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // +1 for select all checkbox
      expect(checkboxes.length).toBe(mockAttempts.length + 1);
    });

    it('should call onSelect when clicking a checkbox', async () => {
      const user = userEvent.setup();

      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // Click first submission checkbox (skip select all)
      await user.click(checkboxes[1]);

      expect(mockHandlers.onSelect).toHaveBeenCalledWith('attempt-1', true);
    });

    it('should show checked state for selected submissions', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={['attempt-1']}
          {...mockHandlers}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).not.toBeChecked();
    });

    it('should call onSelectAll when clicking select all checkbox', async () => {
      const user = userEvent.setup();

      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(selectAllCheckbox);

      expect(mockHandlers.onSelectAll).toHaveBeenCalledWith(true);
    });

    it('should show indeterminate state when some are selected', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={['attempt-1']}
          {...mockHandlers}
        />
      );

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      expect(selectAllCheckbox).toHaveProperty('indeterminate', true);
    });

    it('should check select all when all are selected', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={['attempt-1', 'attempt-2']}
          {...mockHandlers}
        />
      );

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      expect(selectAllCheckbox).toBeChecked();
      expect(selectAllCheckbox).toHaveProperty('indeterminate', false);
    });
  });

  describe('Actions', () => {
    it('should render grade button for submitted attempts', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      const gradeButtons = screen.getAllByRole('button', { name: /grade/i });
      expect(gradeButtons.length).toBeGreaterThan(0);
    });

    it('should render view button for graded attempts', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      const viewButtons = screen.getAllByRole('button', { name: /view|grade/i });
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('should call onViewSubmission when clicking grade/view button', async () => {
      const user = userEvent.setup();

      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      const gradeButtons = screen.getAllByRole('button', { name: /grade/i });
      await user.click(gradeButtons[0]);

      expect(mockHandlers.onViewSubmission).toHaveBeenCalledWith('attempt-1');
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no attempts', () => {
      render(
        <SubmissionList
          attempts={[]}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      expect(screen.getByText(/no submissions/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render table on desktop', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should display time spent for submissions', () => {
      render(
        <SubmissionList
          attempts={mockAttempts}
          selectedIds={[]}
          {...mockHandlers}
        />
      );

      // Time spent is 1500 seconds = 25 minutes
      const times = screen.getAllByText(/25m/);
      expect(times.length).toBeGreaterThan(0);
    });
  });
});
