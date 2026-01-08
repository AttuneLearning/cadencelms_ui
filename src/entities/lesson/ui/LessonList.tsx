/**
 * LessonList Component
 * Displays a list of lessons with optional progress tracking
 */

import React from 'react';
import { LessonCard } from './LessonCard';
import type { LessonListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { BookOpen } from 'lucide-react';

interface LessonListProps {
  lessons: LessonListItem[];
  courseId: string;
  className?: string;
  showProgress?: boolean;
  emptyMessage?: string;
  onLessonClick?: (lesson: LessonListItem) => void;
}

export const LessonList: React.FC<LessonListProps> = ({
  lessons,
  courseId,
  className,
  showProgress = false,
  emptyMessage = 'No lessons available',
  onLessonClick,
}) => {
  if (lessons.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Sort lessons by order
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className={cn('space-y-3', className)}>
      {sortedLessons.map((lesson) => (
        <LessonCard
          key={lesson._id}
          lesson={lesson}
          courseId={courseId}
          showProgress={showProgress}
          onClick={onLessonClick}
        />
      ))}
    </div>
  );
};
