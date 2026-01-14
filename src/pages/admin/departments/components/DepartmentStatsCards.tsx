/**
 * Department Statistics Cards
 * Displays key metrics across staff, programs, courses, and enrollments
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Users, BookOpen, GraduationCap, TrendingUp, Loader2 } from 'lucide-react';
import type { DepartmentStats } from '@/entities/department';

interface DepartmentStatsCardsProps {
  stats: DepartmentStats | undefined;
  isLoading?: boolean;
}

export const DepartmentStatsCards: React.FC<DepartmentStatsCardsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Staff Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.staff.total}</div>
          <div className="text-xs text-muted-foreground mt-3 space-y-1">
            <div className="flex justify-between">
              <span>Content Admins:</span>
              <span className="font-medium">{stats.staff.byRole.contentAdmin}</span>
            </div>
            <div className="flex justify-between">
              <span>Instructors:</span>
              <span className="font-medium">{stats.staff.byRole.instructor}</span>
            </div>
            <div className="flex justify-between">
              <span>Observers:</span>
              <span className="font-medium">{stats.staff.byRole.observer}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="font-medium text-green-600">{stats.staff.active}</span>
            </div>
            <div className="flex justify-between">
              <span>Inactive:</span>
              <span className="font-medium text-gray-500">{stats.staff.inactive}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Programs</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.programs.total}</div>
          <div className="text-xs text-muted-foreground mt-3 space-y-1">
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="font-medium text-green-600">{stats.programs.active}</span>
            </div>
            <div className="flex justify-between">
              <span>Inactive:</span>
              <span className="font-medium text-gray-500">{stats.programs.inactive}</span>
            </div>
            <div className="flex justify-between">
              <span>Archived:</span>
              <span className="font-medium text-gray-400">{stats.programs.archived}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Courses</CardTitle>
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.courses.total}</div>
          <div className="text-xs text-muted-foreground mt-3 space-y-1">
            <div className="flex justify-between">
              <span>Published:</span>
              <span className="font-medium text-green-600">{stats.courses.published}</span>
            </div>
            <div className="flex justify-between">
              <span>Draft:</span>
              <span className="font-medium text-yellow-600">{stats.courses.draft}</span>
            </div>
            <div className="flex justify-between">
              <span>Archived:</span>
              <span className="font-medium text-gray-400">{stats.courses.archived}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.enrollments.active}</div>
          <p className="text-xs text-muted-foreground">Active enrollments</p>
          <div className="text-xs text-muted-foreground mt-3 space-y-1">
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{stats.enrollments.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-medium text-green-600">{stats.enrollments.completed}</span>
            </div>
            <div className="flex justify-between">
              <span>Withdrawn:</span>
              <span className="font-medium text-red-600">{stats.enrollments.withdrawn}</span>
            </div>
          </div>
          {stats.enrollments.newThisPeriod > 0 && (
            <div className="text-xs mt-3 pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New this period:</span>
                <span className="font-medium text-primary">
                  +{stats.enrollments.newThisPeriod}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
