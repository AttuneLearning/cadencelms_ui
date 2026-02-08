/**
 * CourseCompletionScreen Component Tests
 * Tests for the celebration screen shown when a learner completes a course
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseCompletionScreen } from '../CourseCompletionScreen';
import type { CourseProgress } from '@/entities/progress/model/types';

const makeCourseProgress = (
  overrides: Partial<CourseProgress['overallProgress']> = {},
): CourseProgress =>
  ({
    courseId: 'course-1',
    courseTitle: 'Test Course',
    courseCode: 'TC-101',
    learnerId: 'learner-1',
    learnerName: 'Test Learner',
    enrolledAt: '2026-01-01T00:00:00Z',
    startedAt: '2026-01-02T00:00:00Z',
    completedAt: '2026-02-01T00:00:00Z',
    status: 'completed' as const,
    overallProgress: {
      completionPercent: 100,
      modulesCompleted: 5,
      modulesTotal: 5,
      score: 92,
      timeSpent: 7200,
      lastAccessedAt: '2026-02-01T00:00:00Z',
      daysActive: 10,
      streak: 5,
      ...overrides,
    },
    moduleProgress: [],
    assessments: [],
    activityLog: [],
  }) as CourseProgress;

const defaultProps = {
  courseTitle: 'Introduction to Biology',
  courseProgress: makeCourseProgress(),
  enrollment: { id: 'enroll-1', status: 'completed' },
  onBackToDashboard: vi.fn(),
  onReviewCourse: vi.fn(),
};

describe('CourseCompletionScreen', () => {
  it('should render congratulations message with course title', () => {
    render(<CourseCompletionScreen {...defaultProps} />);

    expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Biology')).toBeInTheDocument();
  });

  it('should display completion stats: modules completed, time spent, score', () => {
    render(
      <CourseCompletionScreen
        {...defaultProps}
        courseProgress={makeCourseProgress({
          modulesCompleted: 5,
          modulesTotal: 5,
          timeSpent: 7200,
          score: 92,
        })}
      />,
    );

    // Modules stat
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Modules')).toBeInTheDocument();

    // Time spent stat (7200 seconds = 2h 0m)
    expect(screen.getByText('2h 0m')).toBeInTheDocument();
    expect(screen.getByText('Time Spent')).toBeInTheDocument();

    // Score stat
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('should show "Back to Dashboard" button that calls onBackToDashboard', async () => {
    const user = userEvent.setup();
    const onBackToDashboard = vi.fn();

    render(
      <CourseCompletionScreen {...defaultProps} onBackToDashboard={onBackToDashboard} />,
    );

    const button = screen.getByRole('button', { name: /back to dashboard/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onBackToDashboard).toHaveBeenCalledTimes(1);
  });

  it('should show "Review Course Content" button that calls onReviewCourse', async () => {
    const user = userEvent.setup();
    const onReviewCourse = vi.fn();

    render(
      <CourseCompletionScreen {...defaultProps} onReviewCourse={onReviewCourse} />,
    );

    const button = screen.getByRole('button', { name: /review course content/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onReviewCourse).toHaveBeenCalledTimes(1);
  });

  it('should show "View Your Certificate" button when onViewCertificate is provided', async () => {
    const user = userEvent.setup();
    const onViewCertificate = vi.fn();

    render(
      <CourseCompletionScreen
        {...defaultProps}
        onViewCertificate={onViewCertificate}
      />,
    );

    const button = screen.getByRole('button', { name: /view your certificate/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(onViewCertificate).toHaveBeenCalledTimes(1);
  });

  it('should hide certificate button when onViewCertificate is not provided', () => {
    render(
      <CourseCompletionScreen
        {...defaultProps}
        onViewCertificate={undefined}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /view your certificate/i }),
    ).not.toBeInTheDocument();
  });

  it('should handle null courseProgress gracefully with default values', () => {
    render(
      <CourseCompletionScreen
        {...defaultProps}
        courseProgress={null}
      />,
    );

    // Modules defaults to 0/0
    expect(screen.getByText('0/0')).toBeInTheDocument();

    // Time defaults to 0 seconds => formatTime(0) = "0m"
    expect(screen.getByText('0m')).toBeInTheDocument();

    // Score defaults to null => "--"
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('should handle undefined courseProgress gracefully with default values', () => {
    render(
      <CourseCompletionScreen
        courseTitle="Some Course"
        onBackToDashboard={vi.fn()}
        onReviewCourse={vi.fn()}
      />,
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByText('0m')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
  });
});
