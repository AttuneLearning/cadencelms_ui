/**
 * EnrollmentList Component
 * Displays a grid or list of enrollments
 */

import React from 'react';
import { EnrollmentCard } from './EnrollmentCard';
import type { EnrollmentWithCourse } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { BookOpen } from 'lucide-react';

interface EnrollmentListProps {
  enrollments: EnrollmentWithCourse[];
  className?: string;
  variant?: 'grid' | 'list';
  showProgress?: boolean;
  emptyMessage?: string;
  onContinue?: (enrollmentId: string, courseId: string) => void;
}

export const EnrollmentList: React.FC<EnrollmentListProps> = ({
  enrollments,
  className,
  variant = 'grid',
  showProgress = true,
  emptyMessage = 'No enrollments found',
  onContinue,
}) => {
  if (enrollments.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground">
            Enroll in courses to start learning
          </p>
        </div>
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
      {enrollments.map((enrollment) => (
        <EnrollmentCard
          key={enrollment._id}
          enrollment={enrollment}
          showProgress={showProgress}
          onContinue={onContinue}
        />
      ))}
    </div>
  );
};
