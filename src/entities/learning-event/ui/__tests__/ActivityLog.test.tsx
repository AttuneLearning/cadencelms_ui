/**
 * Tests for ActivityLog Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityLog } from '../ActivityLog';
import { mockLearningEvents } from '@/test/mocks/data/learningEvents';

describe('ActivityLog', () => {
  it('should render loading state', () => {
    render(<ActivityLog events={[]} isLoading={true} />);

    expect(screen.getByTestId('activity-log-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading activity...')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<ActivityLog events={[]} />);

    expect(screen.getByTestId('activity-log-empty')).toBeInTheDocument();
    expect(screen.getByText('No activity to display')).toBeInTheDocument();
  });

  it('should render list of events', () => {
    render(<ActivityLog events={mockLearningEvents} />);

    const log = screen.getByTestId('activity-log');
    expect(log).toBeInTheDocument();

    // Check that events are rendered
    const eventRows = screen.getAllByTestId('activity-log-event');
    expect(eventRows).toHaveLength(mockLearningEvents.length);
  });

  it('should display filters when showFilters is true', () => {
    render(<ActivityLog events={mockLearningEvents} showFilters={true} />);

    expect(screen.getByTestId('activity-log-filters')).toBeInTheDocument();
    expect(screen.getByLabelText('Event Type:')).toBeInTheDocument();
    expect(screen.getByLabelText('From:')).toBeInTheDocument();
    expect(screen.getByLabelText('To:')).toBeInTheDocument();
  });

  it('should not display filters when showFilters is false', () => {
    render(<ActivityLog events={mockLearningEvents} showFilters={false} />);

    expect(screen.queryByTestId('activity-log-filters')).not.toBeInTheDocument();
  });

  it('should display event details in table', () => {
    const events = [mockLearningEvents[0]];
    render(<ActivityLog events={events} />);

    // Check for course
    expect(screen.getByText(/Introduction to Programming/)).toBeInTheDocument();

    // Check for content
    expect(screen.getByText(/Variables and Data Types/)).toBeInTheDocument();

    // Check for score
    expect(screen.getByText(/95.5%/)).toBeInTheDocument();

    // Check for duration
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
  });

  it('should display "-" for missing optional fields', () => {
    const minimalEvent = {
      ...mockLearningEvents[4], // login event
      score: null,
      duration: null,
      content: undefined,
      course: undefined,
    };

    render(<ActivityLog events={[minimalEvent]} />);

    // Should show "-" for missing fields
    const cells = screen.getAllByText('-');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('should call onFilterChange when event type filter changes', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <ActivityLog
        events={mockLearningEvents}
        showFilters={true}
        onFilterChange={onFilterChange}
      />
    );

    const select = screen.getByLabelText('Event Type:');
    await user.selectOptions(select, 'content_completed');

    expect(onFilterChange).toHaveBeenCalledWith({ type: 'content_completed' });
  });

  it('should call onFilterChange when date filter changes', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <ActivityLog
        events={mockLearningEvents}
        showFilters={true}
        onFilterChange={onFilterChange}
      />
    );

    const dateInput = screen.getByLabelText('From:');
    await user.type(dateInput, '2026-01-01');

    expect(onFilterChange).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ActivityLog events={[]} className="custom-log" />
    );

    expect(container.querySelector('.custom-log')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<ActivityLog events={mockLearningEvents} />);

    expect(screen.getByText('Date/Time')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });
});
