/**
 * Staff Dashboard Page
 * Overview statistics, recent enrollments, course performance metrics, and quick actions
 * Updated: 2026-02-05 - Navigation Redesign Phase 3
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { StatCard, ProgressTable, LineChart } from '@/widgets/analytics';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { QuickActionsCard } from '@/features/quick-actions';
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';

// Mock data - Replace with actual API calls
const mockStats = {
  totalStudents: 1247,
  totalCourses: 42,
  averageCompletion: 68,
  totalCertificates: 856,
};

const mockTrends = [
  { name: 'Mon', enrollments: 24, completions: 12 },
  { name: 'Tue', enrollments: 32, completions: 18 },
  { name: 'Wed', enrollments: 28, completions: 15 },
  { name: 'Thu', enrollments: 35, completions: 20 },
  { name: 'Fri', enrollments: 42, completions: 25 },
  { name: 'Sat', enrollments: 18, completions: 10 },
  { name: 'Sun', enrollments: 15, completions: 8 },
];

const mockRecentEnrollments = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    course: 'Introduction to React',
    progress: 15,
    status: 'in-progress' as const,
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    course: 'Advanced TypeScript',
    progress: 0,
    status: 'not-started' as const,
    lastActivity: '1 day ago',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    course: 'Web Development Basics',
    progress: 45,
    status: 'in-progress' as const,
    lastActivity: '30 minutes ago',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    course: 'UI/UX Design Principles',
    progress: 100,
    status: 'completed' as const,
    lastActivity: '3 hours ago',
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    course: 'Introduction to React',
    progress: 78,
    status: 'in-progress' as const,
    lastActivity: '1 hour ago',
  },
];

export const StaffDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Staff Dashboard"
        description="Monitor student progress and course performance"
      >
        <Button variant="outline" asChild>
          <Link to="/staff/analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/staff/students">
            <Users className="mr-2 h-4 w-4" />
            View Students
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={mockStats.totalStudents}
          description="from last month"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Courses"
          value={mockStats.totalCourses}
          description="active courses"
          icon={BookOpen}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Avg. Completion"
          value={`${mockStats.averageCompletion}%`}
          description="from last month"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Certificates Issued"
          value={mockStats.totalCertificates}
          description="from last month"
          icon={Award}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <LineChart
          title="Enrollment Trends"
          description="Weekly enrollment and completion statistics"
          data={mockTrends}
          lines={[
            { dataKey: 'enrollments', name: 'Enrollments', color: '#3b82f6' },
            { dataKey: 'completions', name: 'Completions', color: '#10b981' },
          ]}
          xAxisKey="name"
        />

        {/* Quick Actions Card - Contextual verb-based actions */}
        <QuickActionsCard
          role="staff"
          title="Your Tasks"
          description="Items requiring your attention"
        />
      </div>

      {/* Recent Enrollments */}
      <ProgressTable
        title="Recent Enrollments"
        description="Latest student enrollments and their progress"
        data={mockRecentEnrollments}
      />

      {/* Performance by Course */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses with highest completion rates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/staff/analytics">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Web Development Basics', completion: 92, students: 245 },
              { name: 'Introduction to React', completion: 88, students: 198 },
              { name: 'UI/UX Design Principles', completion: 85, students: 167 },
              { name: 'Advanced TypeScript', completion: 78, students: 134 },
            ].map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{course.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {course.completion}% completed
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${course.completion}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {course.students} students
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
