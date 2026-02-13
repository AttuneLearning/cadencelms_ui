import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CalendarWidget } from '../CalendarWidget';
import type { CalendarFeed } from '@/entities/calendar-event';

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();

function createTestFeed(overrides: Partial<CalendarFeed> = {}): CalendarFeed {
  return {
    id: 'learner',
    label: 'My Events',
    color: 'primary',
    enabled: true,
    isLoading: false,
    events: [
      {
        id: 'p1',
        feedId: 'learner',
        kind: 'point',
        title: 'Test Point Event',
        date: new Date(y, m, 15).toISOString(),
        eventType: 'deadline',
      },
      {
        id: 's1',
        feedId: 'learner',
        kind: 'span',
        title: 'Test Span Event',
        startDate: new Date(y, m, 10).toISOString(),
        endDate: new Date(y, m, 20).toISOString(),
        eventType: 'enrollment-start',
      },
    ],
    ...overrides,
  };
}

function renderWidget(
  props: Partial<React.ComponentProps<typeof CalendarWidget>> = {}
) {
  const defaultProps: React.ComponentProps<typeof CalendarWidget> = {
    currentMonth: new Date(y, m, 1),
    selectedDay: null,
    feeds: [createTestFeed()],
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
    onToday: vi.fn(),
    onSelectDay: vi.fn(),
    onToggleFeed: vi.fn(),
    ...props,
  };

  return render(
    <BrowserRouter>
      <CalendarWidget {...defaultProps} />
    </BrowserRouter>
  );
}

describe('CalendarWidget', () => {
  describe('Rendering', () => {
    it('renders the month navigation', () => {
      renderWidget();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });

    it('renders weekday headers', () => {
      renderWidget();
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('renders day numbers', () => {
      renderWidget();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders the sidebar with default prompt', () => {
      renderWidget();
      expect(screen.getByText('Select a day')).toBeInTheDocument();
      expect(
        screen.getByText('Click a day on the calendar to see its events.')
      ).toBeInTheDocument();
    });

    it('shows loading state when feeds are loading', () => {
      renderWidget({
        feeds: [createTestFeed({ isLoading: true })],
      });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('calls onPrevMonth when previous button is clicked', () => {
      const onPrevMonth = vi.fn();
      renderWidget({ onPrevMonth });
      fireEvent.click(screen.getByLabelText('Previous month'));
      expect(onPrevMonth).toHaveBeenCalledTimes(1);
    });

    it('calls onNextMonth when next button is clicked', () => {
      const onNextMonth = vi.fn();
      renderWidget({ onNextMonth });
      fireEvent.click(screen.getByLabelText('Next month'));
      expect(onNextMonth).toHaveBeenCalledTimes(1);
    });

    it('calls onToday when today button is clicked', () => {
      const onToday = vi.fn();
      renderWidget({ onToday });
      fireEvent.click(screen.getByText('Today'));
      expect(onToday).toHaveBeenCalledTimes(1);
    });
  });

  describe('Day Selection', () => {
    it('calls onSelectDay when a day is clicked', () => {
      const onSelectDay = vi.fn();
      renderWidget({ onSelectDay });
      fireEvent.click(screen.getByText('15'));
      expect(onSelectDay).toHaveBeenCalledTimes(1);
    });

    it('shows selected day events in sidebar', () => {
      renderWidget({
        selectedDay: new Date(y, m, 15),
      });
      // Should show the event chip for the point event
      expect(screen.getByText('Test Point Event')).toBeInTheDocument();
    });

    it('shows "No events on this day" for empty days', () => {
      renderWidget({
        selectedDay: new Date(y, m, 1),
        feeds: [createTestFeed({ events: [] })],
      });
      expect(screen.getByText('No events on this day')).toBeInTheDocument();
    });
  });

  describe('Feed Toggles', () => {
    it('shows feed toggles when multiple feeds are present', () => {
      renderWidget({
        feeds: [
          createTestFeed({ id: 'staff', label: 'Teaching', color: 'violet' }),
          createTestFeed({ id: 'learner', label: 'My Learning', color: 'primary' }),
        ],
      });
      expect(screen.getByText('Feeds')).toBeInTheDocument();
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByText('My Learning')).toBeInTheDocument();
    });

    it('does not show feed toggles for a single feed', () => {
      renderWidget({
        feeds: [createTestFeed()],
      });
      expect(screen.queryByText('Feeds')).not.toBeInTheDocument();
    });

    it('calls onToggleFeed when a feed checkbox is clicked', () => {
      const onToggleFeed = vi.fn();
      renderWidget({
        feeds: [
          createTestFeed({ id: 'staff', label: 'Teaching', color: 'violet' }),
          createTestFeed({ id: 'learner', label: 'My Learning', color: 'primary' }),
        ],
        onToggleFeed,
      });
      fireEvent.click(screen.getByLabelText('Toggle Teaching feed'));
      expect(onToggleFeed).toHaveBeenCalledWith('staff');
    });
  });

  describe('Span Bars', () => {
    it('renders span bar segments', () => {
      renderWidget();
      // The span event title should appear in the bar overlay
      const spanBars = screen.getAllByTitle('Test Span Event');
      expect(spanBars.length).toBeGreaterThanOrEqual(1);
    });
  });
});
