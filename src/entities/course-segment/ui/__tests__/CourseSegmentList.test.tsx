/**
 * Tests for CourseSegmentList Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CourseSegmentList } from '../CourseSegmentList';
import {
  mockCourseSegmentsList,
  createMockCourseSegmentListItem,
} from '@/test/mocks/data/courseSegments';

// Wrapper component to provide Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('CourseSegmentList', () => {
  const courseId = 'course-1';

  describe('Rendering', () => {
    it('should render list of segments', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList segments={mockCourseSegmentsList} courseId={courseId} />
        </RouterWrapper>
      );

      mockCourseSegmentsList.forEach((segment) => {
        expect(screen.getByText(segment.title)).toBeInTheDocument();
      });
    });

    it('should render segments in order', () => {
      const unorderedSegments = [
        createMockCourseSegmentListItem({ title: 'Module C', order: 3 }),
        createMockCourseSegmentListItem({ title: 'Module A', order: 1 }),
        createMockCourseSegmentListItem({ title: 'Module B', order: 2 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList segments={unorderedSegments} courseId={courseId} />
        </RouterWrapper>
      );

      const titles = screen.getAllByRole('link').map((link) => link.textContent);

      // Should be ordered as A, B, C
      expect(titles[0]).toContain('Module A');
      expect(titles[1]).toContain('Module B');
      expect(titles[2]).toContain('Module C');
    });

    it('should maintain sort order with same order numbers', () => {
      const segmentsWithSameOrder = [
        createMockCourseSegmentListItem({ title: 'Module 1', order: 1 }),
        createMockCourseSegmentListItem({ title: 'Module 2', order: 1 }),
        createMockCourseSegmentListItem({ title: 'Module 3', order: 1 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segmentsWithSameOrder}
            courseId={courseId}
          />
        </RouterWrapper>
      );

      // All should render even with same order
      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Module 2')).toBeInTheDocument();
      expect(screen.getByText('Module 3')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no segments', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList segments={[]} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('No modules found')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      const customMessage = 'No course modules available';

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={[]}
            courseId={courseId}
            emptyMessage={customMessage}
          />
        </RouterWrapper>
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should handle null segments gracefully', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList segments={null as any} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('No modules found')).toBeInTheDocument();
    });

    it('should handle undefined segments gracefully', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList segments={undefined as any} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('No modules found')).toBeInTheDocument();
    });
  });

  describe('Display Options', () => {
    it('should show order badges by default', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList segments={mockCourseSegmentsList} courseId={courseId} />
        </RouterWrapper>
      );

      // Check for order badges
      mockCourseSegmentsList.forEach((segment) => {
        expect(screen.getByText(segment.order.toString())).toBeInTheDocument();
      });
    });

    it('should hide order badges when showOrder is false', () => {
      const segments = [
        createMockCourseSegmentListItem({ title: 'Module 1', order: 1 }),
        createMockCourseSegmentListItem({ title: 'Module 2', order: 2 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segments}
            courseId={courseId}
            showOrder={false}
          />
        </RouterWrapper>
      );

      // Order numbers should not be visible
      expect(screen.queryByText('1')).not.toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    it('should show type badges by default', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList segments={mockCourseSegmentsList} courseId={courseId} />
        </RouterWrapper>
      );

      // At least one type badge should be present
      expect(
        screen.getByText('SCORM') ||
        screen.getByText('Video') ||
        screen.getByText('Exercise')
      ).toBeInTheDocument();
    });

    it('should hide type badges when showType is false', () => {
      const segments = [
        createMockCourseSegmentListItem({ title: 'Module 1', type: 'scorm' }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segments}
            courseId={courseId}
            showType={false}
          />
        </RouterWrapper>
      );

      expect(screen.queryByText('SCORM')).not.toBeInTheDocument();
    });
  });

  describe('Reorder Mode', () => {
    it('should show reorder instructions when enabled', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={mockCourseSegmentsList}
            courseId={courseId}
            enableReorder={true}
          />
        </RouterWrapper>
      );

      expect(
        screen.getByText(/Drag and drop to reorder modules/)
      ).toBeInTheDocument();
    });

    it('should show count summary in reorder mode', () => {
      const segments = [
        createMockCourseSegmentListItem({ title: 'Module 1' }),
        createMockCourseSegmentListItem({ title: 'Module 2' }),
        createMockCourseSegmentListItem({ title: 'Module 3' }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segments}
            courseId={courseId}
            enableReorder={true}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Showing 3 modules in order')).toBeInTheDocument();
    });

    it('should show singular "module" for single segment', () => {
      const segments = [createMockCourseSegmentListItem({ title: 'Single Module' })];

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segments}
            courseId={courseId}
            enableReorder={true}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Showing 1 module in order')).toBeInTheDocument();
    });

    it('should not show reorder UI when disabled', () => {
      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={mockCourseSegmentsList}
            courseId={courseId}
            enableReorder={false}
          />
        </RouterWrapper>
      );

      expect(
        screen.queryByText(/Drag and drop to reorder modules/)
      ).not.toBeInTheDocument();
    });

    it('should show grip icon for dragging when reorder enabled', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentList
            segments={mockCourseSegmentsList}
            courseId={courseId}
            enableReorder={true}
          />
        </RouterWrapper>
      );

      // Check for cursor-move class which indicates drag handle
      const dragHandles = container.querySelectorAll('.cursor-move');
      expect(dragHandles.length).toBeGreaterThan(0);
    });
  });

  describe('Count Summary', () => {
    it('should display correct count for multiple segments', () => {
      const segments = Array.from({ length: 5 }, (_, i) =>
        createMockCourseSegmentListItem({ title: `Module ${i + 1}`, order: i + 1 })
      );

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segments}
            courseId={courseId}
            enableReorder={true}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Showing 5 modules in order')).toBeInTheDocument();
    });

    it('should display correct count for 10+ segments', () => {
      const segments = Array.from({ length: 15 }, (_, i) =>
        createMockCourseSegmentListItem({ title: `Module ${i + 1}`, order: i + 1 })
      );

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segments}
            courseId={courseId}
            enableReorder={true}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Showing 15 modules in order')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentList
            segments={mockCourseSegmentsList}
            courseId={courseId}
            className="custom-list-class"
          />
        </RouterWrapper>
      );

      const list = container.querySelector('.custom-list-class');
      expect(list).toBeInTheDocument();
    });

    it('should apply spacing between segments', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentList segments={mockCourseSegmentsList} courseId={courseId} />
        </RouterWrapper>
      );

      const spacedContainer = container.querySelector('.space-y-3');
      expect(spacedContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single segment', () => {
      const singleSegment = [createMockCourseSegmentListItem({ title: 'Only Module' })];

      render(
        <RouterWrapper>
          <CourseSegmentList segments={singleSegment} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Only Module')).toBeInTheDocument();
    });

    it('should handle large number of segments', () => {
      const manySegments = Array.from({ length: 100 }, (_, i) =>
        createMockCourseSegmentListItem({ title: `Module ${i + 1}`, order: i + 1 })
      );

      render(
        <RouterWrapper>
          <CourseSegmentList segments={manySegments} courseId={courseId} />
        </RouterWrapper>
      );

      // Check first and last are rendered
      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Module 100')).toBeInTheDocument();
    });

    it('should handle segments with negative order numbers', () => {
      const segmentsWithNegativeOrder = [
        createMockCourseSegmentListItem({ title: 'Module -1', order: -1 }),
        createMockCourseSegmentListItem({ title: 'Module 0', order: 0 }),
        createMockCourseSegmentListItem({ title: 'Module 1', order: 1 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segmentsWithNegativeOrder}
            courseId={courseId}
          />
        </RouterWrapper>
      );

      // All should render, sorted by order
      expect(screen.getByText('Module -1')).toBeInTheDocument();
      expect(screen.getByText('Module 0')).toBeInTheDocument();
      expect(screen.getByText('Module 1')).toBeInTheDocument();
    });

    it('should handle segments with very large order numbers', () => {
      const segmentsWithLargeOrder = [
        createMockCourseSegmentListItem({ title: 'Module 1000', order: 1000 }),
        createMockCourseSegmentListItem({ title: 'Module 9999', order: 9999 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList
            segments={segmentsWithLargeOrder}
            courseId={courseId}
          />
        </RouterWrapper>
      );

      expect(screen.getByText('Module 1000')).toBeInTheDocument();
      expect(screen.getByText('Module 9999')).toBeInTheDocument();
    });
  });

  describe('Sorting Behavior', () => {
    it('should sort by order ascending', () => {
      const unsortedSegments = [
        createMockCourseSegmentListItem({ title: 'Module 5', order: 5 }),
        createMockCourseSegmentListItem({ title: 'Module 1', order: 1 }),
        createMockCourseSegmentListItem({ title: 'Module 3', order: 3 }),
        createMockCourseSegmentListItem({ title: 'Module 2', order: 2 }),
        createMockCourseSegmentListItem({ title: 'Module 4', order: 4 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList segments={unsortedSegments} courseId={courseId} />
        </RouterWrapper>
      );

      const links = screen.getAllByRole('link');
      const titles = links.map((link) => link.textContent);

      // Verify order
      expect(titles[0]).toContain('Module 1');
      expect(titles[1]).toContain('Module 2');
      expect(titles[2]).toContain('Module 3');
      expect(titles[3]).toContain('Module 4');
      expect(titles[4]).toContain('Module 5');
    });

    it('should not mutate original segments array', () => {
      const segments = [
        createMockCourseSegmentListItem({ title: 'Module C', order: 3 }),
        createMockCourseSegmentListItem({ title: 'Module A', order: 1 }),
        createMockCourseSegmentListItem({ title: 'Module B', order: 2 }),
      ];

      const originalOrder = segments.map((s) => s.title);

      render(
        <RouterWrapper>
          <CourseSegmentList segments={segments} courseId={courseId} />
        </RouterWrapper>
      );

      // Original array should remain unchanged
      expect(segments[0].title).toBe(originalOrder[0]);
      expect(segments[1].title).toBe(originalOrder[1]);
      expect(segments[2].title).toBe(originalOrder[2]);
    });
  });

  describe('Integration Tests', () => {
    it('should render all segment types correctly', () => {
      const diverseSegments = [
        createMockCourseSegmentListItem({ title: 'SCORM Module', type: 'scorm', order: 1 }),
        createMockCourseSegmentListItem({ title: 'Video Module', type: 'video', order: 2 }),
        createMockCourseSegmentListItem({ title: 'Exercise Module', type: 'exercise', order: 3 }),
        createMockCourseSegmentListItem({ title: 'Document Module', type: 'document', order: 4 }),
        createMockCourseSegmentListItem({ title: 'Custom Module', type: 'custom', order: 5 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList segments={diverseSegments} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('SCORM Module')).toBeInTheDocument();
      expect(screen.getByText('Video Module')).toBeInTheDocument();
      expect(screen.getByText('Exercise Module')).toBeInTheDocument();
      expect(screen.getByText('Document Module')).toBeInTheDocument();
      expect(screen.getByText('Custom Module')).toBeInTheDocument();
    });

    it('should render published and unpublished segments', () => {
      const mixedSegments = [
        createMockCourseSegmentListItem({ title: 'Published Module', isPublished: true, order: 1 }),
        createMockCourseSegmentListItem({ title: 'Draft Module', isPublished: false, order: 2 }),
      ];

      render(
        <RouterWrapper>
          <CourseSegmentList segments={mixedSegments} courseId={courseId} />
        </RouterWrapper>
      );

      expect(screen.getByText('Published Module')).toBeInTheDocument();
      expect(screen.getByText('Draft Module')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument(); // Draft badge
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with segments', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentList segments={mockCourseSegmentsList} courseId={courseId} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with empty state', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentList segments={[]} courseId={courseId} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in reorder mode', () => {
      const { container } = render(
        <RouterWrapper>
          <CourseSegmentList
            segments={mockCourseSegmentsList}
            courseId={courseId}
            enableReorder={true}
          />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
