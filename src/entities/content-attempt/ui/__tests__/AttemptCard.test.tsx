/**
 * Tests for AttemptCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AttemptCard } from '../AttemptCard';
import type { ContentAttempt } from '../../model/types';

describe('AttemptCard', () => {
  const mockAttempt: ContentAttempt = {
    id: 'attempt-1',
    contentId: 'content-1',
    content: {
      id: 'content-1',
      title: 'Safety Training Module 1',
      type: 'scorm',
    },
    learnerId: 'learner-1',
    enrollmentId: 'enrollment-1',
    attemptNumber: 1,
    status: 'in-progress',
    progressPercent: 65,
    score: null,
    scoreRaw: 78,
    scoreMin: 0,
    scoreMax: 100,
    scoreScaled: 0.78,
    timeSpentSeconds: 1820,
    totalTime: 1820,
    sessionTime: 450,
    startedAt: '2026-01-08T10:00:00.000Z',
    lastAccessedAt: '2026-01-08T10:30:00.000Z',
    completedAt: null,
    scormVersion: '1.2',
    location: 'page-5',
    suspendData: 'bookmark=page5',
    createdAt: '2026-01-08T10:00:00.000Z',
    updatedAt: '2026-01-08T10:30:00.000Z',
  };

  it('should render attempt information', () => {
    render(<AttemptCard attempt={mockAttempt} />);

    expect(screen.getByText('Safety Training Module 1')).toBeInTheDocument();
    expect(screen.getByText('Attempt #1')).toBeInTheDocument();
  });

  it('should display status badge', () => {
    render(<AttemptCard attempt={mockAttempt} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<AttemptCard attempt={mockAttempt} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '65');
  });

  it('should display score when available', () => {
    const attemptWithScore = {
      ...mockAttempt,
      score: 85,
      status: 'passed' as const,
    };

    render(<AttemptCard attempt={attemptWithScore} />);

    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('should show time spent', () => {
    render(<AttemptCard attempt={mockAttempt} />);

    expect(screen.getByText(/Time Spent:/)).toBeInTheDocument();
  });

  it('should render completed attempt differently', () => {
    const completedAttempt = {
      ...mockAttempt,
      status: 'completed' as const,
      progressPercent: 100,
      completedAt: '2026-01-08T11:00:00.000Z',
    };

    render(<AttemptCard attempt={completedAttempt} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('should show resume button for suspended attempts', () => {
    const suspendedAttempt = {
      ...mockAttempt,
      status: 'suspended' as const,
    };

    const onResume = vi.fn();
    render(<AttemptCard attempt={suspendedAttempt} onResume={onResume} />);

    const resumeButton = screen.getByRole('button', { name: /resume/i });
    expect(resumeButton).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onClick = vi.fn();
    render(<AttemptCard attempt={mockAttempt} onClick={onClick} />);

    const card = screen.getByRole('article');
    card.click();

    expect(onClick).toHaveBeenCalledWith(mockAttempt);
  });
});
