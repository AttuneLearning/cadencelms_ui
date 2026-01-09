/**
 * Learner Dashboard Page
 * Shows enrolled courses, learning statistics, and recent activity
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { enrollmentApi } from '@/entities/enrollment/api/enrollmentApi';
import { CourseList } from '@/entities/course/ui/CourseList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { BookOpen, Clock, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import type { CourseListItem } from '@/entities/course/model/types';

export const DashboardPage: React.FC = () => {
  // Fetch enrolled courses
  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
  } = useQuery({
    queryKey: ['enrollments', 'my'],
    queryFn: () => enrollmentApi.getMyEnrollments({ limit: 6, status: 'active' }),
  });

  // Fetch enrollment statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['enrollments', 'stats'],
    queryFn: () => enrollmentApi.getStats(),
  });

  // Transform enrollments to course list items
  const enrolledCourses: CourseListItem[] = React.useMemo(() => {
    if (!enrollmentsData?.data) return [];
    return enrollmentsData.data.map((enrollment) => ({
      _id: enrollment.course._id,
      title: enrollment.course.title,
      shortDescription: enrollment.course.shortDescription,
      thumbnail: enrollment.course.thumbnail,
      duration: enrollment.course.duration,
      level: enrollment.course.level,
      lessonCount: enrollment.course.lessonCount,
      isEnrolled: true,
      progress: enrollment.progress,
    }));
  }, [enrollmentsData]);

  // Get in-progress courses (courses with progress > 0 and < 100)
  const inProgressCourses = React.useMemo(() => {
    return enrolledCourses.filter(
      (course) => course.progress !== undefined && course.progress > 0 && course.progress < 100
    );
  }, [enrolledCourses]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Learning Dashboard</h1>
        <p className="text-muted-foreground">
          Track your learning progress and continue where you left off
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Courses"
          value={stats?.activeEnrollments ?? 0}
          icon={BookOpen}
          isLoading={isLoadingStats}
          error={statsError}
        />
        <StatCard
          title="Completed Courses"
          value={stats?.completedEnrollments ?? 0}
          icon={Award}
          isLoading={isLoadingStats}
          error={statsError}
        />
        <StatCard
          title="Total Enrollments"
          value={stats?.totalEnrollments ?? 0}
          icon={TrendingUp}
          isLoading={isLoadingStats}
          error={statsError}
        />
        <StatCard
          title="Average Progress"
          value={`${Math.round(stats?.averageProgress ?? 0)}%`}
          icon={Clock}
          isLoading={isLoadingStats}
          error={statsError}
        />
      </div>

      {/* Continue Learning Section */}
      {inProgressCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Continue Learning</h2>
          </div>
          <CourseList courses={inProgressCourses} showProgress variant="grid" />
        </section>
      )}

      {/* All Enrolled Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">My Courses</h2>
          <Button asChild variant="outline">
            <Link to="/learner/courses">Browse All Courses</Link>
          </Button>
        </div>

        {enrollmentsError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load enrolled courses. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoadingEnrollments ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : enrolledCourses.length > 0 ? (
          <CourseList courses={enrolledCourses} showProgress variant="grid" />
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No enrolled courses yet</p>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Button asChild>
                <Link to="/learner/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Activity Section - Placeholder for future implementation */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>
              Your recent learning activities will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No recent activity to display
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
  error: Error | null;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, isLoading, error }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : error ? (
          <span className="text-sm text-destructive">Error</span>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
};
