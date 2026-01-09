/**
 * Program List Component
 * Displays a list or grid of programs
 */

import { ProgramCard } from './ProgramCard';
import { Skeleton } from '@/shared/ui/skeleton';
import { BookOpen } from 'lucide-react';
import type { ProgramListItem } from '../model/types';

interface ProgramListProps {
  programs: ProgramListItem[];
  variant?: 'grid' | 'list';
  emptyMessage?: string;
  isLoading?: boolean;
  onProgramClick?: (program: ProgramListItem) => void;
}

export function ProgramList({
  programs,
  variant = 'grid',
  emptyMessage = 'No programs found',
  isLoading = false,
  onProgramClick,
}: ProgramListProps) {
  if (isLoading) {
    return (
      <div
        className={
          variant === 'grid'
            ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-4'
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <ProgramCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-2 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        variant === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-4'
      }
    >
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          program={program}
          onClick={onProgramClick ? () => onProgramClick(program) : undefined}
        />
      ))}
    </div>
  );
}

function ProgramCardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-3 gap-4 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
