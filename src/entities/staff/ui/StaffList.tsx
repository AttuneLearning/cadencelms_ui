/**
 * StaffList Component
 * Displays a list of staff members
 */

import React from 'react';
import { StaffCard } from './StaffCard';
import type { StaffListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/ui/skeleton';

interface StaffListProps {
  staff: StaffListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  emptyMessage?: string;
  isLoading?: boolean;
  onStaffClick?: (staff: StaffListItem) => void;
}

export const StaffList: React.FC<StaffListProps> = ({
  staff,
  className,
  variant = 'grid',
  emptyMessage = 'No staff members found',
  isLoading = false,
  onStaffClick,
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
          <StaffCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (staff.length === 0) {
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
      {staff.map((member) => (
        <StaffCard
          key={member._id}
          staff={member}
          onClick={onStaffClick ? () => onStaffClick(member) : undefined}
        />
      ))}
    </div>
  );
};

function StaffCardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
