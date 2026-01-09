/**
 * AcademicYearList Component
 * Displays a list of academic years
 */

import React from 'react';
import { AcademicYearCard } from './AcademicYearCard';
import type { AcademicYearListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/ui/skeleton';

interface AcademicYearListProps {
  academicYears: AcademicYearListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  emptyMessage?: string;
  isLoading?: boolean;
  onAcademicYearClick?: (academicYear: AcademicYearListItem) => void;
}

export const AcademicYearList: React.FC<AcademicYearListProps> = ({
  academicYears,
  className,
  variant = 'grid',
  emptyMessage = 'No academic years found',
  isLoading = false,
  onAcademicYearClick,
}) => {
  if (isLoading) {
    return (
      <div
        className={cn(
          variant === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <AcademicYearCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (academicYears.length === 0) {
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
      {academicYears.map((academicYear) => (
        <AcademicYearCard
          key={academicYear.id}
          academicYear={academicYear}
          onClick={
            onAcademicYearClick ? () => onAcademicYearClick(academicYear) : undefined
          }
        />
      ))}
    </div>
  );
};

function AcademicYearCardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
