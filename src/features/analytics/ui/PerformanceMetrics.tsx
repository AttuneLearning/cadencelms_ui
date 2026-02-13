/**
 * Performance Metrics Component
 * Shows average quiz scores, pass/fail rates, and score distribution
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { BarChart } from '@/widgets/analytics';
import { useExamAttempts } from '@/entities/exam-attempt/hooks';
import type { AnalyticsFiltersType } from './types';

interface PerformanceMetricsProps {
  filters: AnalyticsFiltersType;
}

interface CoursePerformance {
  courseId: string;
  courseName: string;
  avgScore: number;
  passRate: number;
  totalAttempts: number;
  highestScore: number;
  lowestScore: number;
}

const PASS_THRESHOLD = 60;

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ filters }) => {
  // Build query filters
  const queryFilters = useMemo(() => {
    const result: any = { status: 'graded' };
    if (filters.courseId) result.courseId = filters.courseId;
    return result;
  }, [filters]);

  const { data: attemptsData, isLoading, isError } = useExamAttempts(queryFilters);

  // Aggregate performance metrics
  const performanceMetrics = useMemo<CoursePerformance[]>(() => {
    if (!attemptsData?.attempts) return [];

    const courseMap = new Map<string, {
      courseName: string;
      scores: number[];
      passedCount: number;
      totalCount: number;
    }>();

    attemptsData.attempts.forEach((attempt: any) => {
      if (typeof attempt.score !== 'number') return;

      const courseId =
        attempt.courseId ||
        attempt.courseContexts?.[0]?.courseId ||
        attempt.examId ||
        'unknown';
      const courseName =
        attempt.courseName ||
        attempt.courseContexts?.[0]?.courseName ||
        attempt.examTitle ||
        'Unknown Course';

      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          courseName,
          scores: [],
          passedCount: 0,
          totalCount: 0,
        });
      }

      const course = courseMap.get(courseId)!;
      course.scores.push(attempt.score);
      course.totalCount++;
      if (attempt.score >= PASS_THRESHOLD) {
        course.passedCount++;
      }
    });

    // Calculate metrics
    const metrics = Array.from(courseMap.entries()).map(([courseId, data]) => {
      const avgScore = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length;
      const passRate = (data.passedCount / data.totalCount) * 100;
      const highestScore = Math.max(...data.scores);
      const lowestScore = Math.min(...data.scores);

      return {
        courseId,
        courseName: data.courseName,
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        totalAttempts: data.totalCount,
        highestScore,
        lowestScore,
      };
    });

    return metrics.sort((a, b) => b.avgScore - a.avgScore);
  }, [attemptsData]);

  // Score distribution
  const scoreDistribution = useMemo(() => {
    if (!attemptsData?.attempts) return [];

    const ranges = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
    ];

    attemptsData.attempts.forEach((attempt: any) => {
      if (typeof attempt.score !== 'number') return;

      const range = ranges.find((r) => attempt.score >= r.min && attempt.score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [attemptsData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Loading metrics data...</CardDescription>
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
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-destructive">Error loading metrics data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (performanceMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Quiz scores and pass rates</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Average scores, pass rates, and distribution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course Performance Summary */}
        <div className="space-y-4">
          {performanceMetrics.map((course) => (
            <div key={course.courseId} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{course.courseName}</h4>
                <span className="text-sm text-muted-foreground">
                  {course.totalAttempts} attempts
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Avg Score</p>
                  <p className="text-lg font-bold">{course.avgScore}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pass Rate</p>
                  <p className="text-lg font-bold">{course.passRate}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Range</p>
                  <p className="text-lg font-bold">
                    {course.lowestScore}-{course.highestScore}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Score Distribution Chart */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-4">Score Distribution</h4>
          <BarChart
            title=""
            description=""
            data={scoreDistribution}
            bars={[{ dataKey: 'count', name: 'Students', color: '#3b82f6' }]}
            xAxisKey="range"
          />
        </div>
      </CardContent>
    </Card>
  );
};
