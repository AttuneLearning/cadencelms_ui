/**
 * LearnerList Component
 * Displays a list of learners
 */

import React from 'react';
import { LearnerCard } from './LearnerCard';
import type { LearnerListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/ui/skeleton';

interface LearnerListProps {
  learners: LearnerListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  emptyMessage?: string;
  isLoading?: boolean;
  onLearnerClick?: (learner: LearnerListItem) => void;
}

export const LearnerList: React.FC<LearnerListProps> = ({
  learners,
  className,
  variant = 'grid',
  emptyMessage = 'No learners found',
  isLoading = false,
  onLearnerClick,
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
          <LearnerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (learners.length === 0) {
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
      {learners.map((learner) => (
        <LearnerCard
          key={learner._id}
          learner={learner}
          onClick={onLearnerClick ? () => onLearnerClick(learner) : undefined}
        />
      ))}
    </div>
  );
};

function LearnerCardSkeleton() {
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
