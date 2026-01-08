/**
 * Tests for CourseCard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseCard } from './CourseCard';
import { CourseStatus, CourseDifficulty } from '../model/types';
import type { Course } from '../model/types';

describe('CourseCard', () => {
  const mockCourse: Course = {
    id: '1',
    title: 'Introduction to TypeScript',
    description: 'Learn TypeScript from scratch',
    thumbnail: 'https://example.com/thumbnail.jpg',
    status: CourseStatus.PUBLISHED,
    instructor: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://example.com/avatar.jpg',
      title: 'Senior Developer',
    },
    category: {
      id: '1',
      name: 'Programming',
      slug: 'programming',
    },
    metadata: {
      duration: 120,
      lessonsCount: 10,
      skillLevel: CourseDifficulty.INTERMEDIATE,
      language: 'en',
      lastUpdated: '2024-01-01T00:00:00Z',
    },
    stats: {
      totalEnrollments: 100,
      activeEnrollments: 75,
      completionRate: 0.8,
      averageRating: 4.5,
      totalReviews: 50,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('Rendering', () => {
    it('should render course title and description', () => {
      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Learn TypeScript from scratch')).toBeInTheDocument();
    });

    it('should render course thumbnail', () => {
      render(<CourseCard course={mockCourse} />);

      const thumbnail = screen.getByAltText('Introduction to TypeScript');
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute('src', 'https://example.com/thumbnail.jpg');
    });

    it('should render instructor information', () => {
      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    });

    it('should render course metadata', () => {
      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('2h')).toBeInTheDocument(); // 120 minutes
      expect(screen.getByText('10 lessons')).toBeInTheDocument();
      expect(screen.getByText('100 enrolled')).toBeInTheDocument();
      expect(screen.getByText('4.5 rating')).toBeInTheDocument();
    });

    it('should render category and difficulty badges', () => {
      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText('Programming')).toBeInTheDocument();
    });

    it('should render enrolled badge when user is enrolled', () => {
      const enrolledCourse = { ...mockCourse, isEnrolled: true };
      render(<CourseCard course={enrolledCourse} />);

      expect(screen.getByText('Enrolled')).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should show progress bar when showProgress is true and progress exists', () => {
      const courseWithProgress = { ...mockCourse, progress: 50 };
      render(<CourseCard course={courseWithProgress} showProgress />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    });

    it('should not show progress bar when showProgress is false', () => {
      const courseWithProgress = { ...mockCourse, progress: 50 };
      render(<CourseCard course={courseWithProgress} showProgress={false} />);

      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });

    it('should not show progress bar when progress is undefined', () => {
      render(<CourseCard course={mockCourse} showProgress />);

      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });
  });

  describe('Enroll Button', () => {
    it('should show enroll button when showEnrollButton is true and not enrolled', () => {
      render(<CourseCard course={mockCourse} showEnrollButton />);

      expect(screen.getByRole('button', { name: /enroll in/i })).toBeInTheDocument();
    });

    it('should not show enroll button when already enrolled', () => {
      const enrolledCourse = { ...mockCourse, isEnrolled: true };
      render(<CourseCard course={enrolledCourse} showEnrollButton />);

      expect(
        screen.queryByRole('button', { name: /enroll in/i })
      ).not.toBeInTheDocument();
    });

    it('should not show enroll button when showEnrollButton is false', () => {
      render(<CourseCard course={mockCourse} showEnrollButton={false} />);

      expect(
        screen.queryByRole('button', { name: /enroll in/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onView when card is clicked', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();

      render(<CourseCard course={mockCourse} onView={onView} />);

      const card = screen.getByRole('article', { name: /course:/i });
      await user.click(card);

      expect(onView).toHaveBeenCalledWith('1');
    });

    it('should call onEnroll when enroll button is clicked', async () => {
      const user = userEvent.setup();
      const onEnroll = vi.fn();

      render(<CourseCard course={mockCourse} onEnroll={onEnroll} showEnrollButton />);

      const enrollButton = screen.getByRole('button', { name: /enroll in/i });
      await user.click(enrollButton);

      expect(onEnroll).toHaveBeenCalledWith('1');
    });

    it('should not call onView when enroll button is clicked', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      const onEnroll = vi.fn();

      render(
        <CourseCard
          course={mockCourse}
          onView={onView}
          onEnroll={onEnroll}
          showEnrollButton
        />
      );

      const enrollButton = screen.getByRole('button', { name: /enroll in/i });
      await user.click(enrollButton);

      expect(onEnroll).toHaveBeenCalledWith('1');
      expect(onView).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CourseCard course={mockCourse} />);

      const card = screen.getByRole('article', {
        name: 'Course: Introduction to TypeScript',
      });
      expect(card).toBeInTheDocument();
    });

    it('should have accessible progress bar', () => {
      const courseWithProgress = { ...mockCourse, progress: 75 };
      render(<CourseCard course={courseWithProgress} showProgress />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have accessible enroll button', () => {
      render(<CourseCard course={mockCourse} showEnrollButton />);

      const button = screen.getByRole('button', {
        name: 'Enroll in Introduction to TypeScript',
      });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('should format duration less than 60 minutes correctly', () => {
      const course = {
        ...mockCourse,
        metadata: { ...mockCourse.metadata, duration: 45 },
      };
      render(<CourseCard course={course} />);

      expect(screen.getByText('45m')).toBeInTheDocument();
    });

    it('should format duration in hours correctly', () => {
      const course = {
        ...mockCourse,
        metadata: { ...mockCourse.metadata, duration: 180 },
      };
      render(<CourseCard course={course} />);

      expect(screen.getByText('3h')).toBeInTheDocument();
    });

    it('should format duration with hours and minutes correctly', () => {
      const course = {
        ...mockCourse,
        metadata: { ...mockCourse.metadata, duration: 150 },
      };
      render(<CourseCard course={course} />);

      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });
  });

  describe('Difficulty Variants', () => {
    it('should render beginner difficulty with correct variant', () => {
      const course = {
        ...mockCourse,
        metadata: { ...mockCourse.metadata, skillLevel: CourseDifficulty.BEGINNER },
      };
      render(<CourseCard course={course} />);

      expect(screen.getByText('beginner')).toBeInTheDocument();
    });

    it('should render advanced difficulty with correct variant', () => {
      const course = {
        ...mockCourse,
        metadata: { ...mockCourse.metadata, skillLevel: CourseDifficulty.ADVANCED },
      };
      render(<CourseCard course={course} />);

      expect(screen.getByText('advanced')).toBeInTheDocument();
    });
  });

  describe('Optional Fields', () => {
    it('should render without thumbnail', () => {
      const courseWithoutThumbnail = { ...mockCourse, thumbnail: undefined };
      render(<CourseCard course={courseWithoutThumbnail} />);

      expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
    });

    it('should render without instructor title', () => {
      const course = {
        ...mockCourse,
        instructor: { ...mockCourse.instructor, title: undefined },
      };
      render(<CourseCard course={course} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument();
    });

    it('should render without average rating', () => {
      const course = {
        ...mockCourse,
        stats: { ...mockCourse.stats, averageRating: undefined },
      };
      render(<CourseCard course={course} />);

      expect(screen.queryByText(/rating/i)).not.toBeInTheDocument();
    });
  });
});
