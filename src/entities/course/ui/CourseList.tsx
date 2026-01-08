/**
 * CourseList component
 * Displays a list of courses with loading and error states
 */

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { CourseCard } from './CourseCard';
import type { Course } from '../model/types';

export interface CourseListProps extends React.HTMLAttributes<HTMLDivElement> {
  courses?: Course[];
  isLoading?: boolean;
  error?: Error | null;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  showProgress?: boolean;
  showEnrollButton?: boolean;
  emptyMessage?: string;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * CourseCardSkeleton component for loading state
 */
export const CourseCardSkeleton: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="h-48 w-full rounded-t-lg" />
      <div className="p-6">
        <div className="mb-2 flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="mb-2 h-6 w-full" />
        <Skeleton className="mb-4 h-4 w-3/4" />
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CourseListError component for error state
 */
export const CourseListError: React.FC<{ error: Error; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <h3 className="mb-2 text-lg font-semibold">Error Loading Courses</h3>
      <p className="mb-4 text-sm text-muted-foreground">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * CourseListEmpty component for empty state
 */
export const CourseListEmpty: React.FC<{ message?: string }> = ({
  message = 'No courses available',
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
      role="status"
    >
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

/**
 * CourseList component
 */
export const CourseList = React.forwardRef<HTMLDivElement, CourseListProps>(
  (
    {
      courses,
      isLoading = false,
      error = null,
      onEnroll,
      onView,
      showProgress = false,
      showEnrollButton = false,
      emptyMessage,
      columns = 3,
      className,
      ...props
    },
    ref
  ) => {
    // Loading state
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            'grid gap-6',
            {
              'grid-cols-1': columns === 1,
              'grid-cols-1 md:grid-cols-2': columns === 2,
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
            },
            className
          )}
          {...props}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div ref={ref} className={className} {...props}>
          <CourseListError error={error} />
        </div>
      );
    }

    // Empty state
    if (!courses || courses.length === 0) {
      return (
        <div ref={ref} className={className} {...props}>
          <CourseListEmpty message={emptyMessage} />
        </div>
      );
    }

    // Success state with courses
    return (
      <div
        ref={ref}
        className={cn(
          'grid gap-6',
          {
            'grid-cols-1': columns === 1,
            'grid-cols-1 md:grid-cols-2': columns === 2,
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
          },
          className
        )}
        role="list"
        {...props}
      >
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={onEnroll}
            onView={onView}
            showProgress={showProgress}
            showEnrollButton={showEnrollButton}
            role="listitem"
          />
        ))}
      </div>
    );
  }
);

CourseList.displayName = 'CourseList';
