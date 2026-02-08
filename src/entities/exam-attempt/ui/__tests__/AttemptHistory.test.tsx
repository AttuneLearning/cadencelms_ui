/**
 * AttemptHistory Component Tests
 * Tests for maxAttempts display and attempt numbering
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AttemptHistory } from '../AttemptHistory';
import type { ExamAttemptListItem } from '../../model/types';

const createMockAttempt = (overrides: Partial<ExamAttemptListItem> = {}): ExamAttemptListItem => ({
  id: 'attempt-1',
  examId: 'exam-1',
  examTitle: 'Module Quiz',
  learnerId: 'learner-1',
  learnerName: 'Test User',
  attemptNumber: 1,
  status: 'graded',
  score: 80,
  maxScore: 100,
  percentage: 80,
  passed: true,
  startedAt: '2026-01-10T09:00:00.000Z',
  submittedAt: '2026-01-10T09:20:00.000Z',
  gradedAt: '2026-01-10T09:25:00.000Z',
  timeSpent: 1200,
  remainingTime: null,
  createdAt: '2026-01-10T09:00:00.000Z',
  updatedAt: '2026-01-10T09:25:00.000Z',
  ...overrides,
});

describe('AttemptHistory', () => {
  it('should render empty state when no attempts', () => {
    render(<AttemptHistory attempts={[]} />);
    expect(screen.getByTestId('attempt-history-empty')).toBeInTheDocument();
  });

  it('should render attempt history table', () => {
    const attempts = [createMockAttempt()];
    render(<AttemptHistory attempts={attempts} />);
    expect(screen.getByTestId('attempt-history')).toBeInTheDocument();
    expect(screen.getByTestId('attempt-history-table')).toBeInTheDocument();
  });

  it('should display attempt count in header when maxAttempts is not provided', () => {
    const attempts = [createMockAttempt(), createMockAttempt({ id: 'attempt-2', attemptNumber: 2 })];
    render(<AttemptHistory attempts={attempts} />);
    expect(screen.getByText('Attempt History (2)')).toBeInTheDocument();
  });

  it('should display "X of Y" in header when maxAttempts is provided', () => {
    const attempts = [createMockAttempt(), createMockAttempt({ id: 'attempt-2', attemptNumber: 2 })];
    render(<AttemptHistory attempts={attempts} maxAttempts={5} />);
    expect(screen.getByText('Attempt History (2 of 5)')).toBeInTheDocument();
  });

  it('should display "X of Y" in attempt number column when maxAttempts is set', () => {
    const attempts = [createMockAttempt({ attemptNumber: 2 })];
    render(<AttemptHistory attempts={attempts} maxAttempts={5} />);
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
  });

  it('should display "#N" in attempt number column when maxAttempts is null', () => {
    const attempts = [createMockAttempt({ attemptNumber: 3 })];
    render(<AttemptHistory attempts={attempts} maxAttempts={null} />);
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('should display "#N" in attempt number column when maxAttempts is not provided', () => {
    const attempts = [createMockAttempt({ attemptNumber: 1 })];
    render(<AttemptHistory attempts={attempts} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should display passed/failed badge', () => {
    const attempts = [
      createMockAttempt({ passed: true }),
      createMockAttempt({ id: 'attempt-2', attemptNumber: 2, passed: false }),
    ];
    render(<AttemptHistory attempts={attempts} />);
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});
