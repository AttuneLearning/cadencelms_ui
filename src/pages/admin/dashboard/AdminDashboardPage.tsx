/**
 * Admin Dashboard Page
 * Displays system overview, statistics, and recent activity
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { PageHeader } from '@/shared/ui/page-header';
import { Users, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  averageProgress: number;
}

// Map completion report response to dashboard stats
interface CompletionReportResponse {
  data?: {
    summary?: {
      totalLearners?: number;
      activeLearners?: number;
      totalCourses?: number;
      publishedCourses?: number;
      totalEnrollments?: number;
      averageCompletionRate?: number;
    };
  };
}

const fetchDashboardData = async (): Promise<DashboardStats> => {
  try {
    const response = await client.get<CompletionReportResponse>(endpoints.reports.completion);
    const summary = response.data?.data?.summary;
    return {
      totalUsers: summary?.totalLearners ?? 0,
      activeUsers: summary?.activeLearners ?? 0,
      totalCourses: summary?.totalCourses ?? 0,
      publishedCourses: summary?.publishedCourses ?? 0,
      totalEnrollments: summary?.totalEnrollments ?? 0,
      averageProgress: summary?.averageCompletionRate ?? 0,
    };
  } catch {
    // Return zeros if endpoint fails
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalCourses: 0,
      publishedCourses: 0,
      totalEnrollments: 0,
      averageProgress: 0,
    };
  }
};

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'completion'],
    queryFn: fetchDashboardData,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of your learning management system"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          description={`${stats?.activeUsers || 0} active users`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses}
          description={`${stats?.publishedCourses || 0} published`}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Enrollments"
          value={stats?.totalEnrollments}
          description="All time enrollments"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Average Progress"
          value={stats?.averageProgress ? `${stats.averageProgress}%` : undefined}
          description="Across all courses"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link to="/admin/users">
            <Button variant="outline" className="h-auto w-full flex-col items-start gap-2 p-4">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Manage Users</div>
                <div className="text-sm text-muted-foreground">
                  Create, edit, and manage user accounts
                </div>
              </div>
            </Button>
          </Link>
          <Link to="/admin/courses">
            <Button variant="outline" className="h-auto w-full flex-col items-start gap-2 p-4">
              <BookOpen className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Manage Courses</div>
                <div className="text-sm text-muted-foreground">
                  Create, edit, and publish courses
                </div>
              </div>
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" className="h-auto w-full flex-col items-start gap-2 p-4">
              <Activity className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">View Reports</div>
                <div className="text-sm text-muted-foreground">
                  Analytics and detailed reports
                </div>
              </div>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value?: number | string;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, isLoading }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
