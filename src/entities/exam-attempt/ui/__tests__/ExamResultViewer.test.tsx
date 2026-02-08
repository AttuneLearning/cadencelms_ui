/**
 * ExamResultViewer Component Tests
 * Tests for gradingPolicy display
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExamResultViewer } from '../ExamResultViewer';
import type { ExamResult } from '../../model/types';

const createMockResult = (overrides: Partial<ExamResult> = {}): ExamResult => ({
  attemptId: 'attempt-1',
  examTitle: 'Module Quiz',
  learnerName: 'Test User',
  attemptNumber: 1,
  status: 'graded',
  score: 80,
  maxScore: 100,
  percentage: 80,
  passed: true,
  gradeLetter: 'B',
  passingScore: 70,
  submittedAt: '2026-01-10T09:20:00.000Z',
  gradedAt: '2026-01-10T09:25:00.000Z',
  timeSpent: 1200,
  timeLimit: 1800,
  maxAttempts: 3,
  attemptsUsed: 1,
  summary: {
    totalQuestions: 10,
    answeredCount: 10,
    unansweredCount: 0,
    correctCount: 8,
    incorrectCount: 2,
  },
  questionResults: [],
  overallFeedback: null,
  gradedBy: null,
  allowReview: true,
  showCorrectAnswers: true,
  ...overrides,
});

describe('ExamResultViewer', () => {
  it('should display "Score" label without grading policy', () => {
    const result = createMockResult();
    render(<ExamResultViewer result={result} />);
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('should display "Score (Best Attempt)" when gradingPolicy is best', () => {
    const result = createMockResult();
    render(<ExamResultViewer result={result} gradingPolicy="best" />);
    expect(screen.getByText('Score (Best Attempt)')).toBeInTheDocument();
  });

  it('should display "Score (Latest Attempt)" when gradingPolicy is last', () => {
    const result = createMockResult();
    render(<ExamResultViewer result={result} gradingPolicy="last" />);
    expect(screen.getByText('Score (Latest Attempt)')).toBeInTheDocument();
  });

  it('should display "Score (Average of Attempts)" when gradingPolicy is average', () => {
    const result = createMockResult();
    render(<ExamResultViewer result={result} gradingPolicy="average" />);
    expect(screen.getByText('Score (Average of Attempts)')).toBeInTheDocument();
  });

  it('should display the score value', () => {
    const result = createMockResult({ score: 80, maxScore: 100 });
    render(<ExamResultViewer result={result} />);
    expect(screen.getByText('80/100')).toBeInTheDocument();
  });

  it('should display passed status', () => {
    const result = createMockResult({ passed: true });
    render(<ExamResultViewer result={result} />);
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  it('should display failed status', () => {
    const result = createMockResult({ passed: false, gradeLetter: 'F', percentage: 50 });
    render(<ExamResultViewer result={result} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should display exam title', () => {
    const result = createMockResult({ examTitle: 'Final Exam' });
    render(<ExamResultViewer result={result} />);
    expect(screen.getByText('Final Exam')).toBeInTheDocument();
  });
});
