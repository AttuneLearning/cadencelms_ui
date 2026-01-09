/**
 * ClassList Component
 * Displays a list/grid of classes with filtering
 */

import React, { useState } from 'react';
import { ClassCard } from './ClassCard';
import type { ClassListItem, ClassStatus } from '../model/types';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Search, Grid3x3, List as ListIcon } from 'lucide-react';

interface ClassListProps {
  classes: ClassListItem[];
  className?: string;
  isLoading?: boolean;
  onFilterChange?: (filters: {
    search?: string;
    status?: ClassStatus | 'all';
    term?: string;
    course?: string;
  }) => void;
  showFilters?: boolean;
  terms?: Array<{ id: string; name: string }>;
  courses?: Array<{ id: string; title: string; code: string }>;
}

type ViewMode = 'grid' | 'list';

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  className,
  isLoading = false,
  onFilterChange,
  showFilters = true,
  terms = [],
  courses = [],
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClassStatus | 'all'>('all');
  const [termFilter, setTermFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange?.({
      search: value || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      term: termFilter !== 'all' ? termFilter : undefined,
      course: courseFilter !== 'all' ? courseFilter : undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as ClassStatus | 'all';
    setStatusFilter(newStatus);
    onFilterChange?.({
      search: search || undefined,
      status: newStatus !== 'all' ? newStatus : undefined,
      term: termFilter !== 'all' ? termFilter : undefined,
      course: courseFilter !== 'all' ? courseFilter : undefined,
    });
  };

  const handleTermChange = (value: string) => {
    setTermFilter(value);
    onFilterChange?.({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      term: value !== 'all' ? value : undefined,
      course: courseFilter !== 'all' ? courseFilter : undefined,
    });
  };

  const handleCourseChange = (value: string) => {
    setCourseFilter(value);
    onFilterChange?.({
      search: search || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      term: termFilter !== 'all' ? termFilter : undefined,
      course: value !== 'all' ? value : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {showFilters && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Filter Classes</h3>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Term Filter */}
            {terms.length > 0 && (
              <Select value={termFilter} onValueChange={handleTermChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Course Filter */}
            {courses.length > 0 && (
              <Select value={courseFilter} onValueChange={handleCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-muted-foreground">No classes found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4'
          )}
        >
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              className={viewMode === 'list' ? 'w-full' : undefined}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {classes.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {classes.length} {classes.length === 1 ? 'class' : 'classes'}
        </div>
      )}
    </div>
  );
};
