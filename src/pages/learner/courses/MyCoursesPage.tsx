/**
 * MyCoursesPage
 * Display learner's enrolled courses with progress
 */

import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useMyEnrollments } from '@/entities/enrollment';
import { EnrolledCourseCard } from '@/features/courses/ui/EnrolledCourseCard';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { BookOpen, Search as SearchIcon } from 'lucide-react';
import type { EnrollmentStatus } from '@/entities/enrollment';

type FilterStatus = 'all' | 'in-progress' | 'not-started' | 'completed';

// Error Boundary to catch and display errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MyCoursesPage] Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Page</h2>
            <p className="text-red-700 mb-4">
              {this.state.error?.message || 'An unknown error occurred'}
            </p>
            <pre className="text-sm bg-red-100 p-4 rounded overflow-auto">
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const MyCoursesPageInner: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('enrolledAt:desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Map filter status to API status
  const getApiStatus = (): EnrollmentStatus | undefined => {
    if (filterStatus === 'completed') return 'completed';
    if (filterStatus === 'in-progress') return 'active';
    return undefined;
  };

  const { data, isLoading, error } = useMyEnrollments({
    status: getApiStatus(),
    sort: sortBy,
    page: currentPage,
    limit: 12,
  });

  // Debug logging
  console.log('[MyCoursesPage] Render state:', {
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    hasData: !!data,
    enrollmentsCount: data?.enrollments?.length || 0,
    data,
  });

  const enrollments = data?.enrollments || [];
  const pagination = data?.pagination;

  // Client-side filter for "not-started" and search
  const filteredEnrollments = enrollments.filter((enrollment) => {
    // Filter by status
    if (filterStatus === 'not-started') {
      if (!(enrollment.progress.percentage === 0 && enrollment.status === 'active')) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = enrollment.target.name.toLowerCase().includes(query);
      const matchesCode = enrollment.target.code.toLowerCase().includes(query);
      return matchesTitle || matchesCode;
    }

    return true;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value as FilterStatus);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-muted-foreground">
          Track your learning progress and continue where you left off
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Status Filter Tabs */}
        <Tabs value={filterStatus} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="not-started">Not Started</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="sm:w-64">
            <Label htmlFor="sort-select" className="sr-only">
              Sort by
            </Label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger id="sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrolledAt:desc">Enrollment Date (Newest)</SelectItem>
                <SelectItem value="enrolledAt:asc">Enrollment Date (Oldest)</SelectItem>
                <SelectItem value="progress.lastActivityAt:desc">Last Accessed</SelectItem>
                <SelectItem value="progress.percentage:desc">Progress (High to Low)</SelectItem>
                <SelectItem value="progress.percentage:asc">Progress (Low to High)</SelectItem>
                <SelectItem value="target.name:asc">Title (A-Z)</SelectItem>
                <SelectItem value="target.name:desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading courses</p>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div data-testid="loading-skeleton">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredEnrollments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterStatus !== 'all'
                  ? 'No courses found'
                  : "You haven't enrolled in any courses yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start learning by enrolling in a course'}
              </p>
              <Button asChild>
                <Link to="/learner/catalog">Browse Catalog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Grid */}
      {!isLoading && !error && filteredEnrollments.length > 0 && (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEnrollments.length} of {pagination?.total || 0} courses
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <EnrolledCourseCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Export with error boundary
export const MyCoursesPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <MyCoursesPageInner />
    </ErrorBoundary>
  );
};
