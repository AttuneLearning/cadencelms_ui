/**
 * ProgressStats Component
 * Displays overall progress statistics in cards
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
  Trophy,
  TrendingUp,
  Target,
  Flame,
} from 'lucide-react';
import type { ProgressStats as ProgressStatsType } from '@/entities/progress/model/types';
import { cn } from '@/shared/lib/utils';

interface ProgressStatsProps {
  stats: ProgressStatsType;
  className?: string;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({ stats, className }) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const statCards = [
    {
      title: 'Lessons Completed',
      value: stats.totalLessonsCompleted,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Time Spent Learning',
      value: formatTime(stats.totalTimeSpent),
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore.toFixed(0)}%`,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: 'Courses In Progress',
      value: stats.coursesInProgress,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Courses Completed',
      value: stats.coursesCompleted,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      description: `Longest: ${stats.longestStreak} days`,
    },
  ];

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={cn('p-2 rounded-lg', stat.bgColor)}>
              <stat.icon className={cn('h-4 w-4', stat.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.description && (
              <CardDescription className="text-xs mt-1">
                {stat.description}
              </CardDescription>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
