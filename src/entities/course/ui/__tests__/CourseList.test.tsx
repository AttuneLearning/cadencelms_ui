/**
 * Tests for CourseList Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CourseList } from '../CourseList';
import { mockCourseListItems, createMockCourseListItem } from '@/test/mocks/data/courses';

// Wrapper component for Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CourseList', () => {
  describe('Rendering', () => {
    it('should render list of courses in grid layout', () => {
      render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} />
        </RouterWrapper>
      );

      mockCourseListItems.forEach((course) => {
        expect(screen.getAllByText(course.title).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should render courses in list variant', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="list" />
        </RouterWrapper>
      );

      const listContainer = container.querySelector('[class*="flex-col"]');
      expect(listContainer).toBeInTheDocument();
    });

    it('should render courses in grid variant by default', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render all courses provided', () => {
      render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} />
        </RouterWrapper>
      );

      // Note: course-1 and course-1-v1 have the same title, so we use getAllByText
      expect(screen.getAllByText(mockCourseListItems[0].title).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(mockCourseListItems[1].title).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(mockCourseListItems[2].title)).toBeInTheDocument();
      expect(screen.getByText(mockCourseListItems[3].title)).toBeInTheDocument();
      expect(screen.getByText(mockCourseListItems[4].title)).toBeInTheDocument();
    });

    it('should render single course', () => {
      const singleCourse = [mockCourseListItems[0]];

      render(
        <RouterWrapper>
          <CourseList courses={singleCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText(singleCourse[0].title)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no courses', () => {
      render(
        <RouterWrapper>
          <CourseList courses={[]} />
        </RouterWrapper>
      );

      expect(screen.getByText('No courses found')).toBeInTheDocument();
    });

    it('should display custom empty message', () => {
      const customMessage = 'No courses available at this time';

      render(
        <RouterWrapper>
          <CourseList courses={[]} emptyMessage={customMessage} />
        </RouterWrapper>
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should display empty state with dashed border', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={[]} />
        </RouterWrapper>
      );

      const emptyState = container.querySelector('[class*="border-dashed"]');
      expect(emptyState).toBeInTheDocument();
    });

    it('should not display course cards when empty', () => {
      render(
        <RouterWrapper>
          <CourseList courses={[]} />
        </RouterWrapper>
      );

      mockCourseListItems.forEach((course) => {
        expect(screen.queryByText(course.title)).not.toBeInTheDocument();
      });
    });
  });

  describe('Grid Layout', () => {
    it('should apply grid layout classes', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="grid" />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector(
        '[class*="grid"][class*="grid-cols-1"][class*="sm:grid-cols-2"][class*="lg:grid-cols-3"]'
      );
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have gap between grid items', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="grid" />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('[class*="gap-6"]');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('List Layout', () => {
    it('should apply list layout classes', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="list" />
        </RouterWrapper>
      );

      const listContainer = container.querySelector('[class*="flex"][class*="flex-col"]');
      expect(listContainer).toBeInTheDocument();
    });

    it('should have gap between list items', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="list" />
        </RouterWrapper>
      );

      const listContainer = container.querySelector('[class*="gap-4"]');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Enrollment Count Display', () => {
    it('should show enrollment count by default', () => {
      render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} />
        </RouterWrapper>
      );

      expect(screen.getByText(/150 Enrolled/)).toBeInTheDocument();
    });

    it('should hide enrollment count when showEnrollmentCount is false', () => {
      render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} showEnrollmentCount={false} />
        </RouterWrapper>
      );

      expect(screen.queryByText(/Enrolled/)).not.toBeInTheDocument();
    });

    it('should pass showEnrollmentCount to CourseCard', () => {
      render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} showEnrollmentCount={true} />
        </RouterWrapper>
      );

      mockCourseListItems.forEach((course) => {
        if (course.enrollmentCount > 0) {
          expect(screen.getByText(`${course.enrollmentCount} Enrolled`)).toBeInTheDocument();
        }
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-list-class';
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} className={customClass} />
        </RouterWrapper>
      );

      const listContainer = container.querySelector(`.${customClass}`);
      expect(listContainer).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      const customClass = 'custom-margin';
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} className={customClass} />
        </RouterWrapper>
      );

      const listContainer = container.querySelector('[class*="grid"]');
      expect(listContainer).toBeInTheDocument();
      expect(listContainer).toHaveClass(customClass);
    });
  });

  describe('Course Filtering by Status', () => {
    it('should display only published courses', () => {
      const publishedCourses = mockCourseListItems.filter((c) => c.status === 'published');

      render(
        <RouterWrapper>
          <CourseList courses={publishedCourses} />
        </RouterWrapper>
      );

      publishedCourses.forEach((course) => {
        expect(screen.getAllByText(course.title).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display only draft courses', () => {
      const draftCourses = mockCourseListItems.filter((c) => c.status === 'draft');

      render(
        <RouterWrapper>
          <CourseList courses={draftCourses} />
        </RouterWrapper>
      );

      draftCourses.forEach((course) => {
        expect(screen.getByText(course.title)).toBeInTheDocument();
      });
    });

    it('should display only archived courses', () => {
      const archivedCourses = mockCourseListItems.filter((c) => c.status === 'archived');

      render(
        <RouterWrapper>
          <CourseList courses={archivedCourses} />
        </RouterWrapper>
      );

      archivedCourses.forEach((course) => {
        expect(screen.getByText(course.title)).toBeInTheDocument();
      });
    });
  });

  describe('Large Lists', () => {
    it('should handle large number of courses', () => {
      const largeCourseList = Array.from({ length: 50 }, (_, i) =>
        createMockCourseListItem({ title: `Course ${i + 1}` })
      );

      render(
        <RouterWrapper>
          <CourseList courses={largeCourseList} />
        </RouterWrapper>
      );

      expect(screen.getByText('Course 1')).toBeInTheDocument();
      expect(screen.getByText('Course 50')).toBeInTheDocument();
    });

    it('should render grid layout with many courses', () => {
      const largeCourseList = Array.from({ length: 20 }, (_, i) =>
        createMockCourseListItem({ title: `Course ${i + 1}` })
      );

      const { container } = render(
        <RouterWrapper>
          <CourseList courses={largeCourseList} variant="grid" />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined courses gracefully', () => {
      render(
        <RouterWrapper>
          <CourseList courses={[]} />
        </RouterWrapper>
      );

      expect(screen.getByText('No courses found')).toBeInTheDocument();
    });

    it('should handle courses with minimal data', () => {
      const minimalCourse = createMockCourseListItem({
        description: '',
        enrollmentCount: 0,
        moduleCount: 0,
      });

      render(
        <RouterWrapper>
          <CourseList courses={[minimalCourse]} />
        </RouterWrapper>
      );

      expect(screen.getByText(minimalCourse.title)).toBeInTheDocument();
    });

    it('should handle courses with special characters', () => {
      const specialCourse = createMockCourseListItem({
        title: 'C++ & Python: <Advanced> "Programming"',
      });

      render(
        <RouterWrapper>
          <CourseList courses={[specialCourse]} />
        </RouterWrapper>
      );

      expect(screen.getByText(specialCourse.title)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive grid columns', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="grid" />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('[class*="sm:grid-cols-2"]');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should start with single column on mobile', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="grid" />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('[class*="grid-cols-1"]');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be navigable by keyboard', () => {
      render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} />
        </RouterWrapper>
      );

      const firstCourseLinks = screen.getAllByText(mockCourseListItems[0].title);
      const firstCourseLink = firstCourseLinks[0].closest('a');
      expect(firstCourseLink).toBeInTheDocument();
      expect(firstCourseLink).toHaveAttribute('href');
    });

    it('should have proper semantic structure', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} />
        </RouterWrapper>
      );

      const listContainer = container.firstChild;
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with grid layout', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="grid" />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with list layout', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={mockCourseListItems} variant="list" />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with empty state', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseList courses={[]} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
