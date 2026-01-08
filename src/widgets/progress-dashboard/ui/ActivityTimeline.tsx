/**
 * ActivityTimeline Component
 * Displays recent learning activity in a timeline format
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
import { CheckCircle2, PlayCircle, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'completed' | 'started' | 'in-progress';
  title: string;
  courseTitle?: string;
  timestamp: string;
  duration?: number;
  score?: number;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
  maxItems?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  className,
  maxItems = 10,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'completed':
        return CheckCircle2;
      case 'started':
        return PlayCircle;
      case 'in-progress':
        return Clock;
      default:
        return BookOpen;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'completed':
        return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'started':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getActivityLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'completed':
        return 'Completed';
      case 'started':
        return 'Started';
      case 'in-progress':
        return 'In Progress';
      default:
        return '';
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (displayActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your learning activity will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No activity yet. Start learning to see your progress here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest learning progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {displayActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const isLast = index === displayActivities.length - 1;

            return (
              <div key={activity.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                    getActivityColor(activity.type)
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className={cn('flex-1 pb-4', !isLast && 'border-b')}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {activity.title}
                      </h4>
                      {activity.courseTitle && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.courseTitle}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {getActivityLabel(activity.type)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                    {activity.duration && (
                      <>
                        <span>•</span>
                        <span>{formatDuration(activity.duration)}</span>
                      </>
                    )}
                    {activity.score !== undefined && (
                      <>
                        <span>•</span>
                        <span className="font-medium">Score: {activity.score}%</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export type { ActivityItem };
