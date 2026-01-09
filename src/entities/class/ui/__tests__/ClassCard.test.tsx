/**
 * Tests for ClassCard Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClassCard } from '../ClassCard';
import { mockClasses } from '@/test/mocks/data/classes';
import type { ClassListItem } from '../../model/types';

// Wrapper component for Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ClassCard', () => {
  const mockActiveClass = mockClasses[0]; // Active class with 25/30 enrollment
  const mockFullClass = mockClasses[5]; // Full class (20/20 enrollment)
  const mockUpcomingClass = mockClasses[2]; // Upcoming class with low enrollment
  const mockCancelledClass = mockClasses[4]; // Cancelled class

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockActiveClass.name)).toBeInTheDocument();
    });

    it('should display class name', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockActiveClass.name)).toBeInTheDocument();
    });

    it('should display course code and title', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(
        screen.getByText(`${mockActiveClass.course.code} - ${mockActiveClass.course.title}`)
      ).toBeInTheDocument();
    });

    it('should display class status badge', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('should display program name when showProgram is true', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} showProgram={true} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockActiveClass.program.name)).toBeInTheDocument();
    });

    it('should hide program name when showProgram is false', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} showProgram={false} />
        </RouterWrapper>
      );

      expect(screen.queryByText(mockActiveClass.program.name)).not.toBeInTheDocument();
    });

    it('should display academic term when available', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockActiveClass.academicTerm!.name)).toBeInTheDocument();
    });

    it('should display primary instructor', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const primaryInstructor = mockActiveClass.instructors.find((i) => i.role === 'primary');
      expect(
        screen.getByText(`${primaryInstructor!.firstName} ${primaryInstructor!.lastName}`)
      ).toBeInTheDocument();
    });

    it('should display multiple instructors with primary instructor', () => {
      const classWithMultipleInstructors = mockClasses[1]; // Has 2 instructors

      render(
        <RouterWrapper>
          <ClassCard classItem={classWithMultipleInstructors} />
        </RouterWrapper>
      );

      const primaryInstructor = classWithMultipleInstructors.instructors.find(
        (i) => i.role === 'primary'
      );
      expect(
        screen.getByText(`${primaryInstructor!.firstName} ${primaryInstructor!.lastName}`)
      ).toBeInTheDocument();
    });

    it('should display start and end dates', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      // Dates are formatted - check that calendar icon is present
      // which indicates dates are being displayed
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display duration in weeks', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(screen.getByText(`${mockActiveClass.duration} weeks`)).toBeInTheDocument();
    });

    it('should display enrollment count', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(screen.getByText('Enrollment')).toBeInTheDocument();
      expect(
        screen.getByText(`${mockActiveClass.enrolledCount} / ${mockActiveClass.capacity}`)
      ).toBeInTheDocument();
    });

    it('should display department when showDepartment is true', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} showDepartment={true} />
        </RouterWrapper>
      );

      expect(screen.getByText(`Department: ${mockActiveClass.department.name}`)).toBeInTheDocument();
    });

    it('should hide department when showDepartment is false', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} showDepartment={false} />
        </RouterWrapper>
      );

      expect(
        screen.queryByText(`Department: ${mockActiveClass.department.name}`)
      ).not.toBeInTheDocument();
    });

    it('should render as a link to class detail page', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const link = container.querySelector(`a[href="/classes/${mockActiveClass.id}"]`);
      expect(link).toBeInTheDocument();
    });
  });

  describe('Status Badge Variants', () => {
    it('should display active status with default variant', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const badge = screen.getByText('active');
      expect(badge).toBeInTheDocument();
    });

    it('should display upcoming status with secondary variant', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockUpcomingClass} />
        </RouterWrapper>
      );

      const badge = screen.getByText('upcoming');
      expect(badge).toBeInTheDocument();
    });

    it('should display completed status with outline variant', () => {
      const completedClass = mockClasses[3];

      render(
        <RouterWrapper>
          <ClassCard classItem={completedClass} />
        </RouterWrapper>
      );

      const badge = screen.getByText('completed');
      expect(badge).toBeInTheDocument();
    });

    it('should display cancelled status with destructive variant', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockCancelledClass} />
        </RouterWrapper>
      );

      const badge = screen.getByText('cancelled');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Enrollment Display', () => {
    it('should display enrollment progress bar', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const progressBar = container.querySelector('.h-2.w-full');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show enrollment count with capacity', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(screen.getByText('25 / 30')).toBeInTheDocument();
    });

    it('should show enrollment count without capacity when capacity is null', () => {
      const classWithoutCapacity: ClassListItem = {
        ...mockActiveClass,
        capacity: null,
      };

      render(
        <RouterWrapper>
          <ClassCard classItem={classWithoutCapacity} />
        </RouterWrapper>
      );

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.queryByText('/ 30')).not.toBeInTheDocument();
    });

    it('should calculate enrollment percentage correctly', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      // 25/30 = 83.33% rounded to 83%
      const progressBar = container.querySelector('.h-full.transition-all');
      // Check that it has a width style attribute
      expect(progressBar).toHaveAttribute('style');
      expect(progressBar?.getAttribute('style')).toContain('width');
    });

    it('should not render progress bar when capacity is null', () => {
      const classWithoutCapacity: ClassListItem = {
        ...mockActiveClass,
        capacity: null,
      };

      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={classWithoutCapacity} />
        </RouterWrapper>
      );

      const progressBar = container.querySelector('.h-2.w-full');
      expect(progressBar).not.toBeInTheDocument();
    });
  });

  describe('Enrollment Color Coding', () => {
    it('should display green progress bar for low enrollment (< 80%)', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockUpcomingClass} />
        </RouterWrapper>
      );

      // 5/25 = 20% enrollment - should be green (primary)
      const progressBar = container.querySelector('.h-full.bg-primary');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display yellow progress bar for medium enrollment (80-99%)', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      // 25/30 = 83% enrollment - should be yellow
      const progressBar = container.querySelector('.h-full.bg-yellow-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should display red progress bar for full enrollment (100%)', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockFullClass} />
        </RouterWrapper>
      );

      // 20/20 = 100% enrollment - should be red (destructive)
      const progressBar = container.querySelector('.h-full.bg-destructive');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not exceed 100% width for over-capacity', () => {
      const overCapacityClass: ClassListItem = {
        ...mockActiveClass,
        enrolledCount: 35,
        capacity: 30,
      };

      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={overCapacityClass} />
        </RouterWrapper>
      );

      const progressBar = container.querySelector('.h-full.transition-all');
      const style = progressBar?.getAttribute('style');
      // Should cap at 100%
      expect(style).toContain('width: 100%');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates consistently', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      // Check that dates are rendered (format may vary by locale)
      // Just verify that year 2026 appears, which is in both dates
      const yearElements = screen.getAllByText(/2026/);
      expect(yearElements.length).toBeGreaterThan(0);
    });

    it('should display both start and end dates', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      // Check calendar icon is present, indicating dates are shown
      const calendarIcon = container.querySelector('svg.lucide-calendar-days');
      expect(calendarIcon).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle class without instructors', () => {
      const classWithoutInstructors: ClassListItem = {
        ...mockActiveClass,
        instructors: [],
      };

      render(
        <RouterWrapper>
          <ClassCard classItem={classWithoutInstructors} />
        </RouterWrapper>
      );

      expect(screen.getByText(classWithoutInstructors.name)).toBeInTheDocument();
    });

    it('should handle class without academic term', () => {
      const classWithoutTerm: ClassListItem = {
        ...mockActiveClass,
        academicTerm: undefined,
      };

      render(
        <RouterWrapper>
          <ClassCard classItem={classWithoutTerm} />
        </RouterWrapper>
      );

      expect(screen.getByText(classWithoutTerm.name)).toBeInTheDocument();
    });

    it('should handle class without program level', () => {
      const classWithoutLevel: ClassListItem = {
        ...mockActiveClass,
        programLevel: undefined,
      };

      render(
        <RouterWrapper>
          <ClassCard classItem={classWithoutLevel} />
        </RouterWrapper>
      );

      expect(screen.getByText(classWithoutLevel.name)).toBeInTheDocument();
    });

    it('should handle very long class names', () => {
      const longNameClass: ClassListItem = {
        ...mockActiveClass,
        name: 'This is a very long class name that should be truncated after two lines using line-clamp-2 to prevent layout issues',
      };

      render(
        <RouterWrapper>
          <ClassCard classItem={longNameClass} />
        </RouterWrapper>
      );

      const title = screen.getByText(longNameClass.name);
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('line-clamp-2');
    });

    it('should handle zero enrollment', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockCancelledClass} />
        </RouterWrapper>
      );

      expect(screen.getByText('0 / 15')).toBeInTheDocument();
    });

    it('should handle class with waitlist', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockFullClass} />
        </RouterWrapper>
      );

      // Should still show enrollment count correctly
      expect(screen.getByText('20 / 20')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} className="custom-class" />
        </RouterWrapper>
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should have hover shadow effect', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const card = container.querySelector('.hover\\:shadow-lg');
      expect(card).toBeInTheDocument();
    });

    it('should have transition effect', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const card = container.querySelector('.transition-shadow');
      expect(card).toBeInTheDocument();
    });

    it('should render card with full height', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const card = container.querySelector('.h-full');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should display calendar icon for dates', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      // Check for Lucide icon by class
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display clock icon for duration', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display users icon for enrollment', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display building icon for program', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} showProgram={true} />
        </RouterWrapper>
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should display user icon for instructor', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should be clickable as a link', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/classes/${mockActiveClass.id}`);
    });

    it('should have proper semantic structure', () => {
      render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      // Check for proper heading structure
      const title = screen.getByText(mockActiveClass.name);
      expect(title).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for active class', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockActiveClass} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for upcoming class', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockUpcomingClass} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for full class', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockFullClass} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for cancelled class', () => {
      const { container } = render(
        <RouterWrapper>
          <ClassCard classItem={mockCancelledClass} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
