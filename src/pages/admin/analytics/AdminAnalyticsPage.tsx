/**
 * Admin Analytics Page (ISS-014 / UI-ISS-127)
 * System-wide analytics and metrics with summary cards, trends, and recent activity
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  Activity,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatCard {
  label: string;
  value: string;
  change: number; // percentage change from previous period
  icon: React.ElementType;
}

interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
  type: 'enrollment' | 'completion' | 'certificate' | 'user';
}

// ---------------------------------------------------------------------------
// Hook — placeholder data until a real API is available
// ---------------------------------------------------------------------------

function useAnalyticsData() {
  const stats: StatCard[] = [
    { label: 'Total Users', value: '1,247', change: 12.5, icon: Users },
    { label: 'Active Courses', value: '34', change: 8.3, icon: BookOpen },
    { label: 'Completion Rate', value: '73%', change: 4.2, icon: GraduationCap },
    { label: 'Certificates Issued', value: '892', change: 15.1, icon: Award },
    { label: 'Avg. Completion Time', value: '4.2 hrs', change: -6.8, icon: Clock },
    { label: 'Active Enrollments', value: '2,156', change: 9.7, icon: Activity },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      description: 'Jane Smith completed "Safety Fundamentals"',
      timestamp: '2 minutes ago',
      type: 'completion',
    },
    {
      id: '2',
      description: 'Certificate issued to Mark Johnson for "Compliance 101"',
      timestamp: '15 minutes ago',
      type: 'certificate',
    },
    {
      id: '3',
      description: '12 new enrollments in "Leadership Basics"',
      timestamp: '1 hour ago',
      type: 'enrollment',
    },
    {
      id: '4',
      description: '5 new users added to Engineering department',
      timestamp: '2 hours ago',
      type: 'user',
    },
    {
      id: '5',
      description: 'Alex Rivera completed "Advanced React Patterns"',
      timestamp: '3 hours ago',
      type: 'completion',
    },
    {
      id: '6',
      description: 'Certificate issued to Sarah Chen for "Data Privacy"',
      timestamp: '4 hours ago',
      type: 'certificate',
    },
    {
      id: '7',
      description: '8 new enrollments in "Onboarding Program"',
      timestamp: '5 hours ago',
      type: 'enrollment',
    },
  ];

  return { stats, recentActivity, isLoading: false };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTIVITY_ICONS: Record<ActivityItem['type'], React.ElementType> = {
  enrollment: BookOpen,
  completion: GraduationCap,
  certificate: Award,
  user: Users,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const AdminAnalyticsPage: React.FC = () => {
  const { stats, recentActivity, isLoading } = useAnalyticsData();

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <PageHeader
          title="System Analytics"
          description="System-wide analytics and performance metrics"
        />
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="System Analytics"
        description="System-wide analytics and performance metrics"
      />

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <TrendIcon
                    className={`h-3 w-3 ${
                      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  />
                  <span
                    className={
                      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {isPositive ? '+' : ''}{stat.change}%
                  </span>
                  <span className="text-muted-foreground">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {recentActivity.map((item) => {
              const Icon = ACTIVITY_ICONS[item.type];
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
