/**
 * PlayerControls Component Tests
 * Tests for course player navigation controls
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerControls } from '../PlayerControls';

const defaultProps = {
  currentLessonIndex: 2,
  totalLessons: 10,
  hasPrevious: true,
  hasNext: true,
  isNextLocked: false,
  onPrevious: vi.fn(),
  onNext: vi.fn(),
};

describe('PlayerControls', () => {
  it('should render lesson counter "Lesson X of Y"', () => {
    render(<PlayerControls {...defaultProps} currentLessonIndex={2} totalLessons={10} />);

    // currentLessonIndex is 0-based, displayed as +1
    expect(screen.getByText('Lesson 3 of 10')).toBeInTheDocument();
  });

  it('should disable Previous button when hasPrevious is false', () => {
    render(<PlayerControls {...defaultProps} hasPrevious={false} />);

    const previousButton = screen.getByRole('button', { name: /previous/i });
    expect(previousButton).toBeDisabled();
  });

  it('should disable Next button when hasNext is false', () => {
    render(
      <PlayerControls {...defaultProps} hasNext={false} isNextLocked={false} />,
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should disable Next button when isNextLocked is true', () => {
    render(
      <PlayerControls {...defaultProps} hasNext={true} isNextLocked={true} />,
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should call onPrevious when previous button is clicked', async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();

    render(<PlayerControls {...defaultProps} onPrevious={onPrevious} />);

    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('should call onNext when next button is clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(<PlayerControls {...defaultProps} onNext={onNext} />);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('should show "Complete Course" button on final lesson', () => {
    const onCompleteCourse = vi.fn();

    render(
      <PlayerControls
        {...defaultProps}
        isOnFinalLesson={true}
        onCompleteCourse={onCompleteCourse}
      />,
    );

    expect(
      screen.getByRole('button', { name: /complete course/i }),
    ).toBeInTheDocument();
  });

  it('should hide Next button and show Complete Course when on final lesson', () => {
    const onCompleteCourse = vi.fn();

    render(
      <PlayerControls
        {...defaultProps}
        isOnFinalLesson={true}
        onCompleteCourse={onCompleteCourse}
      />,
    );

    // Complete Course button should be visible
    expect(
      screen.getByRole('button', { name: /complete course/i }),
    ).toBeInTheDocument();

    // Next button should not be rendered (replaced by Complete Course)
    expect(
      screen.queryByRole('button', { name: /next/i }),
    ).not.toBeInTheDocument();
  });

  it('should call onCompleteCourse when Complete Course button is clicked', async () => {
    const user = userEvent.setup();
    const onCompleteCourse = vi.fn();

    render(
      <PlayerControls
        {...defaultProps}
        isOnFinalLesson={true}
        onCompleteCourse={onCompleteCourse}
      />,
    );

    await user.click(screen.getByRole('button', { name: /complete course/i }));
    expect(onCompleteCourse).toHaveBeenCalledTimes(1);
  });

  it('should show time spent when timeSpent > 0', () => {
    render(<PlayerControls {...defaultProps} timeSpent={125} />);

    // 125 seconds = 2m 5s
    expect(screen.getByText('Time spent: 2m 5s')).toBeInTheDocument();
  });

  it('should not show time spent when timeSpent is 0', () => {
    render(<PlayerControls {...defaultProps} timeSpent={0} />);

    expect(screen.queryByText(/time spent/i)).not.toBeInTheDocument();
  });
});
