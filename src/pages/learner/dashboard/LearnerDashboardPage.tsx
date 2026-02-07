/**
 * Learner Dashboard Page
 * Main landing page for learners after login
 * Updated: 2026-02-05 - Navigation Redesign Phase 4
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/model/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { QuickActionsCard } from '@/features/quick-actions';
import { useMyEnrollments } from '@/entities/enrollment/hooks/useEnrollments';
import { useCertificates } from '@/entities/certificate/hooks/useCertificates';
import {
  BookOpen,
  Award,
  TrendingUp,
  ArrowRight,
  Play,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';

// ============================================================================
// Stat Card with Loading State
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// Continue Learning Section
// ============================================================================

interface ContinueLearningProps {
  enrollments: {
    id: string;
    target: { id: string; name: string };
    progress: { percentage: number; lastActivityAt?: string | null };
  }[];
  isLoading: boolean;
}

const ContinueLearning: React.FC<ContinueLearningProps> = ({ enrollments, isLoading }) => {
  const inProgressCourses = enrollments.filter(
    (e) => e.progress.percentage > 0 && e.progress.percentage < 100
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (inProgressCourses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
          <CardDescription>Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't have any courses in progress.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/learner/catalog">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Course Catalog
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/learner/classes">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {inProgressCourses.slice(0, 3).map((enrollment) => (
          <div key={enrollment.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate flex-1">
                {enrollment.target.name}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {enrollment.progress.percentage}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${enrollment.progress.percentage}%` }}
                />
              </div>
              <Button variant="ghost" size="sm" className="h-6 px-2" asChild>
                <Link to={`/learner/courses/${enrollment.target.id}/player`}>
                  <Play className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Recent Activity Section
// ============================================================================

interface RecentActivityProps {
  enrollments: {
    id: string;
    target: { id: string; name: string };
    progress: { lastActivityAt?: string | null };
    enrolledAt: string;
  }[];
  isLoading: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ enrollments, isLoading }) => {
  // Sort by last activity or enrolled date
  const sortedEnrollments = [...enrollments].sort((a, b) => {
    const dateA = a.progress.lastActivityAt || a.enrolledAt;
    const dateB = b.progress.lastActivityAt || b.enrolledAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (sortedEnrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity to display.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest learning activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedEnrollments.slice(0, 5).map((enrollment) => (
          <div key={enrollment.id} className="flex items-center gap-3 text-sm">
            <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="flex-1 truncate">{enrollment.target.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(enrollment.progress.lastActivityAt || enrollment.enrolledAt)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const LearnerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch enrollments for stats and display
  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
  } = useMyEnrollments({ status: 'active', limit: 20 });

  // Fetch certificates count
  const {
    data: certificatesData,
    isLoading: isLoadingCertificates,
  } = useCertificates({ limit: 1 }); // Just need the total count

  // Calculate stats from enrollment data
  const stats = React.useMemo(() => {
    if (!enrollmentsData) {
      return {
        activeCourses: 0,
        completedCourses: 0,
        hoursStudied: 0,
        averageProgress: 0,
      };
    }

    const enrollments = enrollmentsData.enrollments;
    const inProgress = enrollments.filter(
      (e) => e.progress.percentage > 0 && e.progress.percentage < 100
    );
    const completed = enrollments.filter((e) => e.progress.percentage === 100);

    // Calculate average progress
    const totalProgress = enrollments.reduce(
      (sum, e) => sum + e.progress.percentage,
      0
    );
    const averageProgress =
      enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

    return {
      activeCourses: inProgress.length,
      completedCourses: completed.length,
      hoursStudied: 0, // TODO: Get from progress summary when available
      averageProgress,
    };
  }, [enrollmentsData]);

  const isLoading = isLoadingEnrollments || isLoadingCertificates;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.firstName || 'Learner'}!`}
        description="Here's your learning overview"
      />

      {/* Error State */}
      {enrollmentsError && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              Failed to load dashboard data. Please refresh the page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          description={stats.activeCourses === 0 ? 'No active enrollments' : 'In progress'}
          icon={BookOpen}
          isLoading={isLoading}
        />
        <StatCard
          title="Completed Courses"
          value={stats.completedCourses}
          description={stats.completedCourses === 0 ? 'No completions yet' : 'Well done!'}
          icon={Award}
          isLoading={isLoading}
        />
        <StatCard
          title="Certificates"
          value={certificatesData?.pagination.total ?? 0}
          description="Earned achievements"
          icon={Award}
          isLoading={isLoadingCertificates}
        />
        <StatCard
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          description="Across all courses"
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Continue Learning */}
        <ContinueLearning
          enrollments={enrollmentsData?.enrollments ?? []}
          isLoading={isLoadingEnrollments}
        />

        {/* Quick Actions */}
        <QuickActionsCard
          role="learner"
          title="Quick Actions"
          description="Tasks and shortcuts"
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        enrollments={enrollmentsData?.enrollments ?? []}
        isLoading={isLoadingEnrollments}
      />
    </div>
  );
};
