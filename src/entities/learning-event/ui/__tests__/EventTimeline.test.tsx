/**
 * Tests for EventTimeline Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventTimeline } from '../EventTimeline';
import { mockLearningEvents } from '@/test/mocks/data/learningEvents';

describe('EventTimeline', () => {
  it('should render loading state', () => {
    render(<EventTimeline events={[]} isLoading={true} />);

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<EventTimeline events={[]} />);

    expect(screen.getByText('No events to display')).toBeInTheDocument();
  });

  it('should render custom empty message', () => {
    const customMessage = 'No activity found';
    render(<EventTimeline events={[]} emptyMessage={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should render list of events', () => {
    render(<EventTimeline events={mockLearningEvents} />);

    const timeline = screen.getByTestId('event-timeline');
    expect(timeline).toBeInTheDocument();

    // Check that events are rendered
    const eventItems = screen.getAllByTestId(/event-item-/);
    expect(eventItems).toHaveLength(mockLearningEvents.length);
  });

  it('should display event details', () => {
    const events = [mockLearningEvents[0]];
    render(<EventTimeline events={events} />);

    // Check for learner name
    expect(screen.getByText(/John/)).toBeInTheDocument();
    expect(screen.getByText(/Doe/)).toBeInTheDocument();

    // Check for course
    expect(screen.getByText(/Introduction to Programming/)).toBeInTheDocument();

    // Check for content
    expect(screen.getByText(/Variables and Data Types/)).toBeInTheDocument();
  });

  it('should display score when present', () => {
    const events = [mockLearningEvents[0]];
    render(<EventTimeline events={events} />);

    expect(screen.getByText(/95.5%/)).toBeInTheDocument();
  });

  it('should display duration when present', () => {
    const events = [mockLearningEvents[0]];
    render(<EventTimeline events={events} />);

    // 1800 seconds = 30 minutes
    expect(screen.getByText(/30 min/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EventTimeline events={[]} className="custom-timeline" />
    );

    expect(container.querySelector('.custom-timeline')).toBeInTheDocument();
  });

  it('should handle events without optional fields', () => {
    const minimalEvent = {
      ...mockLearningEvents[4], // login event
      score: null,
      duration: null,
      content: undefined,
      course: undefined,
    };

    render(<EventTimeline events={[minimalEvent]} />);

    // Should still render without errors
    expect(screen.getByTestId('event-timeline')).toBeInTheDocument();
  });
});
