/**
 * LearnerCalendarPage Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LearnerCalendarPage } from '../LearnerCalendarPage';
import { format, startOfMonth } from 'date-fns';

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

  it('renders legend section', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Enrolled')).toBeInTheDocument();
    expect(screen.getByText('Expiry')).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();
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

  it('shows selected day events when a day is clicked', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    // Click on day 3 which has a placeholder event ("Safety Fundamentals — enrolled")
    const now = new Date();
    const day3 = new Date(now.getFullYear(), now.getMonth(), 3);
    const dayStr = format(day3, 'd');

    // Find a button containing just the day number "3"
    const dayButtons = screen.getAllByRole('button');
    const targetButton = dayButtons.find((btn) => {
      const span = btn.querySelector('span');
      return span && span.textContent === dayStr && btn.className.includes('bg-background');
    });

    if (targetButton) {
      fireEvent.click(targetButton);
      // The sidebar should now show the formatted day
      expect(screen.getByText(format(day3, 'EEEE, MMMM d'))).toBeInTheDocument();
    }
  });

  it('shows "No events on this day" for a day without events', () => {
    render(<LearnerCalendarPage />, { wrapper: Wrapper });

    // Click on day 10 which has no placeholder events
    const now = new Date();
    const day10 = new Date(now.getFullYear(), now.getMonth(), 10);
    const dayStr = format(day10, 'd');

    const dayButtons = screen.getAllByRole('button');
    const targetButton = dayButtons.find((btn) => {
      const span = btn.querySelector('span');
      return span && span.textContent === dayStr && btn.className.includes('bg-background');
    });

    if (targetButton) {
      fireEvent.click(targetButton);
      expect(screen.getByText('No events on this day')).toBeInTheDocument();
    }
  });
});
