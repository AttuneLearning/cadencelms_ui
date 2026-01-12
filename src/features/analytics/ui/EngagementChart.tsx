/**
 * Engagement Chart Component
 * Line chart showing active students over time and engagement metrics
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { LineChart } from '@/widgets/analytics';
import { useLearningEvents } from '@/entities/learning-event/hooks';
import { format, parseISO, subDays } from 'date-fns';
import type { AnalyticsFiltersType } from './types';

interface EngagementChartProps {
  filters: AnalyticsFiltersType;
}

interface DailyEngagement {
  date: string;
  activeStudents: number;
  totalEvents: number;
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ filters }) => {
  // Build query filters with date range
  const queryFilters = useMemo(() => {
    const result: any = {};

    if (filters.courseId) result.course = filters.courseId;
    if (filters.classId) result.class = filters.classId;

    // Add date range
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        result.startDate = format(now, 'yyyy-MM-dd');
        break;
      case 'last7Days':
        result.startDate = format(subDays(now, 7), 'yyyy-MM-dd');
        break;
      case 'last30Days':
      default:
        result.startDate = format(subDays(now, 30), 'yyyy-MM-dd');
        break;
      case 'last90Days':
        result.startDate = format(subDays(now, 90), 'yyyy-MM-dd');
        break;
      case 'lastYear':
        result.startDate = format(subDays(now, 365), 'yyyy-MM-dd');
        break;
      case 'custom':
        if (filters.startDate) result.startDate = filters.startDate;
        if (filters.endDate) result.endDate = filters.endDate;
        break;
    }

    return result;
  }, [filters]);

  const { data: eventsData, isLoading, isError } = useLearningEvents(queryFilters);

  // Aggregate engagement by date
  const engagementData = useMemo<DailyEngagement[]>(() => {
    if (!eventsData?.events) return [];

    const dateMap = new Map<string, Set<string>>();
    const eventCountMap = new Map<string, number>();

    eventsData.events.forEach((event: any) => {
      const date = format(parseISO(event.timestamp || event.createdAt), 'yyyy-MM-dd');
      const learnerId = event.learnerId || event.userId;

      // Track unique users per day
      if (!dateMap.has(date)) {
        dateMap.set(date, new Set());
        eventCountMap.set(date, 0);
      }

      dateMap.get(date)!.add(learnerId);
      eventCountMap.set(date, (eventCountMap.get(date) || 0) + 1);
    });

    // Convert to array and sort by date
    const result = Array.from(dateMap.entries())
      .map(([date, users]) => ({
        date,
        activeStudents: users.size,
        totalEvents: eventCountMap.get(date) || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  }, [eventsData]);

  // Transform data for chart (last 30 days for better visualization)
  const chartData = useMemo(() => {
    return engagementData.slice(-30).map((item) => ({
      date: format(parseISO(item.date), 'MMM dd'),
      activeStudents: item.activeStudents,
      events: item.totalEvents,
    }));
  }, [engagementData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Engagement</CardTitle>
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
          <CardTitle>Student Engagement</CardTitle>
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
          <CardTitle>Student Engagement</CardTitle>
          <CardDescription>Active students over time</CardDescription>
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
    <LineChart
      title="Student Engagement"
      description="Active students and events over time"
      data={chartData}
      lines={[
        { dataKey: 'activeStudents', name: 'Active Students', color: '#3b82f6' },
        { dataKey: 'events', name: 'Total Events', color: '#f59e0b' },
      ]}
      xAxisKey="date"
    />
  );
};
