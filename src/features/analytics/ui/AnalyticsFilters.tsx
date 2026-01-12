/**
 * Analytics Filters Component
 * Filter controls for date range, course, and class selection
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import type { AnalyticsFiltersType } from './types';

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onFiltersChange: (filters: AnalyticsFiltersType) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleDateRangeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: value as AnalyticsFiltersType['dateRange'],
    });
  };

  const handleCourseChange = (value: string) => {
    onFiltersChange({
      ...filters,
      courseId: value === 'all' ? undefined : value,
    });
  };

  const handleClassChange = (value: string) => {
    onFiltersChange({
      ...filters,
      classId: value === 'all' ? undefined : value,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select
              value={filters.dateRange || 'last30Days'}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger id="date-range">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last7Days">Last 7 Days</SelectItem>
                <SelectItem value="last30Days">Last 30 Days</SelectItem>
                <SelectItem value="last90Days">Last 90 Days</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={filters.courseId || 'all'}
              onValueChange={handleCourseChange}
            >
              <SelectTrigger id="course">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="course1">React Basics</SelectItem>
                <SelectItem value="course2">TypeScript Advanced</SelectItem>
                <SelectItem value="course3">Web Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={filters.classId || 'all'}
              onValueChange={handleClassChange}
            >
              <SelectTrigger id="class">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="class1">Class A</SelectItem>
                <SelectItem value="class2">Class B</SelectItem>
                <SelectItem value="class3">Class C</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
