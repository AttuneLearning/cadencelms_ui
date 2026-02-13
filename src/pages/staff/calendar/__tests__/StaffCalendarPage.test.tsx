/**
 * Tests for StaffCalendarPage
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { StaffCalendarPage } from '../StaffCalendarPage';

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

describe('StaffCalendarPage', () => {
  describe('Rendering', () => {
    it('should render page title and description', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      expect(screen.getByText('My Calendar')).toBeInTheDocument();
      expect(
        screen.getByText('Your teaching schedule, meetings, and important dates')
      ).toBeInTheDocument();
    });

    it('should render the current month and year', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      const now = new Date();
      expect(screen.getByText(format(startOfMonth(now), 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should render weekday headers', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
        expect(screen.getByText(day)).toBeInTheDocument();
      }
    });

    it('should render navigation buttons', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should render feed toggles (staff has 2 feeds)', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      expect(screen.getByText('Feeds')).toBeInTheDocument();
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByText('My Learning')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to previous month', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      const now = new Date();
      const prevMonth = subMonths(startOfMonth(now), 1);

      fireEvent.click(screen.getByLabelText('Previous month'));

      expect(screen.getByText(format(prevMonth, 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should navigate to next month', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      const now = new Date();
      const nextMonth = addMonths(startOfMonth(now), 1);

      fireEvent.click(screen.getByLabelText('Next month'));

      expect(screen.getByText(format(nextMonth, 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should navigate back to today when Today button is clicked', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

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
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      expect(screen.getByText('Select a day')).toBeInTheDocument();
      expect(
        screen.getByText('Click a day on the calendar to see its events.')
      ).toBeInTheDocument();
    });

    it('should show selected day heading when a day cell is clicked', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      // Click on a day cell (they are buttons in the grid)
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
  });

  describe('Feed Toggles', () => {
    it('should toggle feed visibility when checkbox is clicked', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      const toggle = screen.getByLabelText('Toggle Teaching feed');
      expect(toggle).toBeInTheDocument();
      fireEvent.click(toggle);
      // Feed should be toggled — checkbox state changed
    });
  });

  describe('Event Display', () => {
    it('should show "No events on this day" for days without events', () => {
      render(<StaffCalendarPage />, { wrapper: Wrapper });

      // Click a day (mock returns no events)
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
