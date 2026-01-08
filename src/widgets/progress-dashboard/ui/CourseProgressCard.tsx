/**
 * CourseProgressCard Component
 * Displays progress for a single course in a card format
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ProgressBar } from '@/features/content-progress';
import { Clock, Calendar } from 'lucide-react';
import type { CourseProgress } from '@/entities/progress/model/types';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface CourseProgressCardProps {
  courseProgress: CourseProgress;
  className?: string;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  courseProgress,
  className,
}) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const isComplete = courseProgress.overallProgress >= 100;

  return (
    <Link to={`/courses/${courseProgress.courseId}`}>
      <Card
        className={cn(
          'h-full transition-shadow hover:shadow-lg',
          isComplete && 'border-green-200 dark:border-green-900',
          className
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2">{courseProgress.courseTitle}</CardTitle>
            {isComplete && (
              <Badge variant="default" className="bg-green-600 shrink-0">
                Complete
              </Badge>
            )}
          </div>
          <CardDescription>
            {courseProgress.completedLessons} of {courseProgress.totalLessons} lessons
            completed
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <ProgressBar
            progress={courseProgress.overallProgress}
            showPercentage
            showIcon
            variant={isComplete ? 'success' : 'default'}
          />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(courseProgress.timeSpent)}</span>
            </div>
            {courseProgress.lastAccessedAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(courseProgress.lastAccessedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Estimated Completion */}
          {!isComplete && courseProgress.estimatedCompletionDate && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Estimated completion:{' '}
                <span className="font-medium">
                  {new Date(courseProgress.estimatedCompletionDate).toLocaleDateString()}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
