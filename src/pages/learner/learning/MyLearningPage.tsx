/**
 * MyLearningPage
 * Aggregate dashboard showing current learning activities across all enrolled courses
 * Route: /learner/learning
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useMyEnrollments } from '@/entities/enrollment';
import { useLearnerActivity } from '@/entities/learning-event';
import { useAuth } from '@/features/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Progress } from '@/shared/ui/progress';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Flame,
  CheckCircle2,
  PlayCircle,
  GraduationCap,
} from 'lucide-react';
import type { LearningEvent } from '@/entities/learning-event';

/**
 * Format duration in seconds to readable time string
 */
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  }
  return `${minutes}m`;
};

/**
 * Calculate current streak from events
 */
const calculateStreak = (events: LearningEvent[]): number => {
  if (events.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const uniqueDays = new Set<string>();
  events.forEach((event) => {
    const eventDate = new Date(event.timestamp);
    eventDate.setHours(0, 0, 0, 0);
    uniqueDays.add(eventDate.toISOString());
  });

  const sortedDays = Array.from(uniqueDays).sort().reverse();

  let streak = 0;
  let expectedDate = today;

  for (const day of sortedDays) {
    const dayDate = new Date(day);
    const diffDays = Math.floor((expectedDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak++;
      expectedDate = new Date(expectedDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (diffDays === 1) {
      streak++;
      expectedDate = dayDate;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Count lessons completed in the last 7 days
 */
const countLessonsThisWeek = (events: LearningEvent[]): number => {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return events.filter(
    (event) =>
      event.type === 'content_completed' &&
      new Date(event.timestamp) >= oneWeekAgo
  ).length;
};

/**
 * Format relative time
 */
const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

/**
 * Get activity description
 */
const getActivityDescription = (event: LearningEvent): string => {
  switch (event.type) {
    case 'content_completed':
      return `Completed ${event.content?.title || 'content'}`;
    case 'content_started':
      return `Started ${event.content?.title || 'content'}`;
    case 'assessment_completed':
      return `Completed assessment${event.score ? ` (${event.score}%)` : ''}`;
    case 'assessment_started':
      return 'Started assessment';
    case 'module_completed':
      return `Completed module: ${event.module?.title || 'module'}`;
    case 'course_completed':
      return 'Completed course';
    case 'enrollment':
      return 'Enrolled in course';
    default:
      return event.type.replace(/_/g, ' ');
  }
};

/**
 * Get activity icon
 */
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'content_completed':
    case 'module_completed':
    case 'course_completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'assessment_completed':
      return <GraduationCap className="h-4 w-4 text-blue-500" />;
    case 'enrollment':
      return <BookOpen className="h-4 w-4 text-primary" />;
    default:
      return <PlayCircle className="h-4 w-4 text-muted-foreground" />;
  }
};

export const MyLearningPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch enrollments
  const {
    data: enrollmentsData,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useMyEnrollments({
    status: 'active',
    limit: 50,
  });

  // Fetch recent activity (only if user is available)
  const {
    data: activityData,
    isLoading: activityLoading,
    error: activityError,
  } = useLearnerActivity(user?._id || '', {
    limit: 50,
  });

  const enrollments = enrollmentsData?.enrollments || [];
  const events = activityData?.events || [];
  const activitySummary = activityData?.summary || {};

  // Calculate stats
  const coursesInProgress = enrollments.filter(
    (e) => e.status === 'active' && e.progress.percentage > 0
  ).length;
  const lessonsThisWeek = countLessonsThisWeek(events);
  const totalTime = (activitySummary as any)?.totalStudyTime || 0;
  const currentStreak = calculateStreak(events);

  // Get active courses (only active status, sorted by last activity)
  const activeCourses = enrollments
    .filter((e) => e.status === 'active')
    .sort((a, b) => {
      const aTime = a.progress.lastActivityAt ? new Date(a.progress.lastActivityAt).getTime() : 0;
      const bTime = b.progress.lastActivityAt ? new Date(b.progress.lastActivityAt).getTime() : 0;
      return bTime - aTime;
    });

  // Get recent activities (limit to 10)
  const recentActivities = events.slice(0, 10);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Learning</h1>
        <p className="text-muted-foreground">
          Track your progress and continue your learning journey
        </p>
      </div>

      {/* Error State - Enrollments */}
      {enrollmentsError && (
        <Card className="border-destructive mb-6">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading learning data</p>
              <p className="text-sm mt-1">
                {enrollmentsError instanceof Error
                  ? enrollmentsError.message
                  : 'An error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {enrollmentsLoading ? (
        <div data-testid="loading-skeleton">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Quick Stats Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div
              data-testid="stats-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Courses in Progress */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Courses in Progress</p>
                      <p
                        data-testid="stat-courses-in-progress"
                        className="text-3xl font-bold mt-1"
                      >
                        {coursesInProgress}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              {/* Lessons This Week */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Lessons This Week</p>
                      <p
                        data-testid="stat-lessons-this-week"
                        className="text-3xl font-bold mt-1"
                      >
                        {lessonsThisWeek}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Total Time */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Time Spent Learning</p>
                      <p data-testid="stat-total-time" className="text-3xl font-bold mt-1">
                        {totalTime > 0 ? formatDuration(totalTime) : '0m'}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Current Streak */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                      <p data-testid="stat-current-streak" className="text-3xl font-bold mt-1">
                        {currentStreak}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">days</p>
                    </div>
                    <Flame className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Active Learning Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Active Learning</h2>

            {activeCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Courses</h3>
                    <p className="text-muted-foreground mb-4">
                      Start learning by enrolling in a course
                    </p>
                    <Button asChild>
                      <Link to="/learner/catalog">Browse Catalog</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeCourses.map((enrollment) => (
                  <Card key={enrollment.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {enrollment.target.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.target.code}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {enrollment.progress.percentage}%
                            </span>
                          </div>
                          <Progress value={enrollment.progress.percentage} />
                          <p className="text-xs text-muted-foreground mt-1">
                            {enrollment.progress.completedItems} of{' '}
                            {enrollment.progress.totalItems} items completed
                          </p>
                        </div>

                        {/* Last Activity */}
                        {enrollment.progress.lastActivityAt && (
                          <p className="text-xs text-muted-foreground">
                            Last accessed: {formatRelativeTime(enrollment.progress.lastActivityAt)}
                          </p>
                        )}

                        {/* Continue Button */}
                        <Button asChild className="w-full">
                          <Link to={`/learner/courses/${enrollment.target.id}/player`}>
                            Continue
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

            {activityError && (
              <Card className="border-destructive mb-4">
                <CardContent className="pt-6">
                  <div className="text-center text-destructive">
                    <p className="font-semibold">Error loading recent activity</p>
                    <p className="text-sm mt-1">
                      {activityError instanceof Error
                        ? activityError.message
                        : 'An error occurred'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activityLoading ? (
              <div data-testid="activity-loading">
                <Card>
                  <CardContent className="pt-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : recentActivities.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                    <p className="text-muted-foreground">
                      Your learning activities will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {recentActivities.map((event) => (
                      <div
                        key={event.id}
                        data-testid={`activity-item-${event.id}`}
                        className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                      >
                        <div className="mt-1">{getActivityIcon(event.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {getActivityDescription(event)}
                          </p>
                          {event.course && (
                            <p className="text-sm text-muted-foreground">
                              {event.course.title}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};
