/**
 * CourseList Component
 * Displays a grid or list of courses
 */

import React from 'react';
import { CourseCard } from './CourseCard';
import type { CourseListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface CourseListProps {
  courses: CourseListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  showProgress?: boolean;
  showEnrollmentCount?: boolean;
  emptyMessage?: string;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  className,
  variant = 'grid',
  showProgress = false,
  showEnrollmentCount = false,
  emptyMessage = 'No courses found',
}) => {
  if (courses.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-4',
        className
      )}
    >
      {courses.map((course) => (
        <CourseCard
          key={course._id}
          course={course}
          showProgress={showProgress}
          showEnrollmentCount={showEnrollmentCount}
        />
      ))}
    </div>
  );
};
