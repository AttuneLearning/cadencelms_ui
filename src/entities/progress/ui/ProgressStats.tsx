/**
 * ProgressStats Component
 * Displays overall progress statistics for a user
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  Flame,
  Target,
} from 'lucide-react';
// Using LearnerProgress.summary for stats display
import type { LearnerProgress } from '../model/types';

type ProgressStatsType = LearnerProgress['summary'];
import { cn } from '@/shared/lib/utils';

interface ProgressStatsProps {
  stats: ProgressStatsType;
  className?: string;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({ stats, className }) => {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {/* Total Lessons Completed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
          <CardDescription className="text-xs">Total courses finished</CardDescription>
        </CardContent>
      </Card>

      {/* Total Time Spent */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTimeSpent(stats.totalTimeSpent)}</div>
          <CardDescription className="text-xs">Total learning time</CardDescription>
        </CardContent>
      </Card>

      {/* Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Award className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
          <CardDescription className="text-xs">Overall performance</CardDescription>
        </CardContent>
      </Card>

      {/* Programs Enrolled */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Programs</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.programsEnrolled}</div>
          <CardDescription className="text-xs">Programs enrolled</CardDescription>
        </CardContent>
      </Card>

      {/* Courses Completed */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
          <Target className="h-4 w-4 text-teal-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
          <CardDescription className="text-xs">Courses finished</CardDescription>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <CardDescription className="text-xs">
            Days (Longest: {stats.longestStreak})
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
};

// Detailed Stats Card Component
interface DetailedProgressStatsProps {
  stats: ProgressStatsType;
  className?: string;
}

export const DetailedProgressStats: React.FC<DetailedProgressStatsProps> = ({
  stats,
  className,
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Learning Statistics
        </CardTitle>
        <CardDescription>Your overall progress and achievements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>Lessons Completed</span>
            </div>
            <p className="text-3xl font-bold">{stats.coursesCompleted}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Total Time</span>
            </div>
            <p className="text-3xl font-bold">{formatTimeSpent(stats.totalTimeSpent)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span>Average Score</span>
            </div>
            <p className="text-3xl font-bold">{stats.averageScore.toFixed(1)}%</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Courses Completed</span>
            </div>
            <p className="text-3xl font-bold">{stats.coursesCompleted}</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Active Courses</span>
            </div>
            <span className="text-lg font-semibold">{stats.coursesEnrolled - stats.coursesCompleted}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Current Streak</span>
            </div>
            <span className="text-lg font-semibold">{stats.currentStreak} days</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-red-500" />
              <span>Longest Streak</span>
            </div>
            <span className="text-lg font-semibold">{stats.longestStreak} days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function
function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}
