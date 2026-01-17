/**
 * Course Analytics Page
 * Detailed analytics for courses including enrollment trends, completion rates,
 * average scores, time spent, and report exports
 */

import React, { useState } from 'react';
import { StatCard, LineChart, BarChart, PieChart } from '@/widgets/analytics';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useToast } from '@/shared/ui/use-toast';
import {
  Users,
  TrendingUp,
  Award,
  Clock,
  Download,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { exportAnalyticsReport, type AnalyticsExportData } from '@/shared/utils/exportUtils';

// Mock data - Replace with actual API calls
const mockCourses = [
  { id: '1', name: 'Introduction to React' },
  { id: '2', name: 'Advanced TypeScript' },
  { id: '3', name: 'Web Development Basics' },
  { id: '4', name: 'UI/UX Design Principles' },
];

const mockEnrollmentTrends = [
  { month: 'Jan', enrollments: 45, completions: 32, activeStudents: 38 },
  { month: 'Feb', enrollments: 52, completions: 38, activeStudents: 45 },
  { month: 'Mar', enrollments: 48, completions: 42, activeStudents: 48 },
  { month: 'Apr', enrollments: 65, completions: 48, activeStudents: 55 },
  { month: 'May', enrollments: 72, completions: 55, activeStudents: 62 },
  { month: 'Jun', enrollments: 68, completions: 58, activeStudents: 58 },
];

const mockCompletionData = [
  { name: 'Completed', value: 68 },
  { name: 'In Progress', value: 25 },
  { name: 'Not Started', value: 7 },
];

const mockScoreDistribution = [
  { range: '0-20', count: 2 },
  { range: '21-40', count: 5 },
  { range: '41-60', count: 12 },
  { range: '61-80', count: 28 },
  { range: '81-100', count: 45 },
];

const mockTimeSpentData = [
  { lesson: 'Lesson 1', avgTime: 45 },
  { lesson: 'Lesson 2', avgTime: 38 },
  { lesson: 'Lesson 3', avgTime: 52 },
  { lesson: 'Lesson 4', avgTime: 48 },
  { lesson: 'Lesson 5', avgTime: 55 },
];

export const CourseAnalyticsPage: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('1');
  const [timeRange, setTimeRange] = useState('6months');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);

    try {
      // Get selected course name
      const course = mockCourses.find(c => c.id === selectedCourse);

      // Prepare analytics data for export
      const analyticsData: AnalyticsExportData = {
        courseTitle: course?.name || 'Course Analytics',
        timeRange: getTimeRangeLabel(timeRange),
        metrics: {
          totalEnrollments: 198,
          completionRate: '68%',
          averageScore: '82.5',
          avgTimeSpent: '4.2h',
        },
        enrollmentTrends: mockEnrollmentTrends,
        completionData: mockCompletionData.map(item => ({
          status: item.name,
          count: item.value,
          percentage: `${item.value}%`,
        })),
        scoreDistribution: mockScoreDistribution,
      };

      // Export the report
      exportAnalyticsReport(analyticsData, format);

      toast({
        title: 'Export successful',
        description: `Analytics report has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export analytics report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getTimeRangeLabel = (range: string): string => {
    const labels: Record<string, string> = {
      '7days': 'Last 7 Days',
      '30days': 'Last 30 Days',
      '3months': 'Last 3 Months',
      '6months': 'Last 6 Months',
      '1year': 'Last Year',
    };
    return labels[range] || range;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Course Analytics"
        description="Detailed insights and performance metrics"
      >
        <Button
          variant="outline"
          onClick={() => handleExportReport('pdf')}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExportReport('csv')}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => handleExportReport('excel')}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Excel
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {mockCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Enrollments"
          value={198}
          description="from last period"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Completion Rate"
          value="68%"
          description="from last period"
          icon={Award}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Average Score"
          value="82.5"
          description="out of 100"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Avg. Time Spent"
          value="4.2h"
          description="per student"
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">
            <Users className="mr-2 h-4 w-4" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="completion">
            <Award className="mr-2 h-4 w-4" />
            Completion
          </TabsTrigger>
          <TabsTrigger value="scores">
            <BarChart3 className="mr-2 h-4 w-4" />
            Scores
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="mr-2 h-4 w-4" />
            Time Spent
          </TabsTrigger>
        </TabsList>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <LineChart
            title="Enrollment Trends"
            description="Monthly enrollment, completion, and active student statistics"
            data={mockEnrollmentTrends}
            lines={[
              { dataKey: 'enrollments', name: 'Enrollments', color: '#3b82f6' },
              { dataKey: 'completions', name: 'Completions', color: '#10b981' },
              { dataKey: 'activeStudents', name: 'Active Students', color: '#f59e0b' },
            ]}
            xAxisKey="month"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Summary</CardTitle>
                <CardDescription>Key enrollment statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Enrollments</span>
                  <span className="text-2xl font-bold">198</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Students</span>
                  <span className="text-2xl font-bold">58</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="text-2xl font-bold">135</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dropped</span>
                  <span className="text-2xl font-bold">5</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Enrollment Times</CardTitle>
                <CardDescription>Most popular enrollment periods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>May 2024</span>
                    <span className="font-medium">72 enrollments</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>April 2024</span>
                    <span className="font-medium">65 enrollments</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>June 2024</span>
                    <span className="font-medium">68 enrollments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Completion Tab */}
        <TabsContent value="completion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <PieChart
              title="Completion Status"
              description="Distribution of student completion status"
              data={mockCompletionData}
              colors={['#10b981', '#3b82f6', '#ef4444']}
            />

            <Card>
              <CardHeader>
                <CardTitle>Completion Insights</CardTitle>
                <CardDescription>Detailed completion metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Completion Rate</span>
                    <span className="text-sm font-bold">68%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: '68%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Average Time to Complete</span>
                    <span className="text-sm font-bold">4 weeks</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Drop-off Rate</span>
                    <span className="text-sm font-bold">2.5%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-red-500" style={{ width: '2.5%' }} />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Most students complete the course within 3-5 weeks
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-4">
          <BarChart
            title="Score Distribution"
            description="Number of students by score range"
            data={mockScoreDistribution}
            bars={[{ dataKey: 'count', name: 'Students', color: '#3b82f6' }]}
            xAxisKey="range"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">82.5</div>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Highest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">98</div>
                <p className="text-sm text-muted-foreground">achieved by 3 students</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">94%</div>
                <p className="text-sm text-muted-foreground">scored 60 or above</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Time Spent Tab */}
        <TabsContent value="time" className="space-y-4">
          <BarChart
            title="Average Time Spent per Lesson"
            description="How long students spend on each lesson (in minutes)"
            data={mockTimeSpentData}
            bars={[{ dataKey: 'avgTime', name: 'Minutes', color: '#8b5cf6' }]}
            xAxisKey="lesson"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time Analytics</CardTitle>
                <CardDescription>Overall time spent metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Course Time</span>
                  <span className="text-lg font-bold">4.2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average per Lesson</span>
                  <span className="text-lg font-bold">48 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Most Time Spent</span>
                  <span className="text-lg font-bold">Lesson 5 (55m)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Least Time Spent</span>
                  <span className="text-lg font-bold">Lesson 2 (38m)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Insights</CardTitle>
                <CardDescription>Student engagement patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Students typically spend more time on the later lessons, indicating higher
                  complexity or more engaging content.
                </p>
                <p className="text-sm">
                  Average session duration: <strong>35 minutes</strong>
                </p>
                <p className="text-sm">
                  Most active time: <strong>7-9 PM weekdays</strong>
                </p>
                <p className="text-sm">
                  Peak engagement day: <strong>Tuesday</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
