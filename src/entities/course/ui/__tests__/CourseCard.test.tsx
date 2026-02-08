/**
 * Tests for CourseCard Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CourseCard } from '../CourseCard';
import {
  mockCourseListItems,
  createMockCourseListItem,
} from '@/test/mocks/data/courses';

// Wrapper component for Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CourseCard', () => {
  describe('Rendering', () => {
    it('should render with published course', () => {
      const publishedCourse = mockCourseListItems[0]; // Published course

      render(
        <RouterWrapper>
          <CourseCard course={publishedCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText(publishedCourse.title)).toBeInTheDocument();
      expect(screen.getByText(publishedCourse.code)).toBeInTheDocument();
      expect(screen.getByText(publishedCourse.description)).toBeInTheDocument();
    });

    it('should render with draft course', () => {
      const draftCourse = mockCourseListItems[3]; // Draft course

      render(
        <RouterWrapper>
          <CourseCard course={draftCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText(draftCourse.title)).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should render with archived course', () => {
      const archivedCourse = mockCourseListItems[4]; // Archived course

      render(
        <RouterWrapper>
          <CourseCard course={archivedCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText(archivedCourse.title)).toBeInTheDocument();
      expect(screen.getByText('archived')).toBeInTheDocument();
    });

    it('should display course code in monospace font', () => {
      const course = mockCourseListItems[0];

      const { container } = render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      const codeElement = screen.getByText(course.code);
      expect(codeElement).toBeInTheDocument();
      // The badge element itself has font-mono class
      const badge = container.querySelector('[class*="font-mono"]');
      expect(badge).toBeInTheDocument();
    });

    it('should display course description when provided', () => {
      const course = mockCourseListItems[0];

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText(course.description)).toBeInTheDocument();
    });

    it('should not crash when description is missing', () => {
      const course = createMockCourseListItem({ description: '' });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText(course.title)).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display published status badge', () => {
      const publishedCourse = mockCourseListItems[0];

      render(
        <RouterWrapper>
          <CourseCard course={publishedCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText('published')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('should display draft status badge', () => {
      const draftCourse = mockCourseListItems[3];

      render(
        <RouterWrapper>
          <CourseCard course={draftCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should display archived status badge', () => {
      const archivedCourse = mockCourseListItems[4];

      render(
        <RouterWrapper>
          <CourseCard course={archivedCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText('archived')).toBeInTheDocument();
    });

    it('should show Published badge only for published courses', () => {
      const publishedCourse = mockCourseListItems[0];
      const { rerender } = render(
        <RouterWrapper>
          <CourseCard course={publishedCourse} />
        </RouterWrapper>
      );

      expect(screen.getByText('Published')).toBeInTheDocument();

      const draftCourse = mockCourseListItems[3];
      rerender(
        <RouterWrapper>
          <CourseCard course={draftCourse} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Published')).not.toBeInTheDocument();
    });
  });

  describe('Department and Program', () => {
    it('should display department name', () => {
      const course = mockCourseListItems[0];

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('Department:')).toBeInTheDocument();
      expect(screen.getByText(course.department.name)).toBeInTheDocument();
    });

    it('should display program name when assigned', () => {
      const course = mockCourseListItems[0]; // Has program

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('Program:')).toBeInTheDocument();
      expect(screen.getByText(course.program!.name)).toBeInTheDocument();
    });

    it('should not display program section when not assigned', () => {
      const course = mockCourseListItems[4]; // No program

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Program:')).not.toBeInTheDocument();
    });
  });

  describe('Course Metadata', () => {
    it('should display module count', () => {
      const course = mockCourseListItems[0];

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText(`${course.moduleCount} Modules`)).toBeInTheDocument();
    });

    it('should display duration in hours', () => {
      const course = mockCourseListItems[0]; // 40 hours

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('40h')).toBeInTheDocument();
    });

    it('should display duration with minutes', () => {
      const course = createMockCourseListItem({ duration: 2.5 }); // 2.5 hours

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });

    it('should display duration in minutes when less than 1 hour', () => {
      const course = createMockCourseListItem({ duration: 0.5 }); // 30 minutes

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    it('should display "No duration" when duration is 0', () => {
      const course = createMockCourseListItem({ duration: 0 });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('No duration')).toBeInTheDocument();
    });

    it('should display credits when greater than 0', () => {
      const course = mockCourseListItems[0]; // 3 credits

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText(`${course.credits} Credits`)).toBeInTheDocument();
    });

    it('should not display credits when 0', () => {
      const course = createMockCourseListItem({ credits: 0 });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.queryByText(/Credits/)).not.toBeInTheDocument();
    });

    it('should display enrollment count by default', () => {
      const course = mockCourseListItems[0]; // 150 enrolled

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText(`${course.enrollmentCount} Enrolled`)).toBeInTheDocument();
    });

    it('should hide enrollment count when showEnrollmentCount is false', () => {
      const course = mockCourseListItems[0];

      render(
        <RouterWrapper>
          <CourseCard course={course} showEnrollmentCount={false} />
        </RouterWrapper>
      );

      expect(screen.queryByText(/Enrolled/)).not.toBeInTheDocument();
    });
  });

  describe('Instructors', () => {
    it('should display single instructor', () => {
      const course = mockCourseListItems[0]; // 1 instructor

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('Instructors:')).toBeInTheDocument();
      const instructor = course.instructors[0];
      expect(
        screen.getByText(`${instructor.firstName} ${instructor.lastName}`)
      ).toBeInTheDocument();
    });

    it('should display multiple instructors', () => {
      const course = mockCourseListItems[1]; // 2 instructors

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      const instructorNames = course.instructors
        .map((i) => `${i.firstName} ${i.lastName}`)
        .join(', ');
      expect(screen.getByText(instructorNames)).toBeInTheDocument();
    });

    it('should not display instructors section when empty', () => {
      const course = createMockCourseListItem({ instructors: [] });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Instructors:')).not.toBeInTheDocument();
    });
  });

  describe('Course Settings', () => {
    it('should display self-enrollment badge when enabled', () => {
      const course = mockCourseListItems[0]; // allowSelfEnrollment: true

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('Self-Enrollment')).toBeInTheDocument();
    });

    it('should not display self-enrollment badge when disabled', () => {
      const course = mockCourseListItems[2]; // allowSelfEnrollment: false

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Self-Enrollment')).not.toBeInTheDocument();
    });

    it('should display certificate badge when enabled', () => {
      const course = mockCourseListItems[0]; // certificateEnabled: true

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('Certificate')).toBeInTheDocument();
    });

    it('should not display certificate badge when disabled', () => {
      const course = mockCourseListItems[2]; // certificateEnabled: false

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Certificate')).not.toBeInTheDocument();
    });

    it('should display both settings badges when both enabled', () => {
      const course = mockCourseListItems[0];

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('Self-Enrollment')).toBeInTheDocument();
      expect(screen.getByText('Certificate')).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const course = mockCourseListItems[0];
      const customClass = 'custom-test-class';

      const { container } = render(
        <RouterWrapper>
          <CourseCard course={course} className={customClass} />
        </RouterWrapper>
      );

      const card = container.querySelector('.custom-test-class');
      expect(card).toBeInTheDocument();
    });

    it('should have hover shadow effect', () => {
      const course = mockCourseListItems[0];

      const { container } = render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      const card = container.querySelector('[class*="hover:shadow-lg"]');
      expect(card).toBeInTheDocument();
    });

    it('should render as a link to course detail page', () => {
      const course = mockCourseListItems[0];

      const { container } = render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      const link = container.querySelector(`a[href="/courses/${course.id}"]`);
      expect(link).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long course title', () => {
      const course = createMockCourseListItem({
        title:
          'This is an extremely long course title that should be truncated in the UI to prevent layout issues',
      });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      const titleElement = screen.getByText(course.title);
      expect(titleElement).toBeInTheDocument();
      // The title has line-clamp-2 class
      expect(titleElement).toHaveClass('line-clamp-2');
    });

    it('should handle very long description', () => {
      const course = createMockCourseListItem({
        description:
          'This is an extremely long course description that should be truncated in the UI. It contains a lot of text that would normally overflow the card boundaries and cause layout issues if not properly handled.',
      });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      const descriptionElement = screen.getByText(course.description);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass('line-clamp-2');
    });

    it('should handle course with many instructors', () => {
      const course = createMockCourseListItem({
        instructors: [
          { id: 'i1', firstName: 'John', lastName: 'Doe', email: 'j1@test.com' },
          { id: 'i2', firstName: 'Jane', lastName: 'Smith', email: 'j2@test.com' },
          { id: 'i3', firstName: 'Bob', lastName: 'Johnson', email: 'j3@test.com' },
          { id: 'i4', firstName: 'Alice', lastName: 'Williams', email: 'j4@test.com' },
        ],
      });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      const instructorNames = 'John Doe, Jane Smith, Bob Johnson, Alice Williams';
      expect(screen.getByText(instructorNames)).toBeInTheDocument();
    });

    it('should handle course with large enrollment count', () => {
      const course = createMockCourseListItem({ enrollmentCount: 9999 });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('9999 Enrolled')).toBeInTheDocument();
    });

    it('should handle course with 0 modules', () => {
      const course = createMockCourseListItem({ moduleCount: 0 });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText('0 Modules')).toBeInTheDocument();
    });

    it('should handle course with special characters in title', () => {
      const course = createMockCourseListItem({
        title: 'C++ & Python: Advanced Programming <Techniques>',
      });

      render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(screen.getByText(course.title)).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for published course', () => {
      const course = mockCourseListItems[0];

      const { container } = render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for draft course', () => {
      const course = mockCourseListItems[3];

      const { container } = render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for archived course', () => {
      const course = mockCourseListItems[4];

      const { container } = render(
        <RouterWrapper>
          <CourseCard course={course} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
