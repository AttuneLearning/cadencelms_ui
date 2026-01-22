/**
 * ModuleProgress Component
 * Displays learner's progress within a module
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import type { ModuleAccess, ModuleAccessStatus } from '../model/types';
import { cn } from '@/shared/lib/utils';

interface ModuleProgressProps {
  access: ModuleAccess;
  className?: string;
  showDetails?: boolean;
}

export const ModuleProgress: React.FC<ModuleProgressProps> = ({
  access,
  className,
  showDetails = true,
}) => {
  const progressPercent =
    access.learningUnitsTotal > 0
      ? Math.round((access.learningUnitsCompleted / access.learningUnitsTotal) * 100)
      : 0;

  const StatusIcon = getStatusIcon(access.status);
  const statusColor = getStatusColor(access.status);

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{access.moduleTitle || 'Module'}</CardTitle>
          <Badge variant="outline" className={statusColor}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {getStatusLabel(access.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {access.learningUnitsCompleted} of {access.learningUnitsTotal} units completed
            </span>
          </div>
        </div>

        {showDetails && (
          <>
            {/* Access Statistics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  First Accessed
                </div>
                <div className="font-medium">
                  {access.firstAccessedAt
                    ? formatDate(access.firstAccessedAt)
                    : 'Not yet'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last Accessed
                </div>
                <div className="font-medium">
                  {access.lastAccessedAt
                    ? formatDate(access.lastAccessedAt)
                    : 'Not yet'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  Access Count
                </div>
                <div className="font-medium">{access.accessCount} times</div>
              </div>

              {access.completedAt && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </div>
                  <div className="font-medium">{formatDate(access.completedAt)}</div>
                </div>
              )}
            </div>

            {/* Started Learning Unit indicator */}
            {access.hasStartedLearningUnit && access.firstLearningUnitStartedAt && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-2 text-sm dark:border-blue-800 dark:bg-blue-950">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <PlayCircle className="h-4 w-4" />
                  Started learning on {formatDate(access.firstLearningUnitStartedAt)}
                </div>
              </div>
            )}

            {/* Not started warning */}
            {access.status === 'accessed' && !access.hasStartedLearningUnit && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-sm dark:border-amber-800 dark:bg-amber-950">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="h-4 w-4" />
                  Module opened but no content started yet
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

function getStatusIcon(status: ModuleAccessStatus): React.ComponentType<{ className?: string }> {
  switch (status) {
    case 'completed':
      return CheckCircle2;
    case 'in_progress':
      return PlayCircle;
    case 'accessed':
      return BookOpen;
    case 'not_accessed':
    default:
      return Clock;
  }
}

function getStatusColor(status: ModuleAccessStatus): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 border-green-600';
    case 'in_progress':
      return 'text-blue-600 border-blue-600';
    case 'accessed':
      return 'text-amber-600 border-amber-600';
    case 'not_accessed':
    default:
      return 'text-muted-foreground';
  }
}

function getStatusLabel(status: ModuleAccessStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in_progress':
      return 'In Progress';
    case 'accessed':
      return 'Accessed';
    case 'not_accessed':
    default:
      return 'Not Started';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
