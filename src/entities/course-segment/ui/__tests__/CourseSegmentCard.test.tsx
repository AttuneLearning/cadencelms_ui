/**
 * Tests for CourseSegmentCard Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CourseSegmentCard } from '../CourseSegmentCard';
import {
  mockCourseSegmentsList,
  mockSegmentsByType,
  createMockCourseSegmentListItem,
} from '@/test/mocks/data/courseSegments';

// Wrapper component to provide Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CourseSegmentCard', () => {
  const courseId = 'course-1';
  const segment = mockCourseSegmentsList[0];

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText(segment.title)).toBeInTheDocument();
    });

    it('should display title and description', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText(segment.title)).toBeInTheDocument();
      if (segment.description) {
        expect(screen.getByText(segment.description)).toBeInTheDocument();
      }
    });

    it('should render without description when null', () => {
      const segmentWithoutDesc = createMockCourseSegmentListItem({
        title: 'No Description Module',
        description: null,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithoutDesc} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('No Description Module')).toBeInTheDocument();
    });

    it('should render as a link to module detail page', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', `/courses/${courseId}/modules/${segment.id}`);
    });
  });

  describe('Order Badge', () => {
    it('should display order number badge by default', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText(segment.order.toString())).toBeInTheDocument();
    });

    it('should hide order badge when showOrder is false', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} showOrder={false} />
        </RouterWrapper>
      );

      const orderBadge = screen.queryByText(segment.order.toString());
      expect(orderBadge).not.toBeInTheDocument();
    });

    it('should show correct order for different segments', () => {
      const { rerender } = render(
        <RouterWrapper>
          <CourseSegmentCard
            segment={mockCourseSegmentsList[0]}
            courseId={courseId}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('1')).toBeInTheDocument();

      rerender(
        <RouterWrapper>
          <CourseSegmentCard
            segment={mockCourseSegmentsList[2]}
            courseId={courseId}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Type Badge', () => {
    it('should display type badge by default', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.video} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Video')).toBeInTheDocument();
    });

    it('should hide type badge when showType is false', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard
            segment={mockSegmentsByType.video}
            courseId={courseId}
            showType={false}
          />
        </RouterWrapper>
      );

      expect(screen.queryByText('Video')).not.toBeInTheDocument();
    });

    it('should display SCORM badge', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.scorm} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('SCORM')).toBeInTheDocument();
    });

    it('should display Exercise badge', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.exercise} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
    });

    it('should display Custom badge', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.custom} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should display Document badge', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.document} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Document')).toBeInTheDocument();
    });
  });

  describe('Published Status', () => {
    it('should show Draft badge for unpublished segment', () => {
      const unpublishedSegment = createMockCourseSegmentListItem({
        isPublished: false,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={unpublishedSegment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should not show Draft badge for published segment', () => {
      const publishedSegment = createMockCourseSegmentListItem({
        isPublished: true,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={publishedSegment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('should format duration in seconds', () => {
      const segmentWithSeconds = createMockCourseSegmentListItem({
        duration: 45,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithSeconds} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('45s')).toBeInTheDocument();
    });

    it('should format duration in minutes', () => {
      const segmentWithMinutes = createMockCourseSegmentListItem({
        duration: 1800, // 30 minutes
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithMinutes} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    it('should format duration in hours', () => {
      const segmentWithHours = createMockCourseSegmentListItem({
        duration: 3600, // 1 hour
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithHours} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    it('should format duration in hours and minutes', () => {
      const segmentWithHoursMinutes = createMockCourseSegmentListItem({
        duration: 5400, // 1 hour 30 minutes
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithHoursMinutes} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('1h 30m')).toBeInTheDocument();
    });

    it('should not display duration when null', () => {
      const segmentWithoutDuration = createMockCourseSegmentListItem({
        duration: null,
      });

      const { container } = render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithoutDuration} courseId={courseId} />
        </RouterWrapper>
      );

      // Check that no duration text with 's', 'm', or 'h' is present
      expect(container.textContent).not.toMatch(/\d+[smh]/);
    });
  });

  describe('Passing Score', () => {
    it('should display passing score when present', () => {
      const segmentWithScore = createMockCourseSegmentListItem({
        passingScore: 80,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithScore} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText(/Pass: 80%/)).toBeInTheDocument();
    });

    it('should not display passing score when null', () => {
      const segmentWithoutScore = createMockCourseSegmentListItem({
        passingScore: null,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithoutScore} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.queryByText(/Pass:/)).not.toBeInTheDocument();
    });

    it('should display different passing scores', () => {
      const scores = [70, 80, 90];

      scores.forEach((score) => {
        const segment = createMockCourseSegmentListItem({ passingScore: score });
        const { unmount } = render(
          <RouterWrapper>
            <CourseSegmentCard segment={segment} courseId={courseId} />
          </RouterWrapper>
        );

        expect(screen.getByText(`Pass: ${score}%`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Content Indicator', () => {
    it('should show "Has Content" when contentId is present', () => {
      const segmentWithContent = createMockCourseSegmentListItem({
        contentId: 'content-123',
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithContent} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Has Content')).toBeInTheDocument();
    });

    it('should not show content indicator when contentId is null', () => {
      const segmentWithoutContent = createMockCourseSegmentListItem({
        contentId: null,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithoutContent} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Has Content')).not.toBeInTheDocument();
    });
  });

  describe('Settings Summary', () => {
    it('should show unlimited attempts message', () => {
      const segment = createMockCourseSegmentListItem({
        settings: {
          allowMultipleAttempts: true,
          maxAttempts: null,
          timeLimit: null,
          showFeedback: true,
          shuffleQuestions: false,
        },
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Unlimited attempts')).toBeInTheDocument();
    });

    it('should show max attempts when limited', () => {
      const segment = createMockCourseSegmentListItem({
        settings: {
          allowMultipleAttempts: true,
          maxAttempts: 3,
          timeLimit: null,
          showFeedback: true,
          shuffleQuestions: false,
        },
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Max 3 attempts')).toBeInTheDocument();
    });

    it('should not show attempts info when multiple attempts disabled', () => {
      const segment = createMockCourseSegmentListItem({
        settings: {
          allowMultipleAttempts: false,
          maxAttempts: null,
          timeLimit: null,
          showFeedback: true,
          shuffleQuestions: false,
        },
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.queryByText(/attempts/)).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentCard
            segment={segment}
            courseId={courseId}
            className="custom-class"
          />
        </RouterWrapper>
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should have hover effect class', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      const card = container.querySelector('.hover\\:shadow-md');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle segment with all null optional fields', () => {
      const minimalSegment = createMockCourseSegmentListItem({
        description: null,
        contentId: null,
        passingScore: null,
        duration: null,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={minimalSegment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText(minimalSegment.title)).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      const segmentWithLongTitle = createMockCourseSegmentListItem({
        title: longTitle,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithLongTitle} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle very long description', () => {
      const longDescription = 'B'.repeat(500);
      const segmentWithLongDesc = createMockCourseSegmentListItem({
        description: longDescription,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithLongDesc} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should not display zero duration (treated as falsy)', () => {
      const segmentWithZeroDuration = createMockCourseSegmentListItem({
        duration: 0,
      });

      const { container } = render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithZeroDuration} courseId={courseId} />
        </RouterWrapper>
      );

      // Zero duration is treated as falsy and not displayed
      expect(container.textContent).not.toMatch(/0s/);
    });

    it('should not display zero passing score (treated as falsy)', () => {
      const segmentWithZeroScore = createMockCourseSegmentListItem({
        passingScore: 0,
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={segmentWithZeroScore} courseId={courseId} />
        </RouterWrapper>
      );

      // Zero passing score is treated as falsy and not displayed
      expect(screen.queryByText(/Pass:/)).not.toBeInTheDocument();
    });
  });

  describe('Integration with Different Segment Types', () => {
    it('should render SCORM segment correctly', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.scorm} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('SCORM')).toBeInTheDocument();
      expect(screen.getByText(mockSegmentsByType.scorm.title)).toBeInTheDocument();
    });

    it('should render Exercise segment correctly', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard
            segment={mockSegmentsByType.exercise}
            courseId={courseId}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Exercise')).toBeInTheDocument();
      expect(screen.getByText(mockSegmentsByType.exercise.title)).toBeInTheDocument();
    });

    it('should render Video segment correctly', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.video} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Video')).toBeInTheDocument();
      expect(screen.getByText(mockSegmentsByType.video.title)).toBeInTheDocument();
    });

    it('should render Document segment correctly', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard
            segment={mockSegmentsByType.document}
            courseId={courseId}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Document')).toBeInTheDocument();
      expect(screen.getByText(mockSegmentsByType.document.title)).toBeInTheDocument();
    });

    it('should render Custom segment correctly', () => {
      render(
        <RouterWrapper>
          <CourseSegmentCard segment={mockSegmentsByType.custom} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Custom')).toBeInTheDocument();
      expect(screen.getByText(mockSegmentsByType.custom.title)).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with all fields', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentCard segment={segment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without optional display flags', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentCard
            segment={segment}
            courseId={courseId}
            showOrder={false}
            showType={false}
          />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should render unpublished segment correctly', () => {
      const unpublishedSegment = createMockCourseSegmentListItem({
        isPublished: false,
        title: 'Unpublished Test Module',
      });

      render(
        <RouterWrapper>
          <CourseSegmentCard segment={unpublishedSegment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Unpublished Test Module')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });
});
