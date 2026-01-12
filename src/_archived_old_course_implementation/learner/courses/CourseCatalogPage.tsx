/**
 * Course Catalog Page
 * Browse all available courses with search and filters
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '@/entities/course';
import { CourseList } from '@/entities/course/ui/CourseList';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';

export const CourseCatalogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch courses with filters
  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['courses', 'catalog', debouncedSearch, selectedLevel, selectedCategory, page],
    queryFn: () =>
      getCourses({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        level: selectedLevel !== 'all' ? selectedLevel : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: 'published',
      }),
  });

  const courses = coursesData?.data ?? [];
  const totalPages = coursesData?.meta?.totalPages ?? 1;
  const hasFilters = selectedLevel !== 'all' || selectedCategory !== 'all' || debouncedSearch;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedCategory('all');
    setPage(1);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
        <p className="text-muted-foreground">
          Explore and enroll in courses to advance your learning
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              {/* Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters Button */}
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}

              {/* Active Filters Display */}
              <div className="flex-1 flex flex-wrap gap-2 items-center justify-end">
                {debouncedSearch && (
                  <Badge variant="secondary">
                    Search: {debouncedSearch}
                  </Badge>
                )}
                {selectedLevel !== 'all' && (
                  <Badge variant="secondary">
                    Level: {selectedLevel}
                  </Badge>
                )}
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary">
                    Category: {selectedCategory}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {coursesData && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {courses.length} of {coursesData.meta?.totalCount ?? 0} courses
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load courses. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div className="aspect-video w-full">
                <Skeleton className="h-full w-full rounded-t-lg" />
              </div>
              <CardContent className="pt-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && courses.length > 0 && (
        <CourseList courses={courses} showEnrollmentCount variant="grid" />
      )}

      {/* Empty State */}
      {!isLoading && courses.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl font-medium mb-2">No courses found</p>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              {hasFilters
                ? 'Try adjusting your filters or search query'
                : 'No courses are currently available'}
            </p>
            {hasFilters && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && courses.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show first page, last page, current page, and pages around current
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    onClick={() => setPage(pageNum)}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return <span key={pageNum}>...</span>;
              }
              return null;
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
