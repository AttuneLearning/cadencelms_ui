/**
 * Tests for AdminCalendarPage
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { AdminCalendarPage } from '../AdminCalendarPage';

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

describe('AdminCalendarPage', () => {
  describe('Rendering', () => {
    it('should render page title and description', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      expect(screen.getByText('System Calendar')).toBeInTheDocument();
      expect(
        screen.getByText('System-wide calendar of events, academic dates, and department activities')
      ).toBeInTheDocument();
    });

    it('should render the current month and year', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      const now = new Date();
      expect(screen.getByText(format(startOfMonth(now), 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should render weekday headers', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
        expect(screen.getByText(day)).toBeInTheDocument();
      }
    });

    it('should render navigation buttons', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should not show feed toggles (single feed)', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      expect(screen.queryByText('Feeds')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to previous month', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      const now = new Date();
      const prevMonth = subMonths(startOfMonth(now), 1);

      fireEvent.click(screen.getByLabelText('Previous month'));

      expect(screen.getByText(format(prevMonth, 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should navigate to next month', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      const now = new Date();
      const nextMonth = addMonths(startOfMonth(now), 1);

      fireEvent.click(screen.getByLabelText('Next month'));

      expect(screen.getByText(format(nextMonth, 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should navigate back to today when Today button is clicked', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      const now = new Date();
      const currentMonthLabel = format(startOfMonth(now), 'MMMM yyyy');

      // Navigate away first
      fireEvent.click(screen.getByLabelText('Next month'));
      fireEvent.click(screen.getByLabelText('Next month'));

      // Click Today
      fireEvent.click(screen.getByText('Today'));

      expect(screen.getByText(currentMonthLabel)).toBeInTheDocument();
    });
  });

  describe('Day Selection', () => {
    it('should show "Select a day" when no day is selected', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      expect(screen.getByText('Select a day')).toBeInTheDocument();
      expect(
        screen.getByText('Click a day on the calendar to see its events.')
      ).toBeInTheDocument();
    });

    it('should show selected day heading when a day cell is clicked', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      // Click on a day cell (they are buttons in the grid)
      const dayButtons = screen.getAllByRole('button').filter((btn) => {
        const text = btn.textContent?.trim() ?? '';
        return /^\d+$/.test(text);
      });

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        expect(screen.queryByText('Select a day')).not.toBeInTheDocument();
      }
    });
  });

  describe('Event Display', () => {
    it('should show "No events on this day" for days without events', () => {
      render(<AdminCalendarPage />, { wrapper: Wrapper });

      // Click a day that has no events (mock returns empty)
      const dayButtons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent?.trim() === '15'
      );

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        expect(screen.getByText('No events on this day')).toBeInTheDocument();
      }
    });
  });
});
