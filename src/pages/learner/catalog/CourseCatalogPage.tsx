/**
 * CourseCatalogPage
 * Main course catalog page for learners to browse and discover courses
 */

import React, { useState } from 'react';
import { useCourses } from '@/entities/course';
import { CatalogSearch } from '@/features/catalog/ui/CatalogSearch';
import { ViewToggle, ViewMode } from '@/features/catalog/ui/ViewToggle';
import { CatalogFilters, CatalogFilterValues } from '@/features/catalog/ui/CatalogFilters';
import { CourseGrid } from '@/features/catalog/ui/CourseGrid';
import { CourseListView } from '@/features/catalog/ui/CourseListView';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';

export const CourseCatalogPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CatalogFilterValues>({});
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useCourses({
    status: 'published',
    search: searchQuery || undefined,
    department: filters.department,
    program: filters.program,
    sort: filters.sort || 'title:asc',
    page: currentPage,
    limit: 20,
  });

  const courses = data?.courses || [];
  const pagination = data?.pagination;

  const handleFilterChange = (newFilters: CatalogFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="Course Catalog"
        description="Browse and enroll in available courses"
        className="mb-8"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <CatalogFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Search and View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <CatalogSearch value={searchQuery} onSearch={handleSearchChange} />
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>

          {/* Results Count */}
          {!isLoading && pagination && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {courses.length} of {pagination.total} courses
            </div>
          )}

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
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-20 w-full mb-4" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && courses.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || Object.keys(filters).length > 0
                      ? 'Try adjusting your search or filters'
                      : 'No courses are currently available'}
                  </p>
                  {(searchQuery || Object.keys(filters).length > 0) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setFilters({});
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course List */}
          {!isLoading && !error && courses.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <CourseGrid courses={courses} />
              ) : (
                <CourseListView courses={courses} />
              )}
            </>
          )}

          {/* Pagination */}
          {!isLoading && !error && pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
