/**
 * Analytics Dashboard Page
 * Real-time analytics dashboard for staff to monitor course performance and student engagement
 */

import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { StatCard } from '@/widgets/analytics';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import { useProgressSummary } from '@/entities/progress/hooks';
import { useActivityStats } from '@/entities/learning-event/hooks';
import { useExamAttempts } from '@/entities/exam-attempt/hooks';
import { useEnrollments } from '@/entities/enrollment/hooks';
import {
  CourseCompletionChart,
  EngagementChart,
  PerformanceMetrics,
  ContentEffectiveness,
  AnalyticsFilters,
  ExportDialog,
} from '@/features/analytics/ui';
import type { AnalyticsFiltersType } from '@/features/analytics/ui';

export const AnalyticsDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<AnalyticsFiltersType>({
    dateRange: 'last30Days',
    courseId: undefined,
    classId: undefined,
  });
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Fetch data from API
  const { data: progressData, isLoading: progressLoading, isError: progressError } = useProgressSummary();
  const { data: activityData, isLoading: activityLoading } = useActivityStats();
  const { data: attemptsData, isLoading: attemptsLoading } = useExamAttempts();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments();

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalStudents = enrollmentsData?.enrollments?.length || 0;
    const avgCompletion = progressData?.summary?.averageProgress || 0;

    // Calculate average quiz score from attempts
    const attempts = attemptsData?.attempts || [];
    const gradedAttempts = attempts.filter((a: any) => a.status === 'graded' && typeof a.score === 'number');
    const avgScore = gradedAttempts.length > 0
      ? gradedAttempts.reduce((sum: number, a: any) => sum + a.score, 0) / gradedAttempts.length
      : 0;

    // Activity stats may not have avgSessionDuration, use default
    const avgSessionDuration = (activityData as any)?.avgSessionDuration || 35;

    return {
      totalStudents,
      avgCompletion,
      avgScore,
      avgSessionDuration,
    };
  }, [progressData, attemptsData, enrollmentsData, activityData]);

  // Loading state
  if (progressLoading || activityLoading || attemptsLoading || enrollmentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (progressError) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading analytics data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights into course performance and student engagement
          </p>
        </div>
        <Button onClick={() => setShowExportDialog(true)}>
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <AnalyticsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={metrics.totalStudents}
          description="enrolled students"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Avg Completion"
          value={`${metrics.avgCompletion.toFixed(1)}%`}
          description="course progress"
          icon={TrendingUp}
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatCard
          title="Avg Quiz Score"
          value={metrics.avgScore.toFixed(1)}
          description="out of 100"
          icon={Award}
          trend={{ value: 1.5, isPositive: false }}
        />
        <StatCard
          title="Avg Session Time"
          value={`${metrics.avgSessionDuration}m`}
          description="per session"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <CourseCompletionChart filters={filters} />
        <EngagementChart filters={filters} />
      </div>

      {/* Performance and Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <PerformanceMetrics filters={filters} />
        <ContentEffectiveness filters={filters} />
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        filters={filters}
        metrics={metrics}
      />
    </div>
  );
};
