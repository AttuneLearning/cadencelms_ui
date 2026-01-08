/**
 * ProgressDashboard Component
 * Main dashboard widget combining stats, course progress, and activity
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { ProgressStats } from './ProgressStats';
import { CourseProgressCard } from './CourseProgressCard';
import { ActivityTimeline, type ActivityItem } from './ActivityTimeline';
import { progressApi } from '@/entities/progress/api/progressApi';
import type { CourseProgress } from '@/entities/progress/model/types';
import { cn } from '@/shared/lib/utils';

interface ProgressDashboardProps {
  userId?: string;
  courseProgresses?: CourseProgress[];
  activities?: ActivityItem[];
  className?: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userId,
  courseProgresses,
  activities = [],
  className,
}) => {
  // Fetch overall stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['progress-stats', userId],
    queryFn: () => progressApi.getStats(),
    enabled: !!userId,
  });

  if (isLoadingStats) {
    return (
      <div className={cn('flex items-center justify-center p-12', className)}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Progress</h3>
          <p className="text-sm text-muted-foreground">
            We couldn't load your progress data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Statistics */}
      <ProgressStats stats={stats} />

      {/* Course Progress Cards */}
      {courseProgresses && courseProgresses.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courseProgresses.map((courseProgress) => (
              <CourseProgressCard
                key={courseProgress.courseId}
                courseProgress={courseProgress}
              />
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {activities.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActivityTimeline activities={activities} maxItems={10} />
          </div>
          <div>
            {/* Additional widgets can go here */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Lessons</span>
                    <span className="font-medium">{stats.totalLessonsCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Courses Active</span>
                    <span className="font-medium">{stats.coursesInProgress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Courses Done</span>
                    <span className="font-medium">{stats.coursesCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-medium">{stats.averageScore.toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
