/**
 * LearnerCalendarPage Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LearnerCalendarPage } from '../LearnerCalendarPage';
import { format, startOfMonth } from 'date-fns';

// Mock calendar-event hooks — the real hook uses React Query
vi.mock('@/entities/calendar-event', async () => {
  const actual = await vi.importActual<typeof import('@/entities/calendar-event')>(
    '@/entities/calendar-event'
  );
  return {
    ...actual,
    useCalendarFeed: () => ({
      data: { events: [] },
      isLoading: false,
      isError: false,
    }),
  };
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('LearnerCalendarPage', () => {
  it('renders page header', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    expect(screen.getByText('My Calendar')).toBeInTheDocument();
    expect(screen.getByText('Enrollment dates, deadlines, and upcoming events')).toBeInTheDocument();
  });

  it('renders current month and year', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    const now = new Date();
    const monthLabel = format(startOfMonth(now), 'MMMM yyyy');
    expect(screen.getByText(monthLabel)).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('renders navigation buttons', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('navigates to previous month', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    const now = new Date();
    const prevMonthButton = screen.getByLabelText('Previous month');
    fireEvent.click(prevMonthButton);

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevLabel = format(prevMonth, 'MMMM yyyy');
    expect(screen.getByText(prevLabel)).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    const now = new Date();
    const nextMonthButton = screen.getByLabelText('Next month');
    fireEvent.click(nextMonthButton);

    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextLabel = format(nextMonth, 'MMMM yyyy');
    expect(screen.getByText(nextLabel)).toBeInTheDocument();
  });

  it('renders today button and returns to current month', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    // Navigate away first
    const nextMonthButton = screen.getByLabelText('Next month');
    fireEvent.click(nextMonthButton);

    // Click Today
    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);

    const now = new Date();
    const currentLabel = format(startOfMonth(now), 'MMMM yyyy');
    expect(screen.getByText(currentLabel)).toBeInTheDocument();
  });

  it('shows "Select a day" when no day is selected', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    expect(screen.getByText('Select a day')).toBeInTheDocument();
    expect(screen.getByText('Click a day on the calendar to see its events.')).toBeInTheDocument();
  });

  it('shows selected day panel when a day is clicked', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    // Click a day cell
    const dayButtons = screen.getAllByRole('button').filter((btn) => {
      const text = btn.textContent?.trim() ?? '';
      return /^\d+$/.test(text);
    });

    if (dayButtons.length > 0) {
      fireEvent.click(dayButtons[0]);
      // Should no longer show "Select a day"
      expect(screen.queryByText('Select a day')).not.toBeInTheDocument();
    }
  });

  it('does not show feed toggles (single feed)', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    expect(screen.queryByText('Feeds')).not.toBeInTheDocument();
  });
});
