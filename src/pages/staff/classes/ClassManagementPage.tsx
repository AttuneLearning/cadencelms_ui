/**
 * Class Management Page - Staff view of all classes
 * Allows staff to view, filter, and manage their assigned classes
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClasses } from '@/entities/class/model/useClass';
import type { ClassStatus, ClassFilters } from '@/entities/class/model/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Search, Grid3x3, List, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { ClassCard } from '@/features/classes/ui/ClassCard';

export function ClassManagementPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ClassFilters>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useClasses(filters);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === 'all' ? undefined : (value as ClassStatus),
      page: 1,
    }));
  };

  const handleCourseFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      course: value === 'all' ? undefined : value,
      page: 1,
    }));
  };

  const handleViewClass = (classId: string) => {
    navigate(`/staff/classes/${classId}`);
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load classes. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Class Management"
        description="Manage your classes and student enrollments"
      />

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select onValueChange={handleStatusFilter} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Course Filter */}
          <Select onValueChange={handleCourseFilter} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Course">
              <SelectValue placeholder="Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {/* Course options would be populated from API */}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            data-state={viewMode === 'grid' ? 'on' : 'off'}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            data-state={viewMode === 'list' ? 'on' : 'off'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Classes Grid/List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading classes...</p>
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4'
                : 'space-y-4 mt-4'
            }
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      ) : data?.classes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No classes found matching your criteria.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          }
        >
          {data?.classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              viewMode={viewMode}
              onView={handleViewClass}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))
            }
            disabled={!data.pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
            }
            disabled={!data.pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
