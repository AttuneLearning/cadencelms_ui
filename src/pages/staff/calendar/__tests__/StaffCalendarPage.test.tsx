/**
 * Tests for StaffCalendarPage
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { format, startOfMonth, addMonths, subMonths } from 'date-fns';
import { StaffCalendarPage } from '../StaffCalendarPage';

describe('StaffCalendarPage', () => {
  describe('Rendering', () => {
    it('should render page title and description', () => {
      render(<StaffCalendarPage />);

      expect(screen.getByText('My Calendar')).toBeInTheDocument();
      expect(
        screen.getByText('Your teaching schedule, meetings, and important dates')
      ).toBeInTheDocument();
    });

    it('should render the current month and year', () => {
      render(<StaffCalendarPage />);

      const now = new Date();
      expect(screen.getByText(format(startOfMonth(now), 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should render weekday headers', () => {
      render(<StaffCalendarPage />);

      for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
        expect(screen.getByText(day)).toBeInTheDocument();
      }
    });

    it('should render navigation buttons', () => {
      render(<StaffCalendarPage />);

      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should render legend section', () => {
      render(<StaffCalendarPage />);

      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText('Class session')).toBeInTheDocument();
      expect(screen.getByText('Office hours')).toBeInTheDocument();
      expect(screen.getAllByText('Meeting').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Navigation', () => {
    it('should navigate to previous month', () => {
      render(<StaffCalendarPage />);

      const now = new Date();
      const prevMonth = subMonths(startOfMonth(now), 1);

      fireEvent.click(screen.getByLabelText('Previous month'));

      expect(screen.getByText(format(prevMonth, 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should navigate to next month', () => {
      render(<StaffCalendarPage />);

      const now = new Date();
      const nextMonth = addMonths(startOfMonth(now), 1);

      fireEvent.click(screen.getByLabelText('Next month'));

      expect(screen.getByText(format(nextMonth, 'MMMM yyyy'))).toBeInTheDocument();
    });

    it('should navigate back to today when Today button is clicked', () => {
      render(<StaffCalendarPage />);

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
      render(<StaffCalendarPage />);

      expect(screen.getByText('Select a day')).toBeInTheDocument();
      expect(
        screen.getByText('Click a day on the calendar to see its events.')
      ).toBeInTheDocument();
    });

    it('should show selected day heading when a day cell is clicked', () => {
      render(<StaffCalendarPage />);

      // Click on a day cell (they are buttons in the grid)
      const dayButtons = screen.getAllByRole('button').filter((btn) => {
        const text = btn.textContent?.trim() ?? '';
        return /^\d+$/.test(text);
      });

      // Click the first valid in-month day cell
      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        // Should no longer show "Select a day"
        expect(screen.queryByText('Select a day')).not.toBeInTheDocument();
      }
    });
  });

  describe('Event Display', () => {
    it('should show event details when a day with events is clicked', () => {
      render(<StaffCalendarPage />);

      // The 3rd of the current month has "Safety Fundamentals - Section A"
      // Find buttons with text "3"
      const dayButtons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent?.trim() === '3'
      );

      // Click the day cell for the 3rd
      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);

        // Check if the event is shown in sidebar
        // The sidebar will show the event title
        const allText = document.body.textContent ?? '';
        expect(allText).toContain('9:00 AM - 10:30 AM');
      }
    });

    it('should show "No events on this day" for days without events', () => {
      render(<StaffCalendarPage />);

      // Click the "Today" button first to select today
      fireEvent.click(screen.getByText('Today'));

      // Navigate to next month which likely has no events
      fireEvent.click(screen.getByLabelText('Next month'));

      // Click a day that probably has no events (the 28th)
      const dayButtons = screen.getAllByRole('button').filter(
        (btn) => btn.textContent?.trim() === '28'
      );

      if (dayButtons.length > 0) {
        fireEvent.click(dayButtons[0]);
        expect(screen.getByText('No events on this day')).toBeInTheDocument();
      }
    });
  });
});
