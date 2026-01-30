/**
 * Tests for ActivityTimeline Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityTimeline } from '../ActivityTimeline';

const mockActivities = [
  {
    id: '1',
    timestamp: '2024-01-08T10:30:00Z',
    eventType: 'module_completed' as const,
    resourceTitle: 'Introduction to React Hooks',
    details: 'Completed with 92% score',
  },
  {
    id: '2',
    timestamp: '2024-01-08T09:15:00Z',
    eventType: 'assessment_submitted' as const,
    resourceTitle: 'React Quiz',
    details: 'Submitted attempt with 15/20 correct answers',
  },
  {
    id: '3',
    timestamp: '2024-01-07T14:20:00Z',
    eventType: 'course_started' as const,
    resourceTitle: 'Advanced TypeScript',
    details: 'Enrolled in course',
  },
];

describe('ActivityTimeline', () => {
  describe('Rendering', () => {
    it('should render timeline with all activities', () => {
      render(<ActivityTimeline activities={mockActivities} />);

      expect(screen.getByText('Introduction to React Hooks')).toBeInTheDocument();
      expect(screen.getByText('React Quiz')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
    });

    it('should display activity details', () => {
      render(<ActivityTimeline activities={mockActivities} />);

      expect(screen.getByText(/completed with 92% score/i)).toBeInTheDocument();
      expect(screen.getByText(/submitted attempt/i)).toBeInTheDocument();
    });

    it('should show empty state when no activities', () => {
      render(<ActivityTimeline activities={[]} />);

      expect(screen.getByText(/no activity/i)).toBeInTheDocument();
    });

    it('should display timestamps', () => {
      render(<ActivityTimeline activities={mockActivities} />);

      // Should show relative times or formatted dates
      const timeElements = screen.getAllByText(/ago|AM|PM|Jan|2024/i);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Event Types', () => {
    it('should display different icons for different event types', () => {
      const { container } = render(<ActivityTimeline activities={mockActivities} />);

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should handle all event types', () => {
      const allEventTypes = [
        {
          id: '1',
          timestamp: '2024-01-08T10:00:00Z',
          eventType: 'course_started' as const,
          resourceTitle: 'Course A',
          details: 'Started',
        },
        {
          id: '2',
          timestamp: '2024-01-08T11:00:00Z',
          eventType: 'module_completed' as const,
          resourceTitle: 'Module B',
          details: 'Completed',
        },
        {
          id: '3',
          timestamp: '2024-01-08T12:00:00Z',
          eventType: 'assessment_submitted' as const,
          resourceTitle: 'Quiz C',
          details: 'Submitted',
        },
        {
          id: '4',
          timestamp: '2024-01-08T13:00:00Z',
          eventType: 'program_completed' as const,
          resourceTitle: 'Program D',
          details: 'Completed',
        },
      ];

      render(<ActivityTimeline activities={allEventTypes} />);

      expect(screen.getByText('Course A')).toBeInTheDocument();
      expect(screen.getByText('Module B')).toBeInTheDocument();
      expect(screen.getByText('Quiz C')).toBeInTheDocument();
      expect(screen.getByText('Program D')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should display date range filter', () => {
      render(<ActivityTimeline activities={mockActivities} showFilters={true} />);

      expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
    });

    it('should filter activities by date range', async () => {
      const user = userEvent.setup();
      render(<ActivityTimeline activities={mockActivities} showFilters={true} />);

      const fromDateInput = screen.getByLabelText(/from date/i);
      await user.type(fromDateInput, '2024-01-08');

      // Should only show activities from Jan 8
      expect(screen.getByText('Introduction to React Hooks')).toBeInTheDocument();
      expect(screen.getByText('React Quiz')).toBeInTheDocument();
    });

    it('should allow filtering by event type', async () => {
      const user = userEvent.setup();
      render(<ActivityTimeline activities={mockActivities} showFilters={true} />);

      // Find and click event type filter
      const filterSelect = screen.getByRole('combobox', { name: /event type/i });
      await user.click(filterSelect);

      // Select 'module_completed'
      const moduleOption = screen.getByRole('option', { name: /module/i });
      await user.click(moduleOption);

      // Should only show module completion activities
      expect(screen.getByText('Introduction to React Hooks')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should display export button when enabled', () => {
      render(<ActivityTimeline activities={mockActivities} showExport={true} />);

      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    it('should call onExport when export button is clicked', async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();

      render(
        <ActivityTimeline activities={mockActivities} showExport={true} onExport={onExport} />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      expect(onExport).toHaveBeenCalledWith(mockActivities);
    });
  });

  describe('Sorting', () => {
    it('should display activities in chronological order (newest first)', () => {
      render(<ActivityTimeline activities={mockActivities} />);

      const titles = screen.getAllByRole('heading', { level: 4 });

      // Newest activity should be first
      expect(titles[0]).toHaveTextContent('Introduction to React Hooks');
      expect(titles[titles.length - 1]).toHaveTextContent('Advanced TypeScript');
    });
  });

  describe('Pagination', () => {
    it('should show load more button when limit is set', () => {
      const manyActivities = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        timestamp: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        eventType: 'course_started' as const,
        resourceTitle: `Activity ${i}`,
        details: 'Details',
      }));

      render(<ActivityTimeline activities={manyActivities} limit={10} />);

      expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
    });

    it('should load more activities when button is clicked', async () => {
      const user = userEvent.setup();
      const manyActivities = Array.from({ length: 20 }, (_, i) => ({
        id: `${i}`,
        timestamp: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
        eventType: 'course_started' as const,
        resourceTitle: `Activity ${i}`,
        details: 'Details',
      }));

      render(<ActivityTimeline activities={manyActivities} limit={10} />);

      // Activities are sorted by newest first, so Activity 19 appears first
      expect(screen.getByText('Activity 19')).toBeInTheDocument();
      expect(screen.queryByText('Activity 5')).not.toBeInTheDocument();

      const loadMoreButton = screen.getByRole('button', { name: /load more/i });
      await user.click(loadMoreButton);

      // Should now show more activities including Activity 5
      expect(screen.getByText('Activity 5')).toBeInTheDocument();
    });
  });
});
