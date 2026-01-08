/**
 * ProgressCard Component
 * Displays detailed progress for a lesson or course
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  XCircle,
  PlayCircle,
  Minus,
} from 'lucide-react';
import type { LessonProgress } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ProgressCardProps {
  progress: LessonProgress;
  className?: string;
  showDetails?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  className,
  showDetails = true,
}) => {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{progress.lessonTitle}</CardTitle>
            <CardDescription className="mt-1">
              {progress.lastAccessedAt && (
                <span className="text-xs">
                  Last accessed {formatDistanceToNow(new Date(progress.lastAccessedAt), { addSuffix: true })}
                </span>
              )}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(progress.status)}>
            {getStatusIcon(progress.status)}
            {getStatusLabel(progress.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Progress</span>
            </div>
            <span className="font-medium">{progress.progress}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        {showDetails && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Score */}
            {typeof progress.score === 'number' && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Award className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-medium">{progress.score}%</p>
                </div>
              </div>
            )}

            {/* Time Spent */}
            {typeof progress.timeSpent === 'number' && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Spent</p>
                  <p className="font-medium">{formatTimeSpent(progress.timeSpent)}</p>
                </div>
              </div>
            )}

            {/* Attempts */}
            {typeof progress.attempts === 'number' && progress.attempts > 0 && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <PlayCircle className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Attempts</p>
                  <p className="font-medium">{progress.attempts}</p>
                </div>
              </div>
            )}

            {/* Completed Date */}
            {progress.completedAt && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xs font-medium">
                    {formatDistanceToNow(new Date(progress.completedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper functions
function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'secondary';
    case 'in-progress':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'not-started':
      return 'outline';
    default:
      return 'outline';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="mr-1 h-3 w-3" />;
    case 'in-progress':
      return <PlayCircle className="mr-1 h-3 w-3" />;
    case 'failed':
      return <XCircle className="mr-1 h-3 w-3" />;
    case 'not-started':
      return <Minus className="mr-1 h-3 w-3" />;
    default:
      return null;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'in-progress':
      return 'In Progress';
    case 'failed':
      return 'Failed';
    case 'not-started':
      return 'Not Started';
    default:
      return status;
  }
}

function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
