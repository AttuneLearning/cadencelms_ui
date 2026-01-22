/**
 * ModuleList Component
 * Displays a list of modules for a course
 */

import React from 'react';
import { ModuleCard } from './ModuleCard';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { ModuleListItem } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface ModuleProgress {
  moduleId: string;
  progress: number;
  isCompleted: boolean;
}

interface ModuleListProps {
  modules: ModuleListItem[];
  isLoading?: boolean;
  error?: string;
  className?: string;
  onModuleClick?: (module: ModuleListItem) => void;
  onCreateModule?: () => void;
  canCreate?: boolean;
  moduleProgress?: ModuleProgress[];
  lockedModuleIds?: string[];
  emptyMessage?: string;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  isLoading = false,
  error,
  className,
  onModuleClick,
  onCreateModule,
  canCreate = false,
  moduleProgress = [],
  lockedModuleIds = [],
  emptyMessage = 'No modules found',
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (modules.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
        {canCreate && onCreateModule && (
          <Button onClick={onCreateModule}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Module
          </Button>
        )}
      </div>
    );
  }

  const getModuleProgress = (moduleId: string): ModuleProgress | undefined => {
    return moduleProgress.find((p) => p.moduleId === moduleId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {canCreate && onCreateModule && (
        <div className="flex justify-end">
          <Button onClick={onCreateModule}>
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const progress = getModuleProgress(module.id);
          return (
            <ModuleCard
              key={module.id}
              module={module}
              onClick={onModuleClick ? () => onModuleClick(module) : undefined}
              isLocked={lockedModuleIds.includes(module.id)}
              isCompleted={progress?.isCompleted}
              progress={progress?.progress}
            />
          );
        })}
      </div>
    </div>
  );
};
