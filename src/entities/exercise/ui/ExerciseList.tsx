/**
 * ExerciseList Component
 * Displays a grid or list of exercises with filtering
 */

import React from 'react';
import { ExerciseCard } from './ExerciseCard';
import type { ExerciseListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface ExerciseListProps {
  exercises: ExerciseListItem[];
  className?: string;
  variant?: 'grid' | 'list';
  showDepartment?: boolean;
  emptyMessage?: string;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  className,
  variant = 'grid',
  showDepartment = true,
  emptyMessage = 'No exercises found',
}) => {
  if (exercises.length === 0) {
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
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.id} exercise={exercise} showDepartment={showDepartment} />
      ))}
    </div>
  );
};
