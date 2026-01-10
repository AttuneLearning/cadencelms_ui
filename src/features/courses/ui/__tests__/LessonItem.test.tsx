/**
 * LessonItem Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonItem } from '../LessonItem';
import type { LessonListItem } from '@/entities/course-segment/model/lessonTypes';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const mockLesson: LessonListItem = {
  id: 'lesson-1',
  order: 1,
  title: 'Introduction to Testing',
  type: 'video',
  duration: 1200,
  settings: {
    isRequired: true,
    completionCriteria: {
      type: 'view_time',
      requiredPercentage: 80,
      allowEarlyCompletion: false,
    },
  },
  isPublished: true,
};

describe('LessonItem', () => {
  it('renders lesson title', () => {
    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Introduction to Testing')).toBeInTheDocument();
  });

  it('displays correct content type icon', () => {
    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    // Video icon should be present
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });

  it('shows Required badge when lesson is required', () => {
    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows Optional badge when lesson is not required', () => {
    const optionalLesson = {
      ...mockLesson,
      settings: {
        ...mockLesson.settings,
        isRequired: false,
      },
    };

    render(
      <LessonItem
        lesson={optionalLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('displays Draft badge when lesson is not published', () => {
    const draftLesson = {
      ...mockLesson,
      isPublished: false,
    };

    render(
      <LessonItem
        lesson={draftLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    // 1200 seconds = 20 minutes
    expect(screen.getByText('20m')).toBeInTheDocument();
  });

  it('displays completion criteria label', () => {
    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('View 80%')).toBeInTheDocument();
  });

  it('calls onEdit when Edit Settings is clicked', () => {
    const onEdit = vi.fn();

    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={onEdit}
        onRemove={vi.fn()}
      />
    );

    // Open dropdown menu
    const menuButton = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(menuButton);

    // Click Edit Settings
    const editButton = screen.getByText('Edit Settings');
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockLesson);
  });

  it('calls onRemove when Remove is clicked', () => {
    const onRemove = vi.fn();

    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={onRemove}
      />
    );

    // Open dropdown menu
    const menuButton = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(menuButton);

    // Click Remove
    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(onRemove).toHaveBeenCalledWith(mockLesson.id);
  });

  it('calls onPreview when Preview is clicked', () => {
    const onPreview = vi.fn();

    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
        onPreview={onPreview}
      />
    );

    // Open dropdown menu
    const menuButton = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(menuButton);

    // Click Preview
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    expect(onPreview).toHaveBeenCalledWith(mockLesson);
  });

  it('does not show Preview option when onPreview is not provided', () => {
    render(
      <LessonItem
        lesson={mockLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    // Open dropdown menu
    const menuButton = screen.getByRole('button', { name: /more options/i });
    fireEvent.click(menuButton);

    // Preview should not be in the document
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('displays different completion criteria types correctly', () => {
    const quizLesson = {
      ...mockLesson,
      settings: {
        ...mockLesson.settings,
        completionCriteria: {
          type: 'quiz_score' as const,
          minimumScore: 70,
        },
      },
    };

    const { rerender } = render(
      <LessonItem
        lesson={quizLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Score 70%+')).toBeInTheDocument();

    // Test manual completion
    const manualLesson = {
      ...mockLesson,
      settings: {
        ...mockLesson.settings,
        completionCriteria: {
          type: 'manual' as const,
        },
      },
    };

    rerender(
      <LessonItem
        lesson={manualLesson}
        onEdit={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Manual')).toBeInTheDocument();
  });
});
