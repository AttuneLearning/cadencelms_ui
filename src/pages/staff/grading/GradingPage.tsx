/**
 * Grading Dashboard Page
 * Main page for staff to view and grade student submissions
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExamAttempts } from '@/entities/exam-attempt/hooks/useExamAttempts';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { SubmissionList } from '@/features/grading/ui/SubmissionList';
import { BulkGradingDialog } from '@/features/grading/ui/BulkGradingDialog';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import type { AttemptStatus } from '@/entities/exam-attempt/model/types';
import { useDebounce } from '@/shared/hooks/useDebounce';

export function GradingPage() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkGrading, setShowBulkGrading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AttemptStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      limit,
      sort: '-submittedAt',
    };

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    return params;
  }, [page, limit, statusFilter, debouncedSearch]);

  // Fetch attempts
  const { data, isLoading, error } = useExamAttempts(queryParams);

  const handleViewSubmission = (attemptId: string) => {
    navigate(`/staff/grading/${attemptId}`);
  };

  const handleSelectSubmission = (attemptId: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, attemptId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== attemptId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && data?.attempts) {
      setSelectedIds(data.attempts.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkGrade = () => {
    setShowBulkGrading(true);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedIds([]); // Clear selection when changing pages
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Grading Dashboard"
        description="Review and grade student submissions"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter submissions by status and search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, exam title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as AttemptStatus | 'all')}
            >
              <SelectTrigger className="w-full md:w-[200px]" aria-label="Status filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="grading">Grading</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedIds.length} selected</Badge>
                <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                  Clear
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkGrade}>
                  Bulk Grade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="text-center mt-4 text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading submissions. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* Submissions List */}
      {!isLoading && !error && data && (
        <>
          {data.attempts.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No submissions found</p>
                  <p className="text-sm mt-2">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SubmissionList
              attempts={data.attempts}
              selectedIds={selectedIds}
              onSelect={handleSelectSubmission}
              onSelectAll={handleSelectAll}
              onViewSubmission={handleViewSubmission}
            />
          )}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!data.pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!data.pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Bulk Grading Dialog */}
      <BulkGradingDialog
        open={showBulkGrading}
        onOpenChange={setShowBulkGrading}
        attemptIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([]);
          setShowBulkGrading(false);
        }}
      />
    </div>
  );
}
