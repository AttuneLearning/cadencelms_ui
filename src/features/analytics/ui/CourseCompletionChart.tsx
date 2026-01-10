/**
 * Course Completion Chart Component
 * Bar chart showing completion rates by course with trend line overlay
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart } from '@/widgets/analytics';
import { useEnrollments } from '@/entities/enrollment/hooks';
import type { AnalyticsFiltersType } from './types';

interface CourseCompletionChartProps {
  filters: AnalyticsFiltersType;
}

interface CourseMetrics {
  courseName: string;
  totalEnrolled: number;
  completed: number;
  completionRate: number;
  avgProgress: number;
}

export const CourseCompletionChart: React.FC<CourseCompletionChartProps> = ({ filters }) => {
  // Build query filters
  const queryFilters = useMemo(() => {
    const result: any = {};
    if (filters.courseId) result.course = filters.courseId;
    if (filters.classId) result.class = filters.classId;
    return result;
  }, [filters]);

  const { data: enrollmentsData, isLoading, isError } = useEnrollments(queryFilters);

  // Aggregate course metrics
  const courseMetrics = useMemo<CourseMetrics[]>(() => {
    if (!enrollmentsData?.enrollments) return [];

    const courseMap = new Map<string, CourseMetrics>();

    enrollmentsData.enrollments.forEach((enrollment: any) => {
      const courseId = enrollment.courseId || enrollment.course?.id;
      const courseName = enrollment.course?.title || 'Unknown Course';

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseName,
          totalEnrolled: 0,
          completed: 0,
          completionRate: 0,
          avgProgress: 0,
        });
      }

      const course = courseMap.get(courseId)!;
      course.totalEnrolled++;
      course.avgProgress += enrollment.progress || 0;
      if (enrollment.status === 'completed') {
        course.completed++;
      }
    });

    // Calculate averages and rates
    const metrics = Array.from(courseMap.values());
    metrics.forEach((course) => {
      course.avgProgress = course.avgProgress / course.totalEnrolled;
      course.completionRate = (course.completed / course.totalEnrolled) * 100;
    });

    // Sort by completion rate descending
    return metrics.sort((a, b) => b.completionRate - a.completionRate);
  }, [enrollmentsData]);

  // Transform data for chart
  const chartData = useMemo(() => {
    return courseMetrics.map((course) => ({
      name: course.courseName,
      completionRate: Math.round(course.completionRate),
      enrolled: course.totalEnrolled,
      completed: course.completed,
    }));
  }, [courseMetrics]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Completion Rates</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Completion Rates</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Error loading chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Completion Rates</CardTitle>
          <CardDescription>Completion rates by course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <BarChart
      title="Course Completion Rates"
      description="Percentage of students who completed each course"
      data={chartData}
      bars={[
        { dataKey: 'completionRate', name: 'Completion Rate (%)', color: '#10b981' },
      ]}
      xAxisKey="name"
    />
  );
};
