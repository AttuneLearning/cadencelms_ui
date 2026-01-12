/**
 * StudentDetailView Component
 * Comprehensive student information display with progress details
 */

import React from 'react';
import { differenceInDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Calendar,
} from 'lucide-react';
import type { LearnerProgress } from '@/entities/progress/model/types';

export interface StudentDetailViewProps {
  studentId: string;
  data?: LearnerProgress;
  isLoading: boolean;
}

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No data available for this student.</p>
      </div>
    );
  }

  const isAtRisk = () => {
    const daysSinceActivity = data.summary.lastActivityAt
      ? differenceInDays(new Date(), new Date(data.summary.lastActivityAt))
      : 999;
    const avgScore = data.summary.averageScore;

    return daysSinceActivity > 7 || avgScore < 60;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {getInitials(data.learnerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{data.learnerName}</h2>
                <p className="text-muted-foreground">{data.learnerEmail}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Joined {new Date(data.summary.joinedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {isAtRisk() && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                At Risk
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.coursesCompleted} / {data.summary.coursesEnrolled}
            </div>
            <p className="text-xs text-muted-foreground">courses completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.averageScore}</div>
            <p className="text-xs text-muted-foreground">across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(data.summary.totalTimeSpent / 3600)}
            </div>
            <p className="text-xs text-muted-foreground">hours learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalCreditsEarned}</div>
            <p className="text-xs text-muted-foreground">total credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Programs */}
          {data.programProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Programs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.programProgress.map((program) => (
                  <div key={program.programId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{program.programName}</h4>
                        <p className="text-sm text-muted-foreground">{program.programCode}</p>
                      </div>
                      <Badge variant={getStatusColor(program.status)}>
                        {getStatusLabel(program.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{program.completionPercent}%</span>
                    </div>
                    <Progress value={program.completionPercent} className="h-2" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Credits</span>
                      <span className="font-medium">
                        {program.creditsEarned} / {program.creditsRequired}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {data.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Award className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          {data.courseProgress.map((course) => (
            <Card key={course.courseId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{course.courseTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">{course.courseCode}</p>
                  </div>
                  <Badge variant={getStatusColor(course.status)}>
                    {getStatusLabel(course.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{course.completionPercent}%</span>
                  </div>
                  <Progress value={course.completionPercent} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Score</p>
                    <p className="font-semibold text-lg">
                      {course.score !== null ? course.score : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Credits</p>
                    <p className="font-semibold text-lg">{course.creditsEarned}</p>
                  </div>
                </div>
                {course.completedAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Completed {new Date(course.completedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((activity, index) => (
                  <div key={index} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{activity.resourceTitle}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {data.recentActivity.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
